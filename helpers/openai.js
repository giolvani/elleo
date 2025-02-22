import OpenAI from 'openai';
import logger from './logger.js';
import dotenv from 'dotenv';
import { UserDatabase } from './user.js';

dotenv.config();

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function createThread(userId) {
  try {
    let threadId = null;

    const userDatabase = new UserDatabase();
    const user = await userDatabase.getUserById(userId);

    if (!user || !user.threadId) {
      const newThread = await client.beta.threads.create({
        metadata: {
          user_id: userId
        }
      });

      logger.info(`New thread created for user ${userId}: ${newThread.id}`);

      if (!user) {
        await userDatabase.addUser(userId, { threadId: newThread.id });
      } else {
        await userDatabase.updateUser(userId, { threadId: newThread.id });
      }

      threadId = newThread.id;
    } else {
      logger.info(`Thread already exists for user ${userId}: ${user.threadId}`);
      threadId = user.threadId;
    }

    return threadId;
  } catch (error) {
    logger.error(
      'Error creating thread: ' + (error.response ? error.response.data : error.message)
    );
    throw error;
  }
}

export async function addMessageToThread(threadId, userMessage, instructional = false) {
  try {
    const userDatabase = new UserDatabase();
    const user = await userDatabase.getUserByThreadId(threadId);

    if (!user) {
      throw new Error('User not found');
    }

    const message = await client.beta.threads.messages.create(threadId, {
      role: 'user',
      content: userMessage,
      metadata: {
        user_id: user.id,
        instructional: instructional ? 'true' : 'false',
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`Message sent to user ${user.id} in thread ${threadId}: ${message.id}`);
    return message;
  } catch (error) {
    logger.error(
      `Error sending message to user ${user.id} in thread ${threadId}: ${error.response ? error.response.data : error.message}`
    );
    throw error;
  }
}

export async function getThreadMessage(threadId, messageId) {
  try {
    logger.info(`Retrieving message ${messageId} from thread ${threadId}`);
    return await client.beta.threads.messages.retrieve(threadId, messageId);
  } catch (error) {
    logger.error(
      'Error getting thread message: ' + (error.response ? error.response.data : error.message)
    );
    throw error;
  }
}

export async function getThreadMessages(threadId, limit = 20, order = 'desc') {
  try {
    logger.info(
      `Retrieving messages from thread ${threadId} with limit ${limit} and order ${order}`
    );
    return await client.beta.threads.messages.list(threadId, { query: { limit, order } });
  } catch (error) {
    if (error.status === 404) {
      logger.error('Thread not found');
      return null;
    }

    logger.error(
      'Error getting thread messages: ' + (error.response ? error.response.data : error.message)
    );
    throw error;
  }
}

export async function deleteThreadMessage(threadId, messageId) {
  try {
    logger.info(`Deleting message ${messageId} from thread ${threadId}`);
    return await client.beta.threads.messages.del(threadId, messageId);
  } catch (error) {
    logger.error(
      'Error deleting thread message: ' + (error.response ? error.response.data : error.message)
    );
    throw error;
  }
}

export async function runThread(threadId) {
  try {
    const userDatabase = new UserDatabase();
    const user = await userDatabase.getUserByThreadId(threadId);

    logger.info(`Running thread ${threadId}`);
    const run = await client.beta.threads.runs.create(threadId, {
      assistant_id: process.env.ASSISTANT_ID,
      metadata: {
        user_id: user.id
      }
    });

    logger.info(`Retrieving run ${run.id} from thread ${threadId}`);
    let retrieve = await client.beta.threads.runs.retrieve(threadId, run.id);

    while (['queued', 'in_progress', 'cancelling'].includes(retrieve.status)) {
      await sleep(1000);
      await new Promise((resolve) => setTimeout(resolve, 400));
      retrieve = await client.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (retrieve.status === 'completed') {
      return run;
    } else {
      throw new Error(`Thread ${threadId} finished with status ${retrieve.status}`);
    }
  } catch (error) {
    logger.error('Error running thread: ' + (error.response ? error.response.data : error.message));
    throw error;
  }
}
