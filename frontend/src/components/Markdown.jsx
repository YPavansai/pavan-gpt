import React from 'react';
import CodeBlock from './CodeBlock';

const Markdown = ({ content }) => {
  if (!content) return null;

  // Split content by triple backticks to extract code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  const renderTextWithFormatting = (text) => {
    // Escape simple HTML
    let formattedText = text;
    
    // Bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italics
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline code
    formattedText = formattedText.replace(/`(.*?)`/g, '<code class="bg-slate-800/80 px-1.5 py-0.5 rounded text-rose-400 font-mono text-sm">$1</code>');
    
    // Links
    formattedText = formattedText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-cyan-400 underline hover:text-cyan-300">$1</a>');

    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  const renderTable = (lines) => {
    const rows = lines.map(line => {
      return line.split('|').map(cell => cell.trim()).filter((_, index, arr) => index > 0 && index < arr.length - 1);
    });

    const headers = rows[0];
    const bodyRows = rows.slice(2); // Skip separator row

    return (
      <div className="my-4 overflow-x-auto rounded-lg border border-slate-700/40 bg-slate-900/35">
        <table className="min-w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-800/60 font-semibold text-slate-200">
            <tr>
              {headers.map((header, i) => (
                <th key={i} className="px-4 py-3 border-b border-slate-700/50">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {bodyRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-slate-800/10">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="px-4 py-3">{renderTextWithFormatting(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseBlock = (block, index) => {
    // 1. Check if table
    const lines = block.split('\n');
    if (lines.length >= 3 && lines[0].startsWith('|') && lines[1].includes('-|')) {
      return <div key={index}>{renderTable(lines)}</div>;
    }

    // 2. Parse paragraph line by line
    return (
      <div key={index} className="space-y-2 markdown-content">
        {lines.map((line, lIdx) => {
          const trimmed = line.trim();
          
          if (!trimmed) return <div key={lIdx} className="h-2"></div>;

          // Headings
          if (trimmed.startsWith('# ')) {
            return <h1 key={lIdx} className="text-3xl font-bold tracking-tight text-white mt-6 mb-3">{renderTextWithFormatting(trimmed.substring(2))}</h1>;
          }
          if (trimmed.startsWith('## ')) {
            return <h2 key={lIdx} className="text-2xl font-semibold tracking-tight text-slate-100 mt-5 mb-2.5">{renderTextWithFormatting(trimmed.substring(3))}</h2>;
          }
          if (trimmed.startsWith('### ')) {
            return <h3 key={lIdx} className="text-xl font-medium tracking-tight text-slate-200 mt-4 mb-2">{renderTextWithFormatting(trimmed.substring(4))}</h3>;
          }

          // Lists
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={lIdx} className="list-disc ml-6 text-slate-300">
                {renderTextWithFormatting(trimmed.substring(2))}
              </li>
            );
          }
          if (/^\d+\.\s/.test(trimmed)) {
            const content = trimmed.replace(/^\d+\.\s/, '');
            return (
              <li key={lIdx} className="list-decimal ml-6 text-slate-300">
                {renderTextWithFormatting(content)}
              </li>
            );
          }

          // General Paragraph
          return (
            <p key={lIdx} className="text-slate-300 leading-relaxed break-words text-[15px]">
              {renderTextWithFormatting(line)}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {parts.map((part, index) => {
        // Code Block
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.split('\n');
          const language = lines[0].replace('```', '').trim();
          const code = lines.slice(1, lines.length - 1).join('\n');
          return <CodeBlock key={index} language={language} code={code} />;
        }
        
        // General text block
        return parseBlock(part, index);
      })}
    </div>
  );
};

export default Markdown;
