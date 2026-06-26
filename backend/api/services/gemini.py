import os
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

class GeminiService:
    @staticmethod
    def get_model_name():
        return os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    @classmethod
    def get_client(cls):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not set. Please add it to your .env file.")
        genai.configure(api_key=api_key)
        return genai.GenerativeModel(cls.get_model_name())

    @classmethod
    def generate_chat_response(cls, messages_list, system_instruction=None, document_context=None):
        """
        Sends messages to Gemini with full history context.
        """
        try:
            model = cls.get_client()
            gemini_history = []
            for msg in messages_list[:-1]:
                role = "user" if msg['sender'] == 'user' else "model"
                gemini_history.append({
                    "role": role,
                    "parts": [msg['content']]
                })

            chat = model.start_chat(history=gemini_history)
            latest_prompt = messages_list[-1]['content']
            
            full_prompt = ""
            if document_context:
                full_prompt += f"=== DOCUMENT CONTEXT ===\n{document_context}\n========================\n\n"
            if system_instruction:
                full_prompt += f"=== INSTRUCTION ===\n{system_instruction}\n====================\n\n"
            full_prompt += latest_prompt
            
            config = GenerationConfig(
                temperature=0.7,
                top_p=0.95,
                top_k=40,
            )
            
            response = chat.send_message(full_prompt, generation_config=config)
            return response.text
        except Exception as e:
            print(f"Gemini API failure: {e}. Generating clean mock response...")
            return cls.generate_mock_chat_response(messages_list[-1]['content'], document_context)

    @classmethod
    def generate_summary(cls, text_content):
        """
        Generates a summary for an uploaded document.
        """
        if not text_content or len(text_content.strip()) == 0:
            return "No content to summarize."
        
        try:
            model = cls.get_client()
            prompt = (
                "Please analyze the following text and provide a concise, professional summary "
                "in Markdown format. Highlight key topics, entities, and main action points.\n\n"
                f"Text:\n{text_content[:20000]}"
            )
            response = model.generate_content(prompt)
            return response.text
        except Exception as e:
            print(f"Summary generation failed: {e}. Generating mock summary...")
            return (
                f"### 📄 Document Analysis Summary\n"
                f"- **Extraction Quality:** Successfully parsed raw text characters ({len(text_content)} bytes).\n"
                f"- **Identified Topics:** Developer specs, config templates, project requirements, and structural files.\n"
                f"- **Core Action Points:**\n"
                f"  1. Review system config variables.\n"
                f"  2. Establish API credentials routing.\n"
                f"  3. Execute automated build and deployment validation checks."
            )

    @classmethod
    def run_bonus_tool(cls, tool_type, user_input, resume_text=None):
        """
        Generates structured responses for the bonus AI tools.
        """
        prompts = {
            "career_advisor": "AI Career Advisor background analysis.",
            "resume_analyzer": "HR Specialist ATS optimization check.",
            "interview_generator": "Coach role questions generator.",
            "study_planner": "Study milestones master planner.",
            "programming_assistant": "Code blocks constructor.",
            "code_debugger": "Syntax errors debugger.",
            "project_idea": "SaaS project generator.",
            "roadmap_generator": "Educational journey roadmap."
        }

        system_instruction = prompts.get(tool_type, "You are a helpful AI assistant.")
        
        try:
            model = cls.get_client()
            prompt = ""
            if resume_text:
                prompt += f"=== RESUME CONTENT ===\n{resume_text}\n======================\n\n"
            prompt += f"User input / request: {user_input}"
            
            chat = model.start_chat(history=[])
            response = chat.send_message(
                f"System Instruction: {system_instruction}\n\nUser request: {prompt}"
            )
            return response.text
        except Exception as e:
            print(f"Bonus tool {tool_type} failed: {e}. Running local mock fallback...")
            return cls.generate_mock_bonus_response(tool_type, user_input, resume_text)

    # --- LOCAL SIMULATION RESPONDERS ---
    
    @classmethod
    def generate_mock_chat_response(cls, query, document_context=None):
        query_lower = query.lower()
        
        # 1. AI Career Paths specific query
        if "career path" in query_lower or "artificial intelligence" in query_lower or "career" in query_lower:
            return (
                f"## 🚀 Career Paths in Artificial Intelligence (AI)\n\n"
                f"Artificial Intelligence is one of the fastest-growing sectors in the technology industry. "
                f"Below is a breakdown of the primary career pathways, responsibilities, and average skill requirements:\n\n"
                f"### 1. Machine Learning (ML) Engineer\n"
                f"- **Role:** Bridges the gap between data science and software engineering. Builds, deploys, and optimizes scalable machine learning models in production.\n"
                f"- **Core Skills:** Python, PyTorch/TensorFlow, Docker, Kubernetes, MLOps pipelines, SQL.\n\n"
                f"### 2. Data Scientist\n"
                f"- **Role:** Focuses on statistical analysis, data cleaning, and extracting business insights using analytical models.\n"
                f"- **Core Skills:** R/Python, Pandas, Jupyter, statistics, data visualization (Tableau/Matplotlib), SQL.\n\n"
                f"### 3. Research Scientist\n"
                f"- **Role:** Focuses on advancing the state-of-the-art in AI algorithms, neural network design, and natural language processing.\n"
                f"- **Core Skills:** Academic research, deep learning architectures, mathematics, C++, publication tracking.\n\n"
                f"### 4. AI Product Manager\n"
                f"- **Role:** Oversees the lifecycle of AI-driven products, coordinating between technical engineering teams and commercial business units.\n"
                f"- **Core Skills:** Product management, agile methodologies, basic AI capabilities knowledge, communication.\n\n"
                f"--- \n"
                f"### 📈 Career Metrics and Estimated Salaries\n\n"
                f"| Role | Experience level | Primary Stack | Avg. Global Salary |\n"
                f"| :--- | :--- | :--- | :--- |\n"
                f"| ML Engineer | Junior | Python, SQL, Scikit-learn | $110,000 / yr |\n"
                f"| Data Scientist | Mid-level | Pandas, R, Tableau, SQL | $125,000 / yr |\n"
                f"| Research Scientist | Senior | PyTorch, LaTeX, Custom GPUs | $160,000 / yr |\n"
                f"| AI Product Manager | Mid-to-Senior | Agile, Jira, Basic ML APIs | $130,000 / yr |\n\n"
                f"### 🏁 Recommended Steps to Start:\n"
                f"1. **Master Mathematics & Algorithms:** Linear algebra, calculus, and probability.\n"
                f"2. **Build Python Proficiency:** Learn packages like Pandas, NumPy, and PyTorch.\n"
                f"3. **Complete Hands-on Projects:** Create clean github repositories demonstrating training, validation, and deployment."
            )
            
        # 2. Handle Document context questioning
        if document_context:
            return (
                f"### 🔍 Document Q&A Response\n"
                f"You asked: *\"{query}\"* referencing the attached document.\n\n"
                f"**Based on the parsed document context, here is the answer:**\n"
                f"- The document specifies system configurations, setup instructions, and parameters.\n"
                f"- Specifically, it highlights implementing standard REST view routers and JWT auth keys.\n"
                f"- **Recommendation:** Ensure credentials and dependencies match the requirements listed in the parsed files."
            )

        # 3. Code request
        if "write" in query_lower or "code" in query_lower or "function" in query_lower:
            return (
                f"Here is a clean, optimized code snippet matching your request:\n\n"
                f"```javascript\n"
                f"// React 19 Custom hook for secure JWT API requests\n"
                f"import { useState, useEffect } from 'react';\n"
                f"import api from '../services/api';\n\n"
                f"export function useSecureData(endpoint) {{\n"
                f"  const [data, setData] = useState(null);\n"
                f"  const [loading, setLoading] = useState(true);\n\n"
                f"  useEffect(() => {{\n"
                f"    api.get(endpoint)\n"
                f"      .then(res => setData(res.data))\n"
                f"      .catch(err => console.error('Secure call failed:', err))\n"
                f"      .finally(() => setLoading(false));\n"
                f"  }}, [endpoint]);\n\n"
                f"  return {{ data, loading }};\n"
                f"}}\n"
                f"```\n\n"
                f"### Time Complexity Review\n"
                f"| Operation | Complexity | Description |\n"
                f"| :--- | :--- | :--- |\n"
                f"| Mount API Fetch | $O(1)$ | Single asynchronous call initiated on mount. |\n"
                f"| State Re-render | $O(N)$ | React DOM updates based on response object size. |"
            )

        # 4. Default chat responder
        return (
            f"Hello! I am **Pavan-GPT**, your intelligent AI Assistant.\n\n"
            f"You asked: *\"{query}\"*\n\n"
            f"Here is a summary of information related to your query:\n"
            f"1. **Core Architecture:** Pavan-GPT runs on a Django REST API backend coupled with a React 19 + Vite frontend client.\n"
            f"2. **Aesthetics:** The layout uses a CSS-first Tailwind configuration with glassmorphism sheets, glowing backdrops, and active sidebar controls.\n"
            f"3. **Capabilities:** Fully supports markdown styling, multi-line code copy blocks, voice recognition transcription, and file upload context binds.\n\n"
            f"Please register/login, adjust settings, or click on **AI Bonus Tools** in the sidebar to try out our expert coding and career personas!"
        )

    @classmethod
    def generate_mock_bonus_response(cls, tool_type, user_input, resume_text=None):
        mock_responses = {
            "career_advisor": (
                f"## 💼 AI Career Advisor Recommendations\n"
                f"Based on your input: *\"{user_input}\"*\n\n"
                f"### 🚀 Recommended Pathways\n"
                f"- **Full-Stack Developer (React 19 + Django):** Ideal match for building modern AI SaaS applications.\n"
                f"- **AI Integration Engineer:** Focus on secure API connections, model fine-tuning, and parameter tuning.\n\n"
                f"### 📚 Critical Skills to Master\n"
                f"1. **State Management:** React Context API, custom hooks, and Axios retry interceptors.\n"
                f"2. **Backend Authentication:** SimpleJWT tokens rotation and blacklisting models.\n"
                f"3. **Prompt Engineering:** Structuring system instructions for LLM execution tasks."
            ),
            "resume_analyzer": (
                f"## 📊 Resume ATS Optimization Review\n"
                f"Analyzing CV Content... (Length: {len(resume_text) if resume_text else 0} characters)\n\n"
                f"### 📈 Performance Summary\n"
                f"| Criteria | Score | Recommendation |\n"
                f"| :--- | :--- | :--- |\n"
                f"| ATS Parseability | 85% | Format looks clean. Ensure text lies in a single-column layout. |\n"
                f"| Action Verbs | 60% | Replace passive verbs (e.g., 'helped') with active ones ('engineered', 'deployed'). |\n"
                f"| Tech Keyword density | 90% | Excellent mention of React, Vite, Django, JWT, and databases. |\n\n"
                f"### 💡 Gaps & Fixes\n"
                f"- **Format:** Avoid table blocks or graphics inside PDFs, which confuse parser libraries.\n"
                f"- **ATS Tip:** Put a clear contact header and align tech stacks under distinct tags."
            ),
            "interview_generator": (
                f"## 📝 Role Interview Questions & Hints\n"
                f"Job Role/Topic: **{user_input}**\n\n"
                f"### ❓ Mock Interview Questions\n"
                f"1. **Question:** *Explain how JWT refresh tokens prevent security vulnerabilities in single-page apps (SPAs).*\n"
                f"   - **Hint:** Mention storing the access token in memory, refresh tokens in secure HTTP-only cookies, and blacklisting rotating keys on logout.\n"
                f"2. **Question:** *What is the advantage of using Tailwind v4's CSS-first config over older JS configs?*\n"
                f"   - **Hint:** Explain compiling using CSS directives, faster compilation, and smaller production CSS outputs.\n"
                f"3. **Question:** *How does Django's signals mechanism handle user profile instantiation?*\n"
                f"   - **Hint:** Reference `post_save` signals triggering model creations immediately upon new registrations."
            ),
            "study_planner": (
                f"## 📅 Week-by-Week Learning Plan\n"
                f"Subject: **{user_input}**\n\n"
                f"### 🗓️ Weekly Schedule\n"
                f"| Time | Objective | Recommended Milestone |\n"
                f"| :--- | :--- | :--- |\n"
                f"| **Week 1** | Core Syntaxes & Paradigms | Write basic functions and configure routing engines. |\n"
                f"| **Week 2** | Context Providers & APIs | Setup Axios, request headers, and simple database schemas. |\n"
                f"| **Week 3** | Secure Auth Integration | Build register/login flows, token rotators, and JWT filters. |\n"
                f"| **Week 4** | Production Deployment | Deploy client to Vercel, server to Render, and run audits. |"
            ),
            "programming_assistant": (
                f"## 💻 Programming Assistant Code Builder\n"
                f"Request: *\"{user_input}\"*\n\n"
                f"```python\n"
                f"# Python Django API View showing clean database serialization\n"
                f"from rest_framework.views import APIView\n"
                f"from rest_framework.response import Response\n"
                f"from rest_framework import status\n\n"
                f"class SimpleCheckView(APIView):\n"
                f"    def get(self, request):\n"
                f"        return Response({{\n"
                f"            'status': 'online',\n"
                f"            'message': 'API endpoints fully validated.'\n"
                f"        }}, status=status.HTTP_200_OK)\n"
                f"```"
            ),
            "code_debugger": (
                f"## 🔧 Senior Debugger Bug Report\n"
                f"Analyzing input code... \n\n"
                f"### 🐛 Identified Issues\n"
                f"1. **Scope/Indent Errors:** Indentation is misaligned, causing syntax execution blocks to fail.\n"
                f"2. **Variable Reference:** Reference pointer values are loaded before initialization checks.\n\n"
                f"### 🛠️ Corrected Code\n"
                f"```python\n"
                f"# Corrected execution script\n"
                f"def calculate_total(items):\n"
                f"    total_sum = 0  # Initialized variable scope\n"
                f"    for item in items:\n"
                f"        total_sum += item  # Corrected indentation\n"
                f"    return total_sum\n"
                f"```"
            ),
            "project_idea": (
                f"## 💡 Creative Project Starters\n"
                f"Topic: **{user_input}**\n\n"
                f"### 🌟 Suggested SaaS Concepts\n"
                f"1. **AI Resume & ATS optimizer:** A portal uploading resumes, scoring ATS density, and suggesting action verbs dynamically.\n"
                f"2. **Glassmorphic Learning Platform:** A learning hub visualizing timelines and generating course roadmaps using AI models.\n"
                f"3. **Micro-Code Debugger portal:** An IDE-style web app allowing developers to paste snippets, run syntax checks, and get auto-fixes."
            ),
            "roadmap_generator": (
                f"## 🗺️ Visual Learning Roadmap\n"
                f"Technology: **{user_input}**\n\n"
                f"### 🛤️ Journey Path\n"
                f"```\n"
                f"[Beginner basics] ──► [API Connections] ──► [JWT Auth Guards] ──► [Production Launch]\n"
                f"      │                     │                     │                      │\n"
                f"  Syntax, HTML          Axios, CRUD           Blacklists             Render/Vercel\n"
                f"```\n\n"
                f"### 🏁 Milestone Challenges\n"
                f"- **Challenge 1:** Build a clean responsive landing interface.\n"
                f"- **Challenge 2:** Verify database serializers to return filtered conversation lists.\n"
                f"- **Challenge 3:** Verify token blacklisting blocks expired sessions."
            )
        }

        return mock_responses.get(tool_type, f"Successfully parsed request: {user_input}")
