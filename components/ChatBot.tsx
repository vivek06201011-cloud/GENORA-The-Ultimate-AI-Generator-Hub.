
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { streamChat } from '../services/geminiService';

const ChatIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

const SendIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
);

interface Message {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    const handleSend = useCallback(async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { role: 'user', parts: [{ text: input }] };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const modelMessage: Message = { role: 'model', parts: [{ text: '' }] };
        setMessages(prev => [...prev, modelMessage]);

        const chatHistory = messages.map(msg => ({
            role: msg.role,
            parts: msg.parts
        }));

        await streamChat(chatHistory, input, (chunk) => {
            setMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.role === 'model') {
                    const updatedText = lastMessage.parts[0].text + chunk;
                    const updatedMessage = { ...lastMessage, parts: [{ text: updatedText }]};
                    return [...prev.slice(0, -1), updatedMessage];
                }
                return prev;
            });
        });

        setIsLoading(false);
    }, [input, isLoading, messages]);


    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-cyan-400 p-4 rounded-full shadow-lg hover:bg-cyan-300 transform hover:scale-110 transition-all duration-300 z-40 neon-glow-cyan"
                aria-label="Open Chat"
            >
                <ChatIcon />
            </button>

            <div className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`fixed bottom-6 right-6 w-[calc(100%-3rem)] sm:w-[400px] h-[600px] bg-[#1e1e1e] border border-cyan-500/50 rounded-2xl shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? 'transform translate-y-0' : 'transform translate-y-20'}`}>
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <h3 className="text-lg font-bold text-white neon-text-cyan">Genora Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white"><CloseIcon/></button>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-500 text-black' : 'bg-[#2B2B2B] text-white'}`}>
                                    <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'model' && (
                           <div className="flex justify-start">
                             <div className="max-w-[80%] p-3 rounded-lg bg-[#2B2B2B] text-white">
                                <div className="flex items-center gap-2">
                                  <div className="loader-dot w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                  <div className="loader-dot w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                  <div className="loader-dot w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                                </div>
                              </div>
                           </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t border-gray-700">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask anything..."
                                className="flex-1 bg-[#2B2B2B] text-white border border-gray-600 rounded-full py-2 px-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                                disabled={isLoading}
                            />
                            <button onClick={handleSend} disabled={isLoading || !input} className="bg-cyan-500 p-2.5 rounded-full text-black disabled:bg-gray-600 disabled:cursor-not-allowed transition-all hover:bg-cyan-400 transform hover:scale-110 active:scale-95">
                                <SendIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};