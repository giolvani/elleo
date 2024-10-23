import { createThread, runThread, addMessageToThread, getThreadMessages } from "./helpers/openai.js";
import logger from "./helpers/logger.js";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

(async () => {
  const userId = "console_user";

  const threadId = await createThread(userId);
  const messages = await getThreadMessages(threadId, 100, "asc");

  messages.data.forEach(message => {
    console.log(`${message.role === "user" ? "You" : "Elleo"}: ${message.content[0].text.value}`, "\n");
  });

  while (true) {
    const userInput = await new Promise((resolve) => {
      rl.question("You: ", resolve);
    });

    if (["sair", "exit", "quit"].includes(userInput.toLowerCase())) {
      logger.info("Encerrando a conversa.");
      console.log("Encerrando a conversa.");
      rl.close();
      break;
    }

    if (["limpar", "clear"].includes(userInput.toLowerCase())) {
      historyManager.clearUserHistory(userId);
      logger.info("Histórico de conversa limpo.");
      console.log("Histórico de conversa limpo.");
      history = await historyManager.getUserHistory(userId);
      continue;
    }

    logger.info(`Input from user ${userId}`);
    await addMessageToThread(threadId, userInput);
    await runThread(threadId);

    const messages = await getThreadMessages(threadId, 1);
    console.log(`\nElleo: ${messages.data[0].content[0].text.value}\n`);
    logger.info('Bot response');
  }
})();
