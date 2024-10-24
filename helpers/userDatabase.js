import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

const filePath = path.join(process.cwd(), 'data/storage.json');
const adapter = new JSONFile(filePath);
const db = new Low(adapter, {});

async function initializeDatabase() {
  await db.read();

  if (!db.data.users) {
    db.data = { users: [] };
    await db.write();
  }
}

(async () => {
  await initializeDatabase();
})();

export class UserDatabase {
  async addUser(id, data) {
    db.data.users.push({ id, ...data });
    await db.write();
  }

  getUserById(id) {
    return db.data.users.find((user) => user.id === id);
  }

  getUserByThreadId(threadId) {
    return db.data.users.find((user) => user.thread_id === threadId);
  }

  async updateUser(id, newData) {
    const user = this.getUserById(id);
    if (user) {
      user.data = { ...user.data, ...newData };
      await db.write();
    }
  }

  async removeUser(id) {
    db.data.users = db.data.users.filter((user) => user.id !== id);
    await db.write();
  }

  getAllUsers() {
    return db.data.users;
  }
}
