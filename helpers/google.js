const { google } = require("googleapis");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

async function authorize() {
  const CREDENTIALS_PATH = path.join(process.cwd(), process.env.GOOGLE_CREDENTIALS_FILE_PATH);
  const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/documents.readonly'],
  });

  const authClient = await auth.getClient();
  return authClient;
}

async function getGoogleDocContent(auth, docId) {
  const docs = google.docs({ version: 'v1', auth });
  const res = await docs.documents.get({
    documentId: docId,
  });

  const content = res.data.body.content.map((element) => {
    if (element.paragraph) {
      return element.paragraph.elements.map((el) => el.textRun ? el.textRun.content : '').join('');
    }
    return '';
  }).join('\n');

  return content;
}

module.exports = {
    authorize,
    getGoogleDocContent
}
