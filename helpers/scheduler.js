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
        onboarding: true,
        timezone: { not: null }
      }
    });

    const scheduledMessages = await prisma.scheduledMessage.findMany();

    users.forEach((user) => {
      scheduledMessages.forEach(({ time, instruction, period }) => {
        const [hour, minute] = time.split(':');
        const timezone = user.timezone;

        schedule.scheduleJob({ hour, minute, tz: timezone }, () => {
          sendMessage(user.id, period, instruction, client);
        });
      });

      logger.info(`Scheduled messages for user ${user.id} have been scheduled successfully!`);
    });

    logger.info('All tasks have been scheduled successfully!');
  } catch (error) {
    console.log('Error scheduling tasks:', error);
  }
}
