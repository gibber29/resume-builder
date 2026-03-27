import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Minimize2, Maximize2, Sparkles, Loader2, X } from 'lucide-react';
import { chatWithGemini } from '../../api/gemini';

const GEMINI_MODEL_LABEL = import.meta.env.VITE_GEMINI_MODEL || 'gemini-2.0-flash';

const ChatAi = ({ resumeData, latexCode, onUpdateData, onUpdateLatex }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm your AI career coach. How can I help you improve your resume today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [quotaBlockedUntil, setQuotaBlockedUntil] = useState(null);
  const [retryCountdown, setRetryCountdown] = useState(0);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!quotaBlockedUntil) {
      setRetryCountdown(0);
      return undefined;
    }

    const updateCountdown = () => {
      const remainingSeconds = Math.max(0, Math.ceil((quotaBlockedUntil - Date.now()) / 1000));
      setRetryCountdown(remainingSeconds);

      if (remainingSeconds === 0) {
        setQuotaBlockedUntil(null);
      }
    };

    updateCountdown();
    const intervalId = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(intervalId);
  }, [quotaBlockedUntil]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || retryCountdown > 0) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatWithGemini(userMsg, resumeData, latexCode);
      
      setMessages(prev => [...prev, { role: 'ai', content: result.response }]);
      
      if (result.updatedData) {
        onUpdateData(result.updatedData);
      }
      if (result.updatedLatex) {
        onUpdateLatex(result.updatedLatex);
      }
    } catch (error) {
      if (error?.code === 'quota_exceeded') {
        const retrySeconds = Number(error?.retrySeconds) || 15;
        setQuotaBlockedUntil(Date.now() + retrySeconds * 1000);
      }

      setMessages(prev => [...prev, { role: 'ai', content: `Sorry, I encountered an error: ${error.message || "Unknown error"}. Please try again.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`fixed bottom-8 right-8 z-50 flex flex-col transition-all duration-500 ${isOpen ? 'w-[400px] h-[600px]' : 'w-16 h-16'}`}>
      {isOpen ? (
        <div className="flex-1 flex flex-col bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-600 to-indigo-600 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight">AI Career Coach</div>
                <div className="text-[10px] text-primary-100 font-medium">Always Online</div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg text-white transition-colors">
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                  ? 'bg-primary-600 text-white rounded-tr-none' 
                  : 'bg-slate-800 text-slate-200 border border-slate-700/50 rounded-tl-none'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700/50">
                  <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-slate-800/50 border-t border-slate-700/50 shrink-0">
            {retryCountdown > 0 && (
              <div className="mb-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-200">
                Chat is temporarily paused because the Gemini quota was exhausted. Try again in about {retryCountdown}s.
              </div>
            )}
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder={retryCountdown > 0 ? `Retry available in ${retryCountdown}s` : "Ask for changes or keywords..."}
                disabled={retryCountdown > 0}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim() || retryCountdown > 0}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="mt-2 text-[10px] text-slate-500 text-center uppercase tracking-widest font-bold">
              Powered by {GEMINI_MODEL_LABEL}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-br from-primary-500 to-indigo-600 hover:from-primary-400 hover:to-indigo-500 rounded-full flex items-center justify-center shadow-2xl shadow-primary-900/40 border border-white/10 transition-all hover:scale-110 active:scale-95 group"
        >
          <Bot className="w-8 h-8 text-white group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900"></div>
        </button>
      )}
    </div>
  );
};

export default ChatAi;
