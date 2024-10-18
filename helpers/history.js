const fs = require('fs');
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();

const historyFilePath = path.join(process.cwd(), process.env.HISTORY_FILE_PATH);

function loadHistory() {
  if (!fs.existsSync(historyFilePath)) {
    return {};
  }
  const data = fs.readFileSync(historyFilePath);
  return JSON.parse(data);
}

function saveHistory(history) {
  fs.writeFileSync(historyFilePath, JSON.stringify(history, null, 2));
}

function getUserHistory(userId, systemPrompt) {
  const history = loadHistory();
  let isFirstInteraction = false;

  if (!history[userId] || history[userId].length === 0) {
    isFirstInteraction = true;
    history[userId] = [{ role: 'system', content: systemPrompt }];
    saveHistory(history);
  }
  return { history: history[userId], isFirstInteraction };
}

function updateUserHistory(userId, userMessage, botResponse) {
  const history = loadHistory();
  if (!history[userId]) {
    history[userId] = [];
  }
  history[userId].push({ role: 'user', content: userMessage });
  history[userId].push({ role: 'assistant', content: botResponse });
  saveHistory(history);
}

function clearUserHistory(userId) {
  const history = loadHistory();
  if (history[userId]) {
    delete history[userId];
    saveHistory(history);
  }
}

module.exports = {
  getUserHistory,
  updateUserHistory,
  clearUserHistory,
};
