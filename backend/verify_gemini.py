import os
import google.generativeai as genai
import dotenv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
dotenv.load_dotenv(os.path.join(BASE_DIR, '.env'), override=True)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("[ERROR] No GEMINI_API_KEY found in your backend/.env file!")
    exit(1)

print(f"API Key loaded: {api_key[:10]}... (length: {len(api_key)})")

genai.configure(api_key=api_key)

try:
    print("Testing connection to gemini-2.5-flash...")
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Hello! What is your name?")
    print("\n[SUCCESS] Gemini response:")
    print(response.text)
except Exception as e:
    print(f"\n[ERROR] Connection failed:\n{str(e)}")
    print("\nQuick troubleshooting:")
    print("- Ensure you registered at https://aistudio.google.com/ and copied the key from the 'Get API Key' section.")
