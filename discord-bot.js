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
import { UserDatabase } from './helpers/userDatabase.js';
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
  new SlashCommandBuilder().setName('elleo-ping').setDescription('Replies with Pong!'),
  new SlashCommandBuilder().setName('elleo-emoji').setDescription('Replies with an emoji!'),
  new SlashCommandBuilder()
    .setName('elleo-clear-history')
    .setDescription('Clear the chat history!'),
  new SlashCommandBuilder()
    .setName('elleo-timezone')
    .setDescription('Configure your timezone.')
    .addStringOption((option) =>
      option
        .setName('timezone')
        .setDescription(
          'Your current timezone: "America/New_York". See more: https://timezonedb.com/time-zones'
        )
        .setRequired(true)
    )
].map((command) => command.toJSON());

client.once('ready', async () => {
  console.log(`Bot is ready as ${client.user.tag}`);

  // Registrar comandos aqui, pois client.application.id estará disponível
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('Refreshing application commands...');
    await rest.put(
      Routes.applicationCommands(client.application.id), // Para comandos globais
      // Routes.applicationGuildCommands(client.application.id, 'GUILD_ID'), // Para uma guilda específica
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

  if (commandName === 'elleo-ping') {
    await interaction.reply('Pong!');
  } else if (commandName === 'elleo-emoji') {
    await interaction.reply('<:elleobot:1295449209197166613>');
  } else if (commandName === 'elleo-clear-history') {
    // userDatabase.clearUserHistory(interaction.user.id);
    await interaction.reply('Chat history cleared!');
  } else if (commandName === 'elleo-timezone') {
    const timezone = interaction.options.getString('timezone');
    //userDatabase.updateUser(interaction.user.id, { timezone });
    await interaction.reply(`Your timezone has been set to: ${timezone}`);
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
  await message.reply(botResponse);
});

client.login(process.env.DISCORD_TOKEN);
