const OpenAI = require("openai");
const dotenv = require("dotenv");
dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getBotResponse(conversationHistory) {
  try {
    const response = await client.chat.completions.create({
      model: process.env.FINE_TUNED_MODEL,
      messages: conversationHistory,
      temperature: 0.9
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Erro ao obter resposta:", error.response ? error.response.data : error.message);
    return "Erro ao obter resposta do bot.";
  }
}

module.exports = {
  getBotResponse,
};
