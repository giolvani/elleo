/**
 * Envia uma mensagem privada para um usuário do Discord.
 * @param {string} userId - ID do usuário.
 * @param {string} message - Mensagem a ser enviada.
 */
export async function sendMessage(userId, message, client) {
  try {
    const user = await client.users.fetch(userId);
    if (user) {
      await user.send(message);
      console.log(`Message sent to ${user.tag}: ${message}`);
    }
  } catch (error) {
    console.error(`Failed to send message to user ${userId}:`, error.message);
  }
}
