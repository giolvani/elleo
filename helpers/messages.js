import logger from './logger.js';
import { getConfigValue } from './config.js';
import { runThread, addMessageToThread, getThreadMessages } from './openai.js';
import { UserDatabase } from './user.js';

/**
 * Envia uma mensagem privada para um usuário do Discord.
 * @param {string} userId - ID do usuário.
 * @param {string} message - Mensagem a ser enviada.
 */
export async function sendMessage(userId, period, instruction, client) {
  logger.info(`Started sending message to user ${userId}`);

  try {
    const userDatabase = new UserDatabase();

    const channelUser = await client.users.fetch(userId);
    const user = await userDatabase.getUserById(userId);

    if (channelUser && user) {
      const prompt = await getConfigValue('general_prompt');
      const populatedPrompt = prompt
        .replace('${period}', period)
        .replace('${instruction}', instruction);

      await addMessageToThread(user.threadId, populatedPrompt, true);
      await runThread(user.threadId);

      const allThreadMessages = await getThreadMessages(user.threadId, 1);
      const botResponse = allThreadMessages.data[0].content[0].text.value;

      await channelUser.send(botResponse);
      logger.info(`Message sent to ${channelUser.id}`);
    }
  } catch (error) {
    logger.error(
      `Error sending message to user: ${JSON.stringify(error, null, 2)}, Stack: ${error.stack}`
    );
    console.error(`Failed to send message to user ${userId}:`, error.message, error.stack);
  }
}
