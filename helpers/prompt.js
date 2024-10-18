const { authorize, getGoogleDocContent } = require("./google");
const fs = require("fs");
const path = require("path");

async function getSystemPrompt() {
    try{
        const auth = await authorize();
        return await getGoogleDocContent(auth, process.env.GOOGLE_DOC_ID);
    } catch (error) {
        console.error("Não foi possível carregar o prompt do Google Docs", error);
        return fs.readFileSync(path.join(process.cwd(), process.env.DEFAULT_PROMPT_FILE_PATH), "utf8");
    }
}

module.exports = {
    getSystemPrompt
}
