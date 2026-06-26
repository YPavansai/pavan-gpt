import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, FiCpu, FiShield, FiMic, 
  FiFolder, FiCode, FiBriefcase, FiAward, FiLayers 
} from 'react-icons/fi';

const Home = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  return (
    <div className="min-h-screen gradient-bg text-slate-100 flex flex-col selection:bg-blue-600/30">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/40 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-violet-600 font-bold text-white shadow-md">
            P
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Pavan-GPT</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
            Login
          </Link>
          <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all hover:scale-[1.02]">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20 lg:py-32 max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="space-y-6"
        >
          <span className="inline-flex items-center space-x-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1.5 text-xs font-semibold text-blue-400">
            <FiCpu className="animate-spin-slow" />
            <span>Next-Generation Intelligent AI</span>
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent max-w-3xl leading-tight">
            Supercharge Your Workflow with Pavan-GPT
          </h1>
          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Your Premium Intelligent AI Assistant. Secure, context-aware, and packed with specialized career and coding tools.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/register" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-7 py-3.5 font-bold text-white shadow-xl shadow-blue-500/10 hover:shadow-blue-500/25 transition-all hover:scale-[1.03]">
              <span>Start Chatting Free</span>
              <FiArrowRight />
            </Link>
            <a href="#features" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/40 px-7 py-3.5 font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
              Explore Features
            </a>
          </div>
        </motion.div>

        {/* Decorative Glass Screen Mockup */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16 w-full max-w-5xl rounded-2xl border border-white/10 bg-slate-950/20 p-2.5 backdrop-blur-3xl shadow-2xl"
        >
          <div className="rounded-xl border border-white/5 bg-[#090d16] p-4 flex flex-col h-[380px] text-left">
            <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
              <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
              <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
              <span className="text-xs text-slate-500 font-mono pl-4">https://pavangpt.ai/chat</span>
            </div>
            <div className="flex-1 flex flex-col justify-end space-y-4 py-4 px-2">
              <div className="self-end bg-blue-600/20 border border-blue-500/30 rounded-xl px-4 py-2.5 text-xs text-blue-100 max-w-[70%]">
                How do I initialize a React 19 app with Tailwind v4?
              </div>
              <div className="self-start bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-slate-300 max-w-[80%] space-y-2">
                <p className="font-semibold text-slate-200">🚀 Set up React 19 + Tailwind v4:</p>
                <code className="block bg-[#090c14] p-2 rounded text-[10px] text-rose-400 font-mono">
                  npm install tailwindcss @tailwindcss/vite
                </code>
                <p>Register the plugin in your vite.config.js and import it in your index.css.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="px-6 py-20 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Full-Featured AI Workspace</h2>
            <p className="text-slate-400 max-w-xl mx-auto">Packed with next-generation tools designed to boost productivity, write code, and advance your career.</p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {/* Feature 1 */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 hover:scale-[1.01] transition-transform">
              <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <FiCpu size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Contextual Memory</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Remembers conversations across multiple messages, allowing you to ask follow-up questions naturally without repeating context.
              </p>
            </motion.div>

            {/* Feature 2 */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 hover:scale-[1.01] transition-transform">
              <div className="h-10 w-10 rounded-lg bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <FiFolder size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Document Summarizer</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload PDFs, DOCX, or TXT documents. Extract text immediately, view summaries, and chat directly about the content.
              </p>
            </motion.div>

            {/* Feature 3 */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 hover:scale-[1.01] transition-transform">
              <div className="h-10 w-10 rounded-lg bg-cyan-600/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FiMic size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Speech-to-Text & TTS</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Dictate prompts using your microphone, and listen to spoken responses with fully browser-integrated speech synthesis.
              </p>
            </motion.div>

            {/* Feature 4 */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 hover:scale-[1.01] transition-transform">
              <div className="h-10 w-10 rounded-lg bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <FiCode size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Coding Assistant</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Debug scripts, write clean syntax-highlighted code block components, and map programming algorithms on the fly.
              </p>
            </motion.div>

            {/* Feature 5 */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 hover:scale-[1.01] transition-transform">
              <div className="h-10 w-10 rounded-lg bg-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <FiBriefcase size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Career Advisor</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Get CV recommendations, mock interview questions, and tailored learning paths to step up your professional career.
              </p>
            </motion.div>

            {/* Feature 6 */}
            <motion.div variants={itemVariants} className="glass-panel p-6 rounded-2xl flex flex-col space-y-4 hover:scale-[1.01] transition-transform">
              <div className="h-10 w-10 rounded-lg bg-pink-600/10 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <FiShield size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">Secure JWT Protocol</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Never worry about your credentials. All api requests are protected by JSON Web Token authorization schemas.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-white">How Pavan-GPT Works</h2>
          <p className="text-slate-400">Getting started with our intelligent chatbot is fast and straightforward.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative p-6 bg-slate-900/30 border border-white/5 rounded-2xl space-y-3">
            <span className="absolute -top-4 left-6 h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg">1</span>
            <h3 className="text-lg font-semibold text-white pt-2">Register Account</h3>
            <p className="text-xs text-slate-400">Create a secure account with your username, email, and password. Access token pairs are created automatically.</p>
          </div>
          <div className="relative p-6 bg-slate-900/30 border border-white/5 rounded-2xl space-y-3">
            <span className="absolute -top-4 left-6 h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg">2</span>
            <h3 className="text-lg font-semibold text-white pt-2">Enter Gemini Key</h3>
            <p className="text-xs text-slate-400">Insert your secure Gemini API key in the backend environment file. Key is fully hidden from user client calls.</p>
          </div>
          <div className="relative p-6 bg-slate-900/30 border border-white/5 rounded-2xl space-y-3">
            <span className="absolute -top-4 left-6 h-9 w-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-lg">3</span>
            <h3 className="text-lg font-semibold text-white pt-2">Start Chatting</h3>
            <p className="text-xs text-slate-400">Upload documents, ask technical coding questions, dictation logs, and generate learning roadmaps instantly.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20 bg-slate-950/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">What Professionals Say</h2>
            <p className="text-slate-400">Real feedback from developers and analysts using Pavan-GPT.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <p className="text-xs text-slate-300 italic">"Pavan-GPT's resume analyzer gave me great tips. I corrected formatting and ATS points, leading to three interviews in two weeks."</p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="h-8 w-8 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-xs">S</div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Sanjay Kumar</h4>
                  <p className="text-[10px] text-slate-500">Junior Full Stack Developer</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <p className="text-xs text-slate-300 italic">"The document summarization is incredible. I uploaded a 50-page specifications PDF, and it parsed and answered queries inside seconds."</p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">M</div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Maria Thompson</h4>
                  <p className="text-[10px] text-slate-500">Business Systems Analyst</p>
                </div>
              </div>
            </div>
            <div className="glass-panel p-6 rounded-2xl space-y-3">
              <p className="text-xs text-slate-300 italic">"Writing roadmaps and study planners with Pavan-GPT made picking up NextJS 15 simple. The markdown tables and code copy buttons are perfect."</p>
              <div className="flex items-center space-x-3 pt-2">
                <div className="h-8 w-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-bold text-xs">A</div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Alex Rivera</h4>
                  <p className="text-[10px] text-slate-500">Computer Science Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="px-6 py-20 max-w-4xl mx-auto space-y-12">
        <h2 className="text-3xl font-extrabold text-white text-center">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-5 bg-slate-900/30 border border-white/5 rounded-xl space-y-2">
            <h3 className="font-semibold text-slate-200">Is my Gemini API key secure?</h3>
            <p className="text-xs text-slate-400">Absolutely. The Gemini API key is configured inside the Django server's `.env` environment variables. It is never transmitted or exposed to the client-side browser.</p>
          </div>
          <div className="p-5 bg-slate-900/30 border border-white/5 rounded-xl space-y-2">
            <h3 className="font-semibold text-slate-200">What files are supported for uploads?</h3>
            <p className="text-xs text-slate-400">We support `.pdf`, `.docx`, and `.txt` files up to 10MB in size. These are parsed immediately on the backend database for contextual questioning.</p>
          </div>
          <div className="p-5 bg-slate-900/30 border border-white/5 rounded-xl space-y-2">
            <h3 className="font-semibold text-slate-200">Does Pavan-GPT support voice dictation?</h3>
            <p className="text-xs text-slate-400">Yes! You can click the Microphone button in the chat view to transcribe your speech using the Browser Speech Recognition API, and use Text-to-Speech to play replies.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#080b13] px-6 py-10 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-6 w-6 rounded bg-gradient-to-tr from-blue-600 to-violet-600 text-white font-bold flex items-center justify-center text-[10px]">P</div>
            <span className="font-bold text-slate-300">Pavan-GPT</span>
          </div>
          <p>© 2026 Pavan-GPT. Built as a production-quality AI Assistant portfolio project.</p>
          <div className="flex space-x-4">
            <a href="#" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#" className="hover:text-slate-300">Terms of Use</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
