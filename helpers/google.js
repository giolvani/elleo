import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import logger from './logger.js';
import dotenv from 'dotenv';
dotenv.config();

export async function authorize() {
  let credentials;

  if (process.env.NODE_ENV === 'production') {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else {
    const CREDENTIALS_PATH = path.join(
      process.cwd(),
      'config/elleo-cloud-project-0fb65ea0b691.json'
    );
    credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/documents.readonly']
  });

  const authClient = await auth.getClient();
  return authClient;
}

export async function getGoogleDocContent(auth, docId) {
  const docs = google.docs({ version: 'v1', auth });
  try {
    const res = await docs.documents.get({
      documentId: docId
    });

    const content = res.data.body.content
      .map((element) => {
        if (element.paragraph) {
          return element.paragraph.elements
            .map((el) => (el.textRun ? el.textRun.content : ''))
            .join('');
        }
        return '';
      })
      .join('\n');

    return content;
  } catch (error) {
    logger.error('Erro ao obter conteúdo do Google Doc: ' + error);
  }
}
