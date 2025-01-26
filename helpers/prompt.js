// import { authorize, getGoogleDocContent } from './google.js';
// import fs from 'fs';
// import path from 'path';
// import logger from './logger.js';

// export async function getSystemPrompt() {
//   try {
//     const auth = await authorize();
//     return await getGoogleDocContent(auth, process.env.GOOGLE_DOC_ID);
//   } catch (error) {
//     logger.error('Não foi possível carregar o prompt do Google Docs: ' + error);
//     return fs.readFileSync(path.join(process.cwd(), process.env.DEFAULT_PROMPT_FILE_PATH), 'utf8');
//   }
// }
