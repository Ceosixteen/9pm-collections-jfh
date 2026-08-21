import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, ShoppingBag, ChevronRight } from 'lucide-react';
import { ChatMessage, Currency, PerfumeProduct } from '../types';

interface AIAgentWidgetProps {
  currency: Currency;
  perfumes: PerfumeProduct[];
  onAddToCart: (perfume: PerfumeProduct) => void;
}

export const AIAgentWidget: React.FC<AIAgentWidgetProps> = ({
  currency,
  perfumes,
  onAddToCart,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPreviewBubble, setShowPreviewBubble] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'agent',
      text: 'Jambo! Welcome to Juba Fashion Hub. I\'m Amina from our sales team. What is your scalp or hair dealing with today — dryness, dullness, aging, or just want a full Head & Shoulders hair-care routine?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      quickActions: [
        { label: '✨ Best for Dry Skin', action: 'Which Head & Shoulders product is best for very dry or flaky skin?' },
        { label: '🛍️ Order Directly in Chat', action: 'I want to place an order directly with you right now!' },
        { label: '🚚 Delivery Rules in Juba', action: 'What are your delivery time and payment rules in Juba?' },
      ],
    },
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Show a preview bubble on a repeating 10s cadence (hidden 10s, shown 10s)
  // instead of popping up immediately, until the visitor actually opens the
  // chat.
  useEffect(() => {
    if (isOpen) return;
    let visible = false;
    const timer = setInterval(() => {
      visible = !visible;
      setShowPreviewBubble(visible);
    }, 10000);
    return () => clearInterval(timer);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          chatHistory: messages,
          selectedCurrency: currency,
          storeSlug: 'head-shoulders',
        }),
      });

      const data = await res.json();

      if (res.ok && data.text) {
        // Strip any accidental bold asterisks or <b> tags
        const cleanText = data.text.replace(/\*\*/g, '').replace(/<\/?b>/gi, '');
        const agentMsg: ChatMessage = {
          id: `agt-${Date.now()}`,
          sender: 'agent',
          text: cleanText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recommendedProductId: data.recommendedProductId,
        };
        setMessages((prev) => [...prev, agentMsg]);
      } else {
        throw new Error(data.error || 'Failed to get AI response');
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'I apologize, I experienced a brief connection hiccup. You can explore all our body care products in the catalog above or call support directly at +211 911 267 703!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-16 right-3 sm:bottom-20 sm:right-6 z-40 max-w-sm pointer-events-none flex flex-col items-end">
      
      {/* Floating Card Bubble */}
      {!isOpen && showPreviewBubble && (
        <div className="pointer-events-auto relative mb-2.5 bg-[#18181B] text-white p-3 sm:p-4 rounded-2xl shadow-2xl border border-purple-500/30 animate-fadeIn space-y-1.5 max-w-[280px] sm:max-w-xs">
          
          <button
            onClick={() => setShowPreviewBubble(false)}
            className="absolute top-2 right-2 p-1 text-gray-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Amina"
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-purple-400"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900"></span>
            </div>
            <div>
              <span className="text-[11px] sm:text-xs font-bold text-white block">Amina • Juba Fashion Hub</span>
              <span className="text-[9px] sm:text-[10px] text-purple-400 font-semibold block">Sales Team</span>
            </div>
          </div>

          <p className="text-[11px] sm:text-xs text-gray-300 leading-snug">
            Jambo! Tell me, what does your skin need help with today?
          </p>

          <button
            onClick={() => setIsOpen(true)}
            className="text-[11px] font-bold text-[#B24BF3] hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
          >
            <span>Tap to open chat</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="pointer-events-auto flex justify-end">
          <button
            onClick={() => {
              setIsOpen(true);
              setShowPreviewBubble(false);
            }}
            className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#18181B] text-white shadow-2xl hover:bg-slate-800 transition-all cursor-pointer border border-purple-500/30 ring-2 ring-purple-500/20"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                alt="Amina"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover border border-purple-400"
              />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 border border-slate-900"></span>
            </div>
            <span className="text-xs font-bold">Chat with Us</span>
          </button>
        </div>
      )}

      {/* Chat Window Popup - Compact Sizing for Mobile & Desktop */}
      {isOpen && (
        <div className="pointer-events-auto w-[calc(100vw-24px)] max-w-[360px] h-[400px] sm:h-[460px] max-h-[calc(100vh-120px)] rounded-2xl bg-white border border-gray-200 flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="p-3 bg-[#18181B] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
                  alt="Amina"
                  className="w-7 h-7 rounded-full object-cover border border-purple-400"
                />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-slate-900"></span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Amina • Sales Team</h3>
                <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                  Online in Juba
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full bg-gray-800 text-gray-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs bg-slate-50">
            {messages.map((m) => {
              const isAgent = m.sender === 'agent';
              const recPerfume = m.recommendedProductId
                ? perfumes.find((p) => p.id === m.recommendedProductId)
                : null;

              // Ensure text has no bolding asterisks or html tags
              const cleanText = m.text.replace(/\*\*/g, '').replace(/<\/?b>/gi, '');

              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[88%] p-2.5 rounded-xl ${
                      isAgent
                        ? 'bg-white text-slate-900 border border-gray-200 shadow-xs rounded-tl-none'
                        : 'bg-[#B24BF3] text-white rounded-tr-none font-normal'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-line font-normal">{cleanText}</p>
                    <span className="text-[9px] opacity-60 block text-right mt-0.5">
                      {m.timestamp}
                    </span>
                  </div>

                  {recPerfume && (
                    <div className="mt-1.5 p-2.5 rounded-xl bg-white border border-purple-200 max-w-[88%] space-y-1.5 shadow-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={recPerfume.image}
                          alt={recPerfume.name}
                          className="w-9 h-11 object-cover rounded-md"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{recPerfume.name}</span>
                          <span className="text-[#B24BF3] font-bold text-xs">
                            {currency === 'SSP' ? `SSP ${(recPerfume.priceUSD * 8000).toLocaleString()}` : `$${recPerfume.priceUSD}`}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => onAddToCart(recPerfume)}
                        className="w-full py-1 rounded-md bg-[#B24BF3] text-white font-bold text-[10px] flex items-center justify-center gap-1 hover:bg-[#9f35e3] cursor-pointer"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add {recPerfume.name} to Cart</span>
                      </button>
                    </div>
                  )}

                  {m.quickActions && (
                    <div className="flex flex-wrap gap-1 mt-1.5 max-w-[95%]">
                      {m.quickActions.map((qa, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(qa.action)}
                          className="px-2 py-0.5 rounded-full bg-white text-purple-900 border border-purple-200 hover:border-purple-400 text-[10px] font-semibold cursor-pointer shadow-xs"
                        >
                          {qa.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-1 text-purple-700 text-[11px] italic">
                <Sparkles className="w-3 h-3 animate-spin text-[#B24BF3]" />
                <span>Amina is typing...</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-1.5"
          >
            <input
              type="text"
              placeholder="Ask Amina about body care..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs text-slate-900 focus:outline-none focus:border-[#B24BF3] focus:bg-white"
            />
            <button
              type="submit"
              className="p-1.5 rounded-full bg-[#B24BF3] text-white hover:bg-[#9f35e3] cursor-pointer shadow-xs shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};
