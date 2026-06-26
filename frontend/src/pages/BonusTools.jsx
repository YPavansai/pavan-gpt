import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import Sidebar from '../components/Sidebar';
import Markdown from '../components/Markdown';
import { 
  FiCpu, FiBriefcase, FiAward, FiBookOpen, 
  FiTerminal, FiAlertCircle, FiZap, FiMap,
  FiArrowLeft, FiSend, FiFileText, FiUploadCloud, FiMenu
} from 'react-icons/fi';

const toolsList = [
  { id: 'career_advisor', name: 'AI Career Advisor', desc: 'Get industry recommendations, role matching, and skill requirements based on your interests.', icon: <FiBriefcase className="text-blue-400" /> },
  { id: 'resume_analyzer', name: 'Resume Analyzer', desc: 'Upload your CV to check formatting, ATS optimization, and get professional improvement tips.', icon: <FiAward className="text-violet-400" /> },
  { id: 'interview_generator', name: 'Interview Prep', desc: 'Generate role-specific mock questions complete with answer guidelines and guidelines.', icon: <FiBookOpen className="text-cyan-400" /> },
  { id: 'study_planner', name: 'Study Planner', desc: 'Create week-by-week customized study agendas to master any technological subject.', icon: <FiMap className="text-emerald-400" /> },
  { id: 'programming_assistant', name: 'Programming Assistant', desc: 'Get clean, well-commented code blocks alongside algorithmic time/space reviews.', icon: <FiTerminal className="text-amber-400" /> },
  { id: 'code_debugger', name: 'Code Debugger', desc: 'Identify syntax flaws, logical vulnerabilities, and performance bottlenecks in code.', icon: <FiAlertCircle className="text-rose-400" /> },
  { id: 'project_idea', name: 'Project Idea Generator', desc: 'Generate unique starter ideas based on your stack, complete with roadmap structures.', icon: <FiZap className="text-pink-400" /> },
  { id: 'roadmap_generator', name: 'Learning Roadmap', desc: 'Design detailed timelines and learning steps to go from beginner to senior engineer.', icon: <FiCpu className="text-indigo-400" /> },
];

