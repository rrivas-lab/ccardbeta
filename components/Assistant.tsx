import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, Minimize2, ChevronDown } from 'lucide-react';
import { generateAssistantResponse } from '../services/geminiService';
import { GeminiMessage } from '../types';

interface AssistantProps {
  currentView: string;
  isOpen: boolean;
  onClose: () => void;
}

const Assistant: React.FC<AssistantProps> = ({ currentView, isOpen, onClose }) => {
  const [messages, setMessages] = useState<GeminiMessage[]>([
    { role: 'model', text: 'Hola, soy el asistente virtual de Credicard. ¿Necesitas ayuda con una venta o inventario?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if(isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: GeminiMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const responseText = await generateAssistantResponse(userMsg.text, currentView);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    setIsTyping(false);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 ${isOpen ? 'pointer-events-auto visible' : 'pointer-events-none invisible'}`}>
      
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose}
      ></div>

      {/* Main Chat Sheet */}
      <div className={`bg-white w-full h-[85vh] md:h-[600px] md:w-full rounded-t-[32px] flex flex-col shadow-2xl relative transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Drag Handle Area */}
        <div className="w-full flex justify-center pt-3 pb-1 cursor-pointer" onClick={onClose}>
            <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
        </div>

        {/* Header */}
        <div className="px-6 py-3 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-md shadow-blue-200">
                <Bot size={20} />
             </div>
             <div>
                 <h3 className="font-bold text-slate-800 text-sm">Asistente Virtual</h3>
                 <p className="text-[10px] text-green-600 flex items-center gap-1 font-medium bg-green-50 px-2 rounded-full w-fit mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> En línea
                 </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-slate-100">
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-white scroll-smooth no-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-4 text-sm leading-relaxed shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-[20px] rounded-tr-none' 
                  : 'bg-slate-100 text-slate-700 rounded-[20px] rounded-tl-none border border-slate-200'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
                <div className="bg-slate-100 px-4 py-3 rounded-[20px] rounded-tl-none border border-slate-200">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                  </div>
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-100 bg-white pb-safe-area-bottom">
          <div className="flex gap-2 bg-slate-50 p-2 rounded-full border border-slate-200 focus-within:ring-2 focus-within:ring-blue-100 transition-all shadow-sm">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu consulta..."
              className="flex-1 bg-transparent px-4 py-2 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <button 
              onClick={handleSend}
              className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Assistant;