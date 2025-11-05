
import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Tool, ToolState, HistoryItem } from '../types';
import { generateContent } from '../services/geminiService';
import { marked } from 'marked';

// --- Reusable Icon Components ---
const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const HistoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);


interface ToolModalProps {
    tool: Tool;
    toolState: ToolState;
    onClose: () => void;
    updateToolState: (toolId: string, newState: Partial<ToolState>) => void;
    isOpen: boolean;
}

export const ToolModal: React.FC<ToolModalProps> = ({ tool, toolState, onClose, updateToolState, isOpen }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const outputRef = useRef<HTMLDivElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        updateToolState(tool.id, { ...toolState, input: e.target.value });
    };

    const handleSecondaryInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateToolState(tool.id, { ...toolState, secondaryInput: e.target.value });
    };

    const handleGenerate = useCallback(async () => {
        if (!toolState.input && tool.id !== 'trending') {
            return;
        }
        setIsLoading(true);
        updateToolState(tool.id, { ...toolState, output: '' });
        try {
            const result = await generateContent(tool.id, toolState.input, toolState.secondaryInput);
            updateToolState(tool.id, { ...toolState, output: result });
        } catch (error) {
            console.error(error);
            updateToolState(tool.id, { ...toolState, output: "Sorry, something went wrong." });
        } finally {
            setIsLoading(false);
        }
    }, [tool.id, toolState, updateToolState]);

    const handleCopyToClipboard = () => {
        if (toolState.output) {
            navigator.clipboard.writeText(outputRef.current?.innerText || toolState.output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };
    
    const handleSaveToHistory = () => {
        if (toolState.output) {
            const newItem: HistoryItem = { id: Date.now().toString(), text: toolState.output };
            const newHistory = [newItem, ...toolState.history.slice(0, 4)];
            updateToolState(tool.id, { ...toolState, history: newHistory });
        }
    };
    
    const handleClearHistory = () => {
        updateToolState(tool.id, { ...toolState, history: [] });
    };

    useEffect(() => {
        if (outputRef.current && toolState.output) {
            const rawMarkup = marked(toolState.output, { sanitize: false });
            // The type assertion is safe because we are controlling the source of the markup.
            outputRef.current.innerHTML = rawMarkup as string;
        }
    }, [toolState.output]);

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose}>
            <div
                className={`bg-[#1e1e1e] rounded-2xl border border-cyan-500/30 w-11/12 max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-700">
                    <div className="flex items-center gap-4">
                        {tool.icon}
                        <h2 className="text-2xl font-bold text-white neon-text-cyan">{tool.name}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <CloseIcon />
                    </button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto grid md:grid-cols-2 gap-6">
                    {/* Left side: Inputs & History */}
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-2">
                           <label className="text-cyan-400 font-semibold">{tool.needsSecondaryInput ? "Title / Keyword" : "Input"}</label>
                            <input
                                type="text"
                                value={toolState.input}
                                onChange={handleInputChange}
                                placeholder={tool.id === 'trending' ? "Enter topic (optional)" : "Enter your topic or keyword..."}
                                className="w-full bg-[#2B2B2B] text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                disabled={isLoading}
                            />
                        </div>
                        
                        {tool.needsSecondaryInput && (
                             <div className="flex flex-col gap-2">
                                <label className="text-cyan-400 font-semibold">{tool.secondaryInputLabel}</label>
                                <textarea
                                    value={toolState.secondaryInput || ''}
                                    onChange={handleSecondaryInputChange}
                                    placeholder={tool.secondaryInputPlaceholder}
                                    className="w-full bg-[#2B2B2B] text-white border border-gray-600 rounded-lg p-3 h-32 resize-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                    disabled={isLoading}
                                />
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-cyan-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-cyan-400 transition-all duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center gap-2 hover:shadow-lg hover:shadow-cyan-500/50 btn-animated"
                        >
                            {isLoading ? 'Generating...' : 'Generate'}
                        </button>

                        {/* History */}
                        <div className="mt-4">
                            <h3 className="text-lg font-semibold text-white mb-2">History</h3>
                             {toolState.history.length > 0 ? (
                                <>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {toolState.history.map(item => (
                                        <p key={item.id} className="text-gray-400 text-sm p-2 bg-[#2B2B2B] rounded-md truncate">{item.text}</p>
                                    ))}
                                </div>
                                <button onClick={handleClearHistory} className="text-sm text-red-400 hover:text-red-300 mt-2">Clear History</button>
                                </>
                            ) : (
                                <p className="text-gray-500 text-sm">No history yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right side: Output */}
                    <div className="bg-[#0A0A0A] rounded-lg p-4 flex flex-col min-h-[300px]">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-white">Result</h3>
                            {toolState.output && !isLoading && (
                                <div className="flex gap-2">
                                    <button onClick={handleSaveToHistory} title="Save to History" className="text-gray-400 hover:text-white transition-colors"><HistoryIcon/></button>
                                    <button onClick={handleCopyToClipboard} title="Copy to Clipboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-1">
                                      {copied ? 'Copied!' : <CopyIcon/>}
                                    </button>
                                </div>
                            )}
                        </div>
                        <div ref={outputRef} className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-cyan-400 flex-grow text-gray-300 overflow-y-auto">
                            {isLoading ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="flex items-center gap-2 text-cyan-400">
                                      <span className="font-semibold">Generating</span>
                                      <div className="loader-dot w-2 h-2 bg-cyan-400 rounded-full"></div>
                                      <div className="loader-dot w-2 h-2 bg-cyan-400 rounded-full"></div>
                                      <div className="loader-dot w-2 h-2 bg-cyan-400 rounded-full"></div>
                                    </div>
                                </div>
                            ) : (
                                !toolState.output && <p className="text-gray-500">Your generated content will appear here.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};