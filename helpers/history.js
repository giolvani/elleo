// import fs from 'fs';
// import path from 'path';
// import logger from './logger.js';
// import { getSystemPrompt } from './prompt.js';
// import dotenv from 'dotenv';
// dotenv.config();

// class ChatHistory {
//   constructor() {
//     this.historyFilePath = path.join(process.cwd(), process.env.HISTORY_FILE_PATH);
//     this.history = this.loadHistory();
//   }

//   loadHistory() {
//     if (!fs.existsSync(this.historyFilePath)) {
//       return {};
//     }
//     const data = fs.readFileSync(this.historyFilePath, 'utf-8');
//     if (!data) {
//       return {};
//     }
//     try {
//       return JSON.parse(data);
//     } catch (error) {
//       logger.error('Erro ao analisar o JSON: ' + error);
//       return {};
//     }
//   }

//   saveHistory() {
//     fs.writeFileSync(this.historyFilePath, JSON.stringify(this.history, null, 2));
//   }

//   async getUserHistory(userId) {
//     const userHistory = this.history[userId] || [];
//     const systemPrompt = await getSystemPrompt();
//     return [{ role: 'system', content: systemPrompt }, ...userHistory];
//   }

//   addUserMessage(userId, message) {
//     this.addMessage(userId, 'user', message);
//   }

//   addAssistantMessage(userId, message) {
//     this.addMessage(userId, 'assistant', message);
//   }

//   addSystemMessage(userId, message) {
//     this.addMessage(userId, 'system', message);
//   }

//   addMessage(userId, role, message) {
//     if (!this.history[userId]) {
//       this.history[userId] = [];
//     }
//     this.history[userId].push({ role, content: message });
//     this.saveHistory();
//   }

//   clearUserHistory(userId) {
//     if (this.history[userId]) {
//       delete this.history[userId];
//       this.saveHistory();
//     }
//   }
// }

// export default ChatHistory;
