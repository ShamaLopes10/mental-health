import os
import time
import google.generativeai as genai
from flask import Flask, request, Response
from flask_cors import CORS

# --- Configuration ---
try:
    with open('system_prompt.txt', 'r') as f:
        SYSTEM_PROMPT = f.read()
except FileNotFoundError:
    print("Error: system_prompt.txt not found.")
    SYSTEM_PROMPT = "You are a helpful assistant."

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Allows requests from your frontend

# Configure Gemini API key
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

# --- Safety Settings ---
safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_ONLY_HIGH"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
]

# --- Initialize Gemini Model ---
model = genai.GenerativeModel(
    model_name="models/gemini-flash-latest",
    system_instruction=SYSTEM_PROMPT
)

# Store conversation history per user
user_conversations = {}

# --- SSE helper function ---
def stream_words(text):
    for word in text.split():
        yield f"data: {word}\n\n"
        time.sleep(0.15)  # typing effect
    yield "data: [DONE]\n\n"

# --- SSE chat endpoint ---
@app.route('/chat_stream')
def chat_stream():
    user_id = request.args.get('user_id')
    user_message = request.args.get('message')

    if not user_id or not user_message:
        return Response("Missing user_id or message", status=400)

    # --- Crisis keyword check ---
    crisis_keywords = ['suicide', 'kill myself', 'want to die', 'self-harm']
    if any(keyword in user_message.lower() for keyword in crisis_keywords):
        crisis_response = (
            "It sounds like you are going through a very difficult time. "
            "Please know that there are people who want to support you. "
            "In the US and Canada, call or text 988. "
            "In the UK, dial 111. "
            "Please reach out to them; they are there to help."
        )
        return Response(stream_words(crisis_response), mimetype='text/event-stream')

    # --- Manage conversation ---
    if user_id not in user_conversations:
        user_conversations[user_id] = model.start_chat(history=[])

    chat_session = user_conversations[user_id]

    try:
        response = chat_session.send_message(
            user_message,
            #safety_settings=safety_settings
        )
        bot_reply = response.text

    except Exception as e:
        print(f"Error generating response: {e}")
        bot_reply = "I'm sorry, I'm having trouble processing that right now."

    return Response(stream_words(bot_reply), mimetype='text/event-stream')


if __name__ == '__main__':
    app.run(port=5000, debug=True)