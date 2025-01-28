import {
  Client,
  SlashCommandBuilder,
  GatewayIntentBits,
  Partials,
  ChannelType,
  REST,
  Routes
} from 'discord.js';
import {
  createThread,
  runThread,
  addMessageToThread,
  getThreadMessages
} from './helpers/openai.js';
import { UserDatabase } from './helpers/user.js';
import { scheduleTasks } from './helpers/scheduler.js';
import dotenv from 'dotenv';
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel, Partials.Message]
});

const userDatabase = new UserDatabase();

const commands = [
  new SlashCommandBuilder().setName('settings').setDescription('See your settings.'),
  new SlashCommandBuilder().setName('clear-history').setDescription('Clear the chat history!'),
  new SlashCommandBuilder()
    .setName('timezone')
    .setDescription('Configure your timezone.')
    .addStringOption((option) =>
      option
        .setName('timezone')
        .setDescription(
          'Your timezone (e.g., America/New_York). Full list: https://shorturl.at/3dl2r'
        )
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('language')
    .setDescription('Configure your preferred language.')
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Your language (e.g., en). Full list: https://shorturl.at/Nwa7j')
        .setRequired(true)
    )
].map((command) => command.toJSON());

client.once('ready', async () => {
  console.log(`Bot is ready as ${client.user.tag}`);
  console.log('Guilds:');
  client.guilds.cache.forEach((guild) => {
    console.log(`- ${guild.name} (${guild.id})`);
  });

  scheduleTasks(client);

  // Registrar comandos aqui, pois client.application.id estará disponível
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Refreshing application commands...');
    await rest.put(
      //Routes.applicationCommands(client.application.id), // Para comandos globais
      Routes.applicationGuildCommands(client.application.id, process.env.GUILD_ID), // Para uma guilda específica
      { body: commands }
    );
    console.log('Successfully reloaded application commands.');
  } catch (error) {
    console.error('Error while reloading application commands:', error);
  }
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;
  const userId = interaction.user.id;
  const user = await userDatabase.getUserById(userId);

  if (commandName === 'clear-history') {
    userDatabase.clearUserHistory(userId);
    await interaction.reply('Chat history cleared!');
  } else if (commandName === 'timezone') {
    const timezone = interaction.options.getString('timezone');
    userDatabase.updateUser(userId, { timezone });
    await interaction.reply(`Your timezone has been set to: ${timezone}`);
  } else if (commandName === 'language') {
    const language = interaction.options.getString('language');
    await userDatabase.updateUser(userId, { language });
    await interaction.reply(`Your preferred language has been set to: ${language}`);
  } else if (commandName === 'settings') {
    const userTimezone = user?.timezone || 'Not set';
    const userLanguage = user?.language || 'Not set';

    await interaction.reply(
      `Your current settings:\n- Timezone: ${userTimezone}\n- Language: ${userLanguage}`
    );
  }
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  if (message.channel.type !== ChannelType.DM) return;

  await message.channel.sendTyping();

  const userId = message.author.id;
  const threadId = await createThread(userId);

  await addMessageToThread(threadId, message.content);
  await runThread(threadId);

  const messages = await getThreadMessages(threadId, 1);
  const botResponse = messages.data[0].content[0].text.value;
  message.channel.send(botResponse);
});

client.login(process.env.DISCORD_TOKEN);
