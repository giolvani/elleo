const { getBotResponse } = require("./helpers/openai");
const { getUserHistory, updateUserHistory, clearUserHistory } = require("./helpers/history");
const { getSystemPrompt } = require("./helpers/prompt");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const userId = "console_user";
  const systemPrompt = await getSystemPrompt();

  let {history, isFirstInteraction} = getUserHistory(userId, systemPrompt);

  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question("You: ", resolve);
    });

    if (["sair", "exit", "quit"].includes(userInput.toLowerCase())) {
      console.log("Encerrando a conversa.");
      rl.close();
      break;
    }

    if (["clear", "limpar"].includes(userInput.toLowerCase())) {
      clearUserHistory(userId);
      console.log("Histórico de conversa limpo.");
      continue;
    }

    if (!isFirstInteraction) {
      history.push({ role: "system", content: "Continue the conversation from where we left off. Do not repeat the initial greeting or restart. Maintain the flow and context based on the previous interactions." });
    }

    history.push({ role: "user", content: userInput });

    const botResponse = await getBotResponse(history);
    console.log("Bot:", botResponse, "\n");
    history.push({ role: "assistant", content: botResponse });

    updateUserHistory(userId, userInput, botResponse);
  }
})();