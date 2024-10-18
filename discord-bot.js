const { Client, SlashCommandBuilder, Events, GatewayIntentBits, Partials, ChannelType } = require("discord.js");
const { getBotResponse } = require("./openaiBot");
const { getUserHistory, updateUserHistory } = require("./historyHelper");
const { systemPrompt } = require("./prompt");
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

client.once(Events.ClientReady, (c) => {
  console.log(`Bot is ready as ${c.user.id} :: ${c.user.username} [${c.user.tag}]`);

  const ping = new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong!");

  const emoji = new SlashCommandBuilder()
    .setName("emoji")
    .setDescription("Replies with an emoji!");

  client.application.commands.create(ping);
  client.application.commands.create(emoji);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    console.log("ping");
    await interaction.reply("Pong!");
  }

  if (commandName === "emoji") {
    console.log("emoji");
    await interaction.reply("<:elleobot:1295449209197166613>");
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  // accept only DMs (for now)
  if (message.channel.type !== ChannelType.DM) return;

  console.log("message from author:", message.author.id);

  const userHistory = getUserHistory(message.author.id, systemPrompt);
  userHistory.push({ role: "user", content: message.content });

  const botResponse = await getBotResponse(userHistory);
  message.reply(botResponse);
  userHistory.push({ role: "assistant", content: botResponse });

  updateUserHistory(message.author.id, message.content, botResponse);
});

client.login(process.env.DISCORD_TOKEN);
