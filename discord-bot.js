const { Client, SlashCommandBuilder, Events, GatewayIntentBits, Partials, ChannelType } = require("discord.js");
const { getBotResponse } = require("./helpers/openai");
const ChatHistory = require("./helpers/history");
const dotenv = require("dotenv");
dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
  ]
});

const historyManager = new ChatHistory();

client.once(Events.ClientReady, (c) => {
  console.log(`Bot is ready as ${c.user.id} :: ${c.user.username} [${c.user.tag}]`);

  const ping = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");

  const emoji = new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Replies with an emoji!");

  const clearUserHistory = new SlashCommandBuilder()
    .setName("clear-history")
    .setDescription("Clear the chat history!");

  client.application.commands.create(ping);
  client.application.commands.create(emoji);
  client.application.commands.create(clearUserHistory);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  }

  if (commandName === "emoji") {
    await interaction.reply("<:elleobot:1295449209197166613>");
  }

  if (commandName === "clear-history") {
    historyManager.clearUserHistory(interaction.user.id);
    await interaction.reply("Histórico de conversa limpo!");
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // accept only DMs (for now)
  if (message.channel.type !== ChannelType.DM) return;

  const userId = message.author.id;
  let history = await historyManager.getUserHistory(userId);

  historyManager.addUserMessage(userId, message.content);

  const botResponse = await getBotResponse(history);
  message.reply(botResponse);
  historyManager.addAssistantMessage(userId, botResponse);
});

client.login(process.env.DISCORD_TOKEN);
