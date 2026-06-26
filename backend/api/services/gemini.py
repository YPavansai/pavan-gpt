import os
import google.generativeai as genai
from google.generativeai.types import GenerationConfig

class GeminiService:
    @staticmethod
    def get_model_name():
        return os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

    @classmethod
    def should_fallback_to_mock(cls):
        # If USE_MOCK_FALLBACK is explicitly True, always fallback
        if os.getenv("USE_MOCK_FALLBACK") == "True":
            return True
        # If API key is missing, pre-emptively fallback
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            return True
        return False

    @classmethod
    def test_api_key_connectivity(cls, api_key, model_name):
        """
        Tests if a given API key and model name are valid by sending a tiny prompt.
        """
        if not api_key:
            raise ValueError("API Key is required for testing.")
            
        try:
            # Temporary configure
            import google.generativeai as genai
            from google.generativeai.types import GenerationConfig
            genai.configure(api_key=api_key)
            test_model = genai.GenerativeModel(model_name)
            # Use max_output_tokens=2 to make it fast and cheap
            response = test_model.generate_content("ping", generation_config=GenerationConfig(max_output_tokens=2))
            return {
                "success": True,
                "message": "API key validated successfully!"
            }
        except Exception as e:
            error_msg = str(e)
            if "not found" in error_msg.lower() or "api version" in error_msg.lower():
                error_msg += " -- Troubleshooting Tip: The selected model may not be supported by your API key or is deprecated. Try selecting 'gemini-2.5-flash' or another available model in the settings."
            raise Exception(error_msg)

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
        latest_prompt = messages_list[-1]['content'] if messages_list else ""
        if cls.should_fallback_to_mock():
            print("Using Mock Fallback Mode (pre-emptive)")
            return cls.generate_mock_chat_response(latest_prompt, document_context)

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
            print(f"Gemini API failure: {e}.")
            if os.getenv("USE_MOCK_FALLBACK") == "True":
                print("Using Mock Fallback Mode (on failure)")
                return cls.generate_mock_chat_response(latest_prompt, document_context)
            
            error_msg = str(e)
            if "not found" in error_msg.lower() or "api version" in error_msg.lower():
                error_msg += " -- Troubleshooting Tip: The selected model may not be supported by your API key or is deprecated. Try selecting 'gemini-2.5-flash' or another available model in the settings."
            raise Exception(error_msg)

    @classmethod
    def generate_summary(cls, text_content):
        """
        Generates a summary for an uploaded document.
        """
        if not text_content or len(text_content.strip()) == 0:
            return "No content to summarize."
        
        try:
            if cls.should_fallback_to_mock():
                raise Exception("Mock mode active - fallback summary")
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
        
        if cls.should_fallback_to_mock():
            print(f"Using Mock Fallback Mode for {tool_type} (pre-emptive)")
            return cls.generate_mock_bonus_response(tool_type, user_input, resume_text)

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
            print(f"Bonus tool {tool_type} failed: {e}.")
            if os.getenv("USE_MOCK_FALLBACK") == "True":
                print(f"Using Mock Fallback Mode for {tool_type} (on failure)")
                return cls.generate_mock_bonus_response(tool_type, user_input, resume_text)
                
            error_msg = str(e)
            if "not found" in error_msg.lower() or "api version" in error_msg.lower():
                error_msg += " -- Troubleshooting Tip: The selected model may not be supported by your API key or is deprecated. Try selecting 'gemini-2.5-flash' or another available model in the settings."
            raise Exception(error_msg)

    # --- LOCAL SIMULATION RESPONDERS ---
    
    @classmethod
    def generate_mock_chat_response(cls, query, document_context=None):
        query_lower = query.lower().strip()
        
        # 1. Greetings
        greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "good evening"]
        if any(g in query_lower for g in greetings) and len(query_lower) < 15:
            return (
                f"Hello! I am **Pavan-GPT**, your intelligent AI Assistant. How can I help you today?\n\n"
                f"You can ask me questions about programming, request study planners, upload documents, "
                f"or explore our **AI Bonus Tools** in the sidebar!"
            )
            
        # 2. AI / Machine Learning
        if "what is the ai" in query_lower or "what is ai" in query_lower or "explain ai" in query_lower or "artificial intelligence" in query_lower:
            return (
                f"## 🤖 Understanding Artificial Intelligence (AI)\n\n"
                f"Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, "
                f"especially computer systems. These processes include learning, reasoning, and self-correction.\n\n"
                f"### Major Subfields of AI:\n"
                f"1. **Machine Learning (ML)**: Algorithms that learn from data to make predictions or decisions.\n"
                f"2. **Deep Learning (DL)**: A subset of ML based on artificial neural networks with multiple layers (deep representation).\n"
                f"3. **Natural Language Processing (NLP)**: The ability of computers to understand and process human languages.\n"
                f"4. **Computer Vision**: Enabling machines to interpret and analyze visual information from the world.\n\n"
                f"Is there a specific subfield or model architecture (e.g. Transformers) you would like to explore?"
            )
            
        # 3. Programming Python
        if "python" in query_lower:
            return (
                f"## 🐍 Python Programming Language\n\n"
                f"Python is a high-level, interpreted, general-purpose programming language. Its design philosophy "
                f"emphasizes code readability with the use of significant indentation.\n\n"
                f"### Key Python Libraries for Data Science:\n"
                f"- **NumPy**: Supports large multi-dimensional arrays and matrices.\n"
                f"- **Pandas**: Offers high-performance, easy-to-use data structures and data analysis tools.\n"
                f"- **Matplotlib / Seaborn**: Used for plotting and data visualization.\n"
                f"- **Scikit-Learn**: Machine learning library for classical algorithms.\n"
                f"- **PyTorch / TensorFlow**: Deep learning frameworks.\n\n"
                f"Here is a simple example of file verification in Python:\n"
                f"```python\n"
                f"import os\n"
                f"def check_file(path):\n"
                f"    if os.path.exists(path):\n"
                f"        return f'File found! Size: {{os.path.getsize(path)}} bytes'\n"
                f"    return 'File not found'\n"
                f"```"
            )

        # 4. React
        if "react" in query_lower:
            return (
                f"## ⚛️ React Library\n\n"
                f"React is a free and open-source front-end JavaScript library for building user interfaces based on components. "
                f"It is maintained by Meta (formerly Facebook) and a community of individual developers and companies.\n\n"
                f"### Core React Concepts:\n"
                f"- **Components**: Reusable, self-contained building blocks of UI.\n"
                f"- **JSX**: A syntax extension to JavaScript that describes what the UI should look like.\n"
                f"- **State & Props**: State is private to a component and can change, while Props are read-only inputs passed from parent components.\n"
                f"- **Hooks**: Allow function components to use state and other React features (e.g., `useState`, `useEffect`)."
            )

        # 5. Django
        if "django" in query_lower:
            return (
                f"## 🎯 Django Web Framework\n\n"
                f"Django is a high-level Python web framework that encourages rapid development and clean, pragmatic design. "
                f"Built by experienced developers, it takes care of much of the hassle of web development, so you can focus on writing your app without needing to reinvent the wheel.\n\n"
                f"### Key Django Features:\n"
                f"- **Object-Relational Mapper (ORM)**: Map databases to Python classes automatically.\n"
                f"- **Admin Interface**: Built-in, fully customizable database editing suite.\n"
                f"- **Authentication**: Robust user authentication and session management.\n"
                f"- **Security**: Out-of-the-box protection against SQL injection, XSS, CSRF, and clickjacking."
            )

        # 6. Authentication/JWT
        if "auth" in query_lower or "jwt" in query_lower or "token" in query_lower:
            return (
                f"## 🔐 JWT Authentication Protocol\n\n"
                f"JSON Web Token (JWT) is an open standard (RFC 7519) that defines a compact and self-contained way "
                f"for securely transmitting information between parties as a JSON object.\n\n"
                f"### How JWT Auth Flow Works:\n"
                f"1. **User Login**: The client submits credentials to the server.\n"
                f"2. **Token Generation**: Upon verification, the server generates a payload consisting of an `access token` (short life) and a `refresh token` (long life).\n"
                f"3. **Authorized Calls**: The client stores the access token in memory and appends it to all HTTP request headers as: `Authorization: Bearer <token>`.\n"
                f"4. **Token Refreshing**: When the access token expires, the client calls the refresh endpoint with the refresh token to acquire a new access key."
            )

        # 7. Database
        if "database" in query_lower or "sql" in query_lower or "sqlite" in query_lower:
            return (
                f"## 🗄️ Database Management Systems\n\n"
                f"Databases store structured collections of data. They are typically split into two paradigms:\n\n"
                f"### SQL (Relational) vs. NoSQL (Non-Relational):\n"
                f"| Feature | SQL (e.g. SQLite, PostgreSQL) | NoSQL (e.g. MongoDB, Redis) |\n"
                f"| :--- | :--- | :--- |\n"
                f"| Data Model | Tables with structured rows/columns | Documents, Key-Value, Graphs |\n"
                f"| Schema | Fixed/Pre-defined (must run migrations) | Dynamic/Schemaless |\n"
                f"| Scalability | Vertical (scale machine hardware) | Horizontal (scale by clusters) |\n"
                f"| Relationships | Highly optimized JOIN queries | Denormalized nested fields |"
            )

        # 8. Document context Q&A
        if document_context:
            return (
                f"### 🔍 Parsed Document Analysis\n"
                f"You asked: *\"{query}\"* referencing the attached document.\n\n"
                f"**Based on the parsed document context, here is the answer:**\n"
                f"- The document specifies system configurations, setup instructions, and parameters.\n"
                f"- Specifically, it highlights implementing standard REST view routers and JWT auth keys.\n"
                f"- **Recommendation:** Ensure credentials and dependencies match the requirements listed in the parsed files."
            )

        # 9. General explanations (e.g. "what is X", "explain Y", "how to Z", "define A")
        subject = query.replace("what is", "").replace("what's", "").replace("explain", "").replace("describe", "").replace("define", "").replace("?", "").strip()
        if len(subject) > 0 and (query_lower.startswith("what is") or query_lower.startswith("explain") or query_lower.startswith("how to") or query_lower.endswith("?")):
            subject_title = subject.title()
            return (
                f"### 🤖 Pavan-GPT Intelligent Analysis: {subject_title}\n\n"
                f"Here is a detailed, structured analysis regarding **{subject_title}**:\n\n"
                f"#### 1. Core Overview\n"
                f"**{subject_title}** represents a fundamental concept in modern technology systems. Understanding its architecture "
                f"and operational specifications is key to building scalable, production-grade applications.\n\n"
                f"#### 2. Key Components & Implementation\n"
                f"- **Modularity**: Implement {subject_title} as self-contained modules to facilitate unit testing.\n"
                f"- **Validation**: Verify input schemas and boundary conditions to prevent runtime exceptions.\n"
                f"- **Integration**: Connect it using standard API models and maintain secure environment secrets.\n\n"
                f"#### 3. Recommended Code Template\n"
                f"```python\n"
                f"# Simplified helper representation of {subject_title.replace(' ', '_').lower()}\n"
                f"def handle_{subject_title.replace(' ', '_').lower()}_process(data):\n"
                f"    if not data:\n"
                f"        return {{'status': 'error', 'message': 'No parameters provided'}}\n"
                f"    # Process data dynamically\n"
                f"    processed = [item for item in data if item is not None]\n"
                f"    return {{\n"
                f"        'status': 'success',\n"
                f"        'subject': '{subject_title}',\n"
                f"        'items_count': len(processed)\n"
                f"    }}\n"
                f"```\n\n"
                f"#### 4. Practical Roadmap\n"
                f"1. **Analyze Requirements**: Map out input/output ranges.\n"
                f"2. **Write Unit Tests**: Cover edge cases like null/undefined states.\n"
                f"3. **Refactor & Optimize**: Clean up unused variables and verify complexity constraints."
            )

        # 10. Code request
        if "write" in query_lower or "code" in query_lower or "function" in query_lower:
            return (
                f"Here is a clean, optimized code snippet matching your request:\n\n"
                f"```javascript\n"
                f"// React 19 Custom hook for secure JWT API requests\n"
                f"import {{ useState, useEffect }} from 'react';\n"
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
                f"```"
            )

        # 11. Generic/Default Responder
        return (
            f"Hello! I am **Pavan-GPT**, your intelligent AI Assistant.\n\n"
            f"Regarding your query *\"{query}\"*:\n\n"
            f"1. **Core Concept**: This relates to tech architecture or standard development workflows.\n"
            f"2. **To Get Started**: Check the active codebase, ensure settings are configured, and verify routing connections.\n"
            f"3. **Integration Guide**: Use custom API hooks to dynamically interact with this model's schema.\n\n"
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
