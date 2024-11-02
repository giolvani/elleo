import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import path from 'path';

const filePath = path.join(process.cwd(), 'data/storage.json');
const adapter = new JSONFile(filePath);
const db = new Low(adapter, {});

export class UserDatabase {
  constructor() {
    this.initialized = this.initializeDatabase();
  }

  async initializeDatabase() {
    await db.read();

    if (!db.data || !db.data.users) {
      db.data = { users: [] };
      await db.write();
    }
  }

  async addUser(id, data) {
    await this.initialized;
    db.data.users.push({ id, ...data });
    await db.write();
  }

  async getUserById(id) {
    await this.initialized;
    return db.data.users.find((user) => user.id === id);
  }

  async getUserByThreadId(threadId) {
    await this.initialized;
    return db.data.users.find((user) => user.thread_id === threadId);
  }

  async updateUser(id, newData) {
    await this.initialized;
    const user = await this.getUserById(id);
    if (user) {
      user.data = { ...user.data, ...newData };
      await db.write();
    }
  }

  async removeUser(id) {
    await this.initialized;
    db.data.users = db.data.users.filter((user) => user.id !== id);
    await db.write();
  }

  async getAllUsers() {
    await this.initialized;
    return db.data.users;
  }

  async backupUserId(id) {
    await this.initialized;
    const user = await this.getUserById(id);
    if (user) {
      const currentDate = new Date().toISOString();
      const newId = `${user.id}_backup_${currentDate}`;
      user.id = newId;
      await db.write();
      return newId;
    }
    return null;
  }
}
