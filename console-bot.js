import { createThread, runThread, addMessageToThread, getThreadMessages } from "./helpers/openai.js";
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
    const userMessageInput = await new Promise((resolve) => {
      rl.question("You: ", resolve);
    });

    if (["sair", "exit", "quit"].includes(userMessageInput.toLowerCase())) {
      console.log("Encerrando a conversa.");
      rl.close();
      break;
    }

    if (["limpar", "clear"].includes(userMessageInput.toLowerCase())) {
      historyManager.clearUserHistory(userId);
      console.log("Histórico de conversa limpo.");
      history = await historyManager.getUserHistory(userId);
      continue;
    }

    await addMessageToThread(threadId, userMessageInput);
    await runThread(threadId);
    const messages = await getThreadMessages(threadId, 1);
    console.log(`\nElleo: ${messages.data[0].content[0].text.value}\n`);
  }
})();
