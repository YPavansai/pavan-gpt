# Pavan-GPT: Your Intelligent AI Assistant

Pavan-GPT is a production-quality, responsive, and secure AI chatbot application modeled after modern conversational platforms like ChatGPT and Claude. Featuring a sleek glassmorphic dark-themed UI, context-aware memory, file uploads (PDF/DOCX/TXT) with automated summaries, voice dictate capabilities, and specialized AI career and coding assistants.

---

## Technical Stack

### Frontend
- **React 19** & **Vite** (extremely fast compilation and runtime HMR)
- **Tailwind CSS v4.0.0** (CSS-first style definitions)
- **React Router v6** (client-side routing and protected paths)
- **Axios** (secure HTTP client with automatic JWT header attachment & 401 refresh interceptors)
- **Framer Motion** (smooth layout transitions and micro-interactions)
- **React Icons** (sleek developer icon kits)

### Backend
- **Python 3.13** & **Django 5.0+**
- **Django REST Framework** (secure API handlers)
- **Django REST Framework SimpleJWT** (stateless JWT login and token blacklisting)
- **Google Generative AI SDK** (secure server-side Gemini prompt executions)
- **PyPDF** & **python-docx** (server-side text extraction engines)
- **SQLite** (local development database) / **PostgreSQL** (production ready)

---

## Core Features

1. **Authentication:** Register, Login, and Logout (JWT token rotating refresh keys and active token blacklisting).
2. **Context-Aware Chat:** Maintaining conversation logs for natural follow-up queries.
3. **Document Summarization & Q&A:** Drag and drop PDF, DOCX, or TXT files. The backend extracts text, generates summaries, and references it for context-bound questions.
4. **Voice Controls:** Text-to-Speech playback of AI responses and Speech-to-Text mic dictation directly in the input bar.
5. **Specialized AI Agents:** 8 dedicated career and coding assistants including Career Advisor, Resume Reviewer, Study Planner, Code Debugger, and roadmap designer.
6. **Customizable Preferences:** Dark/Light theme toggle, Accent colors selection, clear history, and backup exports.

---

## Installation & Local Setup

### Prerequisites
- Node.js (v20+)
- Python (3.10+)

### 1. Backend Configuration
Navigate to `/backend` directory:
```bash
# Initialize virtual environment
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Create a `.env` file inside `/backend` (copied from `.env.example`):
```env
DJANGO_SECRET_KEY=your-custom-secret-key-here
DEBUG=True
GEMINI_API_KEY=your-actual-google-gemini-api-key
GEMINI_MODEL=gemini-1.5-flash
```

Run database migrations and start the Django developer server:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```
The API server will run at `http://localhost:8000/`.

---

### 2. Frontend Configuration
Navigate to `/frontend` directory:
```bash
# Install packages
npm install

# Run the local development server
npm run dev
```
The React client runs at `http://localhost:5173/`.

---

## Running Automated Tests

To execute backend unit tests for token authentication, database signals, and chat records:
```bash
# Run from root directory
.\.venv\Scripts\python.exe backend/manage.py test api
```

To run a production-ready build check for the frontend:
```bash
# Run from `/frontend`
npm run build
```

---

## Deployment Guidelines

### Frontend → Vercel
1. Install Vercel CLI or link your repository to Vercel.
2. The project features [vercel.json](file:///c:/Users/pavan/OneDrive/Desktop/Pavan-GPT/frontend/vercel.json) to handle Single Page App routing redirects automatically.
3. Configure the output directory to `frontend/dist`.

### Backend → Render
1. Create a Web Service on Render and point to `/backend`.
2. Configure **Environment Variables** in Render:
   - `GEMINI_API_KEY`: *(Your Google AI Studio API Key)*
   - `DJANGO_SECRET_KEY`: *(Random secure key)*
   - `DEBUG`: `False`
   - `PYTHON_VERSION`: `3.13.1` (or matching version)
3. Set Build Command: `pip install -r requirements.txt && python manage.py migrate`
4. Set Start Command: `gunicorn pavangpt.wsgi:application --bind 0.0.0.0:$PORT`
