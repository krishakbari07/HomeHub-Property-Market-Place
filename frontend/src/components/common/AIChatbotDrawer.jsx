import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  ExternalLink,
} from "lucide-react";
import { aiApi } from "../../services/api";
import { Link } from "react-router-dom";

const QUICK_PROMPTS = [
  "Villas in Bodakdev",
  "Properties under ₹ 2 Cr",
  "3 BHK Apartments for rent",
  "Best residential areas in Ahmedabad",
];

const INITIAL_MESSAGE = {
  id: "welcome",
  sender: "ai",
  text: "Hello! I am your HomeHub Real Estate AI Advisor, powered by Google Gemini. I have direct access to our verified catalog of luxury residences, villas, and apartments. How may I assist your property search today?",
  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
};

export default function AIChatbotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderMessageContent = (content) => {
    if (typeof content !== "string") return content;
    const parts = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }
      const label = match[1];
      const url = match[2];
      if (url.startsWith("/property/")) {
        parts.push(
          <Link
            key={match.index}
            to={url}
            onClick={() => setIsOpen(false)}
            className="text-forest-700 hover:text-forest-900 font-bold underline inline-flex items-center gap-0.5"
          >
            <span>{label}</span>
            <ExternalLink className="w-2.5 h-2.5 inline" />
          </Link>
        );
      } else {
        parts.push(
          <a
            key={match.index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-forest-700 hover:text-forest-900 font-bold underline"
          >
            {label}
          </a>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (userText) => {
    const textToSend = (userText || inputValue).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      // Prepare multi-turn history
      const conversationHistory = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({
          role: m.sender === "user" ? "user" : "assistant",
          content: m.text,
        }));

      const res = await aiApi.sendChat(textToSend, conversationHistory);

      const aiReplyText =
        res?.reply ||
        "I am currently cross-referencing our active listings. Please feel free to ask about specific localities or configurations.";

      const aiMsg = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiReplyText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        propertiesCount: res?.verifiedPropertiesContextCount,
      };

      setMessages((prev) => [...prev, aiMsg]);

      if (!isOpen) {
        setHasUnread(true);
      }
    } catch (err) {
      console.error("AI Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: "I experienced a temporary communication hiccup with the AI model. Our verified properties are available on the Buy and Rent pages.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Open HomeHub AI Property Assistant"
            className="group relative flex items-center space-x-2.5 bg-[#172B3A] hover:bg-[#1E364B] text-white px-4 py-3 sm:px-5 sm:py-3.5 rounded-full shadow-lg border border-[#D5AD72]/40 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#315C4B]"
          >
            <div className="relative">
              <Sparkles className="w-5 h-5 text-[#D5AD72] group-hover:rotate-12 transition-transform duration-300" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              )}
            </div>
            <div className="text-left font-sans">
              <span className="block text-xs font-bold tracking-wide text-white">Ask AI Assistant</span>
              <span className="block text-[10px] text-[#D5AD72] font-medium leading-none">HomeHub Real Estate</span>
            </div>
          </button>
        )}
      </div>

      {/* Slide-out / Modal Drawer */}
      {isOpen && (
        <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[420px] max-w-[440px] h-[550px] sm:h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-[#DCE2E5] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#172B3A] text-white px-5 py-4 flex items-center justify-between border-b border-[#243E53] shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#315C4B] flex items-center justify-center border border-[#D5AD72]/40 shadow-inner">
                <Bot className="w-5 h-5 text-[#D5AD72]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-heading font-bold text-sm tracking-wide text-white">HomeHub AI Advisor</h3>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-[#D5DDE2] font-sans">Powered by Google Gemini 2.5</p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                onClick={handleResetChat}
                title="Restart conversation"
                className="p-1.5 text-gray-300 hover:text-white hover:bg-[#243E53] rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="p-1.5 text-gray-300 hover:text-white hover:bg-[#243E53] rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="bg-[#F7F5F0] border-b border-[#DCE2E5] px-4 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 text-xs">
            <span className="text-[11px] text-[#637582] font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D5AD72]" /> Quick:
            </span>
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white hover:bg-[#EAE5D9] text-[#24313A] text-[11px] font-medium border border-[#DCE2E5] transition-colors shadow-2xs hover:border-[#315C4B]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => {
              const isAi = msg.sender === "ai";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start space-x-2.5 ${isAi ? "justify-start" : "justify-end"}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-[#315C4B] text-[#D5AD72] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[82%] rounded-2xl px-4 py-3 text-xs leading-relaxed font-sans shadow-2xs ${
                      isAi
                        ? "bg-white text-[#24313A] border border-[#DCE2E5]"
                        : "bg-[#315C4B] text-white font-medium"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{renderMessageContent(msg.text)}</div>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-between ${
                        isAi ? "text-[#7B8B95]" : "text-emerald-100/80"
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      {isAi && msg.propertiesCount && (
                        <span className="text-[9px] font-semibold text-[#315C4B]">
                          Verified Grounded
                        </span>
                      )}
                    </div>
                  </div>

                  {!isAi && (
                    <div className="w-7 h-7 rounded-lg bg-[#172B3A] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-start space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#315C4B] text-[#D5AD72] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-[#DCE2E5] rounded-2xl px-4 py-3 text-xs text-[#637582] shadow-2xs flex items-center space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#315C4B] animate-bounce" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#315C4B] animate-bounce [animation-delay:0.2s]" />
                  <span className="inline-block w-2 h-2 rounded-full bg-[#315C4B] animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] font-medium text-[#24313A] ml-1">Analyzing live database...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-white border-t border-[#DCE2E5] shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about properties, pricing, locations..."
                className="flex-1 bg-[#F7F5F0] border border-[#DCE2E5] rounded-xl px-3.5 py-2.5 text-xs text-[#24313A] placeholder-[#8A98A1] focus:outline-none focus:ring-1 focus:ring-[#315C4B] focus:bg-white transition-all font-sans"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || loading}
                aria-label="Send message"
                className="bg-[#315C4B] hover:bg-[#254639] disabled:bg-gray-200 disabled:text-gray-400 text-white p-2.5 rounded-xl transition-colors shadow-2xs flex items-center justify-center shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="mt-1.5 flex items-center justify-between px-1 text-[10px] text-[#8A98A1]">
              <span>Real data only • No fabricated listings</span>
              <Link to="/buy" onClick={() => setIsOpen(false)} className="hover:text-[#315C4B] font-medium flex items-center gap-0.5">
                Browse catalog <ExternalLink className="w-2.5 h-2.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
