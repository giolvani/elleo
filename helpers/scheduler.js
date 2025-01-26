import schedule from 'node-schedule';
import logger from './logger.js';
import { sendMessage } from './messages.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Agenda mensagens automáticas para todos os usuários e mensagens programadas.
 */
export async function scheduleTasks(client) {
  try {
    const users = await prisma.user.findMany({
      where: {
        //active: true, // Somente usuários ativos
        timezone: { not: null } // Apenas usuários com timezone configurado
      }
    });

    const scheduledMessages = await prisma.scheduledMessage.findMany();

    users.forEach((user) => {
      scheduledMessages.forEach(({ time, message }) => {
        const [hour, minute] = time.split(':');
        const timezone = user.timezone;

        schedule.scheduleJob({ hour, minute, tz: timezone }, () => {
          sendMessage(user.id, message, client);
        });
      });

      schedule.scheduleJob({ hour: 15, minute: 57, tz: 'America/Sao_Paulo' }, () => {
        sendMessage(
          user.id,
          'How’s your day going? Remember to take a break and enjoy your meal!',
          client
        );
      });
    });

    logger.info('All tasks have been scheduled successfully!');
  } catch (error) {
    console.log('Error scheduling tasks:', error);
  }
}
