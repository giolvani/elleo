import openai
import os
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

system_prompt = """

"""


def get_bot_response(conversation_history):
    try:
        response = openai.chat.completions.create(
            model="ft:gpt-3.5-turbo-0125:sami:new-elleo:ACnVyCRr",
            messages=conversation_history,
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"Erro: {e.response.json() if hasattr(e, 'response') and e.response else str(e)}"


if __name__ == "__main__":
    conversation_history = [{"role": "system", "content": system_prompt}]

    while True:
        user_input = input("You: ")

        if user_input.lower() in ["sair", "exit", "quit"]:
            print("Encerrando a conversa.")
            break

        conversation_history.append({"role": "user", "content": user_input})

        print("history", conversation_history)

        bot_response = get_bot_response(conversation_history)
        print("Bot:", bot_response, "\n")

        conversation_history.append({"role": "assistant", "content": bot_response})