const BonusTools = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  
  // Input fields
  const [userInput, setUserInput] = useState('');
  const [attachedDoc, setAttachedDoc] = useState(null);
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef(null);

  const handleSelectTool = (tool) => {
    setSelectedTool(tool);
    setUserInput('');
    setAttachedDoc(null);
    setResponse('');
    setError('');
  };

  const handleBack = () => {
    setSelectedTool(null);
    setResponse('');
    setError('');
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('documents/upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAttachedDoc(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to upload document.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() && !attachedDoc) {
      setError("Please fill in the input or upload a document.");
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const payload = {
        tool_type: selectedTool.id,
        user_input: userInput,
        document_id: attachedDoc?.id || undefined
      };

      const res = await api.post('bonus/', payload);
      setResponse(res.data.response);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "AI service execution failed. Please verify API key setup.");
    } finally {
      setLoading(false);
    }
  };

  // Helper inputs based on tool selection
  const renderFormFields = () => {
    switch (selectedTool.id) {
      case 'resume_analyzer':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400">Upload Resume (PDF, DOCX, TXT)</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700/60 hover:border-slate-500 rounded-xl p-6 text-center cursor-pointer bg-slate-900/30 transition-all flex flex-col items-center justify-center space-y-2"
              >
                {uploading ? (
                  <div className="h-6 w-6 rounded-full border border-slate-500 border-t-white animate-spin"></div>
                ) : attachedDoc ? (
                  <>
                    <FiFileText size={24} className="text-green-400 animate-bounce" />
                    <span className="text-xs font-semibold text-slate-200">{attachedDoc.name}</span>
                    <span className="text-[10px] text-green-500">Document Uploaded Successfully</span>
                  </>
                ) : (
                  <>
                    <FiUploadCloud size={24} className="text-slate-500" />
                    <span className="text-xs font-semibold text-slate-300">Click to browse CV files</span>
                    <span className="text-[10px] text-slate-500">Max file size 10MB</span>
                  </>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept=".pdf,.docx,.txt" 
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Target Role & Specific Questions</label>
              <textarea
                placeholder="E.g., Senior Frontend developer. Review spelling and tell me how to align bullet points..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={4}
                className="w-full rounded-xl glass-input px-4 py-3 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-600 resize-none"
                required
              />
            </div>
          </div>
        );
      
      case 'code_debugger':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Enter Defective Code Block</label>
              <textarea
                placeholder={`// Enter code snippet to debug\nfunction calculate() {\n  ...\n}`}
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={8}
                className="w-full rounded-xl bg-[#090c15] font-mono p-4 text-xs text-rose-300 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-700 resize-y"
                required
              />
            </div>
          </div>
        );

      case 'programming_assistant':
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">What program or script do you need written?</label>
              <textarea
                placeholder="E.g., Write a javascript function to merge two sorted arrays without extra space..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={4}
                className="w-full rounded-xl glass-input px-4 py-3 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-600 resize-none"
                required
              />
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400">Explain your request / specifications</label>
              <textarea
                placeholder={
                  selectedTool.id === 'career_advisor' ? 'Describe your skills, background, and interests...' :
                  selectedTool.id === 'interview_generator' ? 'Specify the job position (e.g., React Engineer) or tech stacks...' :
                  selectedTool.id === 'study_planner' ? 'What subject or topic do you want to learn? (E.g., Docker & Kubernetes)...' :
                  selectedTool.id === 'project_idea' ? 'Describe the tech stack or domain you want project starters for...' :
                  'Explain in detail what you want the assistant to generate...'
                }
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                rows={5}
                className="w-full rounded-xl glass-input px-4 py-3 text-sm text-slate-200 border border-slate-800 focus:border-slate-600 focus:outline-none placeholder-slate-600 resize-none"
                required
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen w-screen flex bg-[#0f172a] text-slate-100 overflow-hidden relative">
      {/* Sidebar navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(false)} />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-900 to-[#0e121e] overflow-hidden relative">
        <header className="h-16 flex items-center justify-between border-b border-white/5 bg-slate-950/20 backdrop-blur-md px-6 z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-slate-400 hover:text-white lg:hidden p-1 rounded-md hover:bg-slate-800/40"
            >
              <FiMenu size={20} />
            </button>
            <h2 className="text-sm font-semibold text-slate-200">AI Bonus Tools</h2>
          </div>
        </header>

        {/* Workspace body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-8 z-10">
          {!selectedTool ? (
            /* Tools grid */
            <div className="max-w-6xl mx-auto space-y-8">
              <div className="text-left space-y-2">
                <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">Specialized AI Agents</h1>
                <p className="text-sm text-slate-400">Launch expert personas optimized for coding, debugging, learning, and career development.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {toolsList.map((tool) => (
                  <div
                    key={tool.id}
                    onClick={() => handleSelectTool(tool)}
                    className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-slate-600/50 hover:bg-slate-900/45 transition-all hover:scale-[1.01] flex flex-col space-y-4"
                  >
                    <div className="h-10 w-10 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center justify-center shrink-0">
                      {tool.icon}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-bold text-slate-100">{tool.name}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{tool.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Interactive Tool Execution Interface */
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Back navigator */}
              <button 
                onClick={handleBack}
                className="flex items-center space-x-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <FiArrowLeft size={14} />
                <span>Back to Agents</span>
              </button>

              <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6">
                {/* Agent Header */}
                <div className="flex items-center space-x-4 border-b border-white/5 pb-4">
                  <div className="h-12 w-12 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0">
                    {selectedTool.icon}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{selectedTool.name}</h2>
                    <p className="text-xs text-slate-500">{selectedTool.desc}</p>
                  </div>
                </div>

                {/* Form or Result rendering */}
                {!response ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {renderFormFields()}

                    {error && (
                      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 flex items-center space-x-2">
                        <span>⚠️ {error}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || uploading}
                      className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="h-4 w-4 rounded-full border border-slate-400 border-t-white animate-spin"></div>
                          <span>Agent Analyzing Data...</span>
                        </>
                      ) : (
                        <>
                          <FiSend size={15} />
                          <span>Run Agent Task</span>
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Result Screen */
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Result</h3>
                      <div className="p-6 rounded-2xl bg-slate-950/40 border border-white/5">
                        <Markdown content={response} />
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4 border-t border-white/5">
                      <button
                        onClick={() => setResponse('')}
                        className="flex-1 py-3 border border-slate-800 hover:border-slate-700 bg-slate-900/30 text-slate-300 rounded-xl text-sm font-semibold transition-colors"
                      >
                        Run Again / Modify Input
                      </button>
                      <button
                        onClick={handleBack}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl text-sm font-semibold transition-all hover:scale-[1.01]"
                      >
                        Exit Agent
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BonusTools;
