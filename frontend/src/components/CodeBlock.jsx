import React, { useState } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const CodeBlock = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-slate-700/50 bg-[#0d1117] shadow-xl">
      {/* CodeBlock Header (Mac Style) */}
      <div className="flex items-center justify-between bg-slate-900 px-4 py-2 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
          <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
          <span className="ml-2 font-mono text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            {language || 'code'}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1 rounded bg-slate-800 px-2.5 py-1 text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
        >
          {copied ? (
            <>
              <FiCheck className="text-green-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <FiCopy />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-slate-100">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
};

export default CodeBlock;
