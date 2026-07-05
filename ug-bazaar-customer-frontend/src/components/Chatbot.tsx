import React, { useState, useEffect, useRef } from 'react';
import { apiClient } from '../api/apiClient';
import { useTranslation } from '../hooks/useTranslation';
import { MessageSquare, X, Send, Sparkles, User, RefreshCw, Volume2 } from 'lucide-react';

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

export default function Chatbot() {
  const { currentDict, lang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [inputMsg, setInputMsg] = useState('');
  
  const getInitialMessage = () => {
    if (lang === 'hi') {
      return 'नमस्ते! 🙏 यूजी बाजार में आपका स्वागत है! मैं आपकी क्या सहायता कर सकता हूँ? कूपन, ऑर्डर डिलीवरी या उत्पादों के बारे में पूछें!';
    }
    if (lang === 'mr') {
      return 'नमस्ते! 🙏 युजी बाजारमध्ये आपले स्वागत आहे! मी आपल्याला कशी मदत करू शकतो? कूपन, ऑर्डर डिलिव्हरी किंवा उत्पादनांबद्दल विचारा!';
    }
    return 'Namaste! 🙏 Welcome to UG Bazaar! How can I help you today? Ask about coupons, order delivery, or catalog products!';
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  // Set initial message when language changes
  useEffect(() => {
    setMessages([
      {
        role: 'ai',
        text: getInitialMessage()
      }
    ]);
  }, [lang]);

  const [isLoading, setIsLoading] = useState(false);
  const [history, setHistory] = useState<Array<{ role: string; text: string }>>([]);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (msgsEndRef.current) {
      msgsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSpeak = (text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean emojis from text before speaking
    const cleanText = text.replace(/[\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    const langMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN' };
    utterance.lang = langMap[lang] || 'en-IN';

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => v.lang.startsWith(utterance.lang) || v.lang.replace('_', '-').startsWith(utterance.lang));
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (messageText?: string) => {
    const text = messageText || inputMsg.trim();
    if (!text) return;

    if (!messageText) {
      setInputMsg('');
    }

    const updatedMsgs = [...messages, { role: 'user', text } as ChatMessage];
    setMessages(updatedMsgs);
    setIsLoading(true);

    const updatedHistory = [...history, { role: 'user', text }];
    if (updatedHistory.length > 12) updatedHistory.shift();
    setHistory(updatedHistory);

    const systemPrompt = `You are UG Bazaar's friendly AI shopping assistant in Bhangaram, Talodhi, Dist. Chandrapur, Maharashtra.
Owner: Uday Ainchwar (9422137293). Shop: 8390901925. Open 9AM-9PM daily.
Departments: Grocery, Hardware, Electrical, Electronics, Furniture, Krushi Kendra, General Store.
Free delivery above ₹500. 7-day returns. Payment: UPI, Card, COD.

Website Features & How to buy products online:
- Prioritize online shopping instructions. Tell the customer they can buy directly on our website!
- To search: Go to Search page (/search).
- To view product: Click on product to view details and click "+ Add" to add to cart.
- To checkout & place order: Go to Cart page (/cart), apply coupon codes, and select home delivery or pickup.
- To view orders or profile: Go to Profile page (/profile).
- To track order: Go to Tracking page (/tracking).
- To login/register: Go to Login page (/auth).

Guidelines:
- Respond in the language matching code: ${lang}. Current language preference is: ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'}.
- Reply strictly in ${lang === 'hi' ? 'Hindi' : lang === 'mr' ? 'Marathi' : 'English'}.
- Be extremely short, helpful, and use emojis. Max 2-3 sentences.
- Respond directly as the assistant. Do not use prefixes like "Assistant:".`;

    try {
      const res = await apiClient('/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text, system: systemPrompt, history: updatedHistory })
      });

      const reply = res.reply || 'Sorry, abhi network issues chal rahe hain. Please calls karein: 9422137293 📞';
      const cleanReply = reply.replace(/^Assistant:\s*/i, '').trim();

      setHistory(prev => [...prev, { role: 'assistant', text: cleanReply }]);
      setMessages(prev => [...prev, { role: 'ai', text: cleanReply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: 'Network down. Please calls check support at 9422137293 📞' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const getQuickReplies = () => {
    if (lang === 'hi') {
      return [
        'डिलीवरी कब मिलेगी? 🚚',
        'सामान वापस कैसे करें? 🔄',
        'सक्रिय कूपन कोड क्या हैं? 🏷️',
        'दुकान कब खुली रहती है? ⏰'
      ];
    }
    if (lang === 'mr') {
      return [
        'डिलिव्हरी कधी मिळेल? 🚚',
        'परतावा कसा करावा? 🔄',
        'सक्रिय कूपन कोड काय आहेत? 🏷️',
        'दुकान केव्हा उघडे असते? ⏰'
      ];
    }
    return [
      'Delivery status? 🚚',
      'Return policy? 🔄',
      'Active coupon codes? 🏷️',
      'Store timing? ⏰'
    ];
  };

  return (
    <>
      {/* FLOATING FAB WIDGET */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-brand-green text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 z-40 group"
      >
        <span className="absolute w-full h-full rounded-full bg-brand-green/20 animate-ping group-hover:animate-none"></span>
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-2rem)] h-[500px] bg-white border border-brand-border shadow-2xl rounded-2xl flex flex-col z-50 overflow-hidden animate-slide-up">
          
          {/* Header */}
          <div className="bg-brand-dark text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-green/20 flex items-center justify-center border border-brand-green/45">
                <Sparkles className="w-4 h-4 text-brand-green fill-brand-green" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm tracking-wide">
                  {lang === 'hi' ? 'यूजी बाजार सहायक' : lang === 'mr' ? 'युजी बाजार सहाय्यक' : 'UG Bazaar Assistant'}
                </h4>
                <p className="text-xs text-brand-green font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse"></span>
                  <span>AI Agent Online</span>
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-xl transition-all duration-150"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Board */}
          <div className="flex-1 p-4 overflow-y-auto space-y-5 bg-brand-light/35">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm ${m.role === 'ai' ? 'bg-brand-green/10 text-brand-green' : 'bg-brand-dark/10 text-brand-dark'}`}>
                  {m.role === 'ai' ? '🤖' : <User className="w-4 h-4" />}
                </div>
                <div className={`max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed font-semibold relative group ${
                  m.role === 'ai' 
                    ? 'bg-white text-brand-dark shadow-sm border border-brand-border/40' 
                    : 'bg-brand-green text-white shadow-md'
                }`}>
                  {m.text}
                  {m.role === 'ai' && (
                    <button 
                      onClick={() => handleSpeak(m.text)}
                      className="absolute -bottom-2.5 -right-2 bg-white hover:bg-brand-green/10 text-brand-muted hover:text-brand-green p-1 rounded-full border shadow-sm transition-all cursor-pointer flex items-center"
                      title="Speak response"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">
                  🤖
                </div>
                <div className="bg-white p-4 rounded-2xl border border-brand-border/40 shadow-sm flex items-center gap-1">
                  <span className="w-2 h-2 bg-brand-muted/40 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-brand-muted/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-brand-muted/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={msgsEndRef} />
          </div>

          {/* Quick Reply Chips */}
          <div className="p-2 border-t border-brand-border/40 flex items-center gap-1.5 overflow-x-auto bg-white whitespace-nowrap">
            {getQuickReplies().map((q) => (
              <button
                key={q}
                onClick={() => handleSend(q)}
                className="bg-brand-light hover:bg-brand-green/10 border border-brand-border/60 hover:border-brand-green/40 hover:text-brand-green text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-all duration-150"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-3 border-t border-brand-border bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={lang === 'hi' ? 'कुछ भी पूछें...' : lang === 'mr' ? 'काहीही विचारा...' : 'Ask anything...'}
              className="flex-1 bg-brand-light border border-brand-border/60 focus:border-brand-green focus:bg-white rounded-xl px-4 py-2.5 text-sm outline-none font-medium transition-all"
            />
            <button 
              onClick={() => handleSend()}
              className="bg-brand-green text-white p-2.5 rounded-xl hover:bg-opacity-90 transition-all flex items-center justify-center cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}
    </>
  );
}
