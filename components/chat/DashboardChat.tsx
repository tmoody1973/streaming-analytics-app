"use client";

import { useState } from "react";
import { Send, Sparkles, X } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DashboardChatProps {
  onGenerateDashboard: (userContext: string) => Promise<void>;
  isGenerating?: boolean;
}

export default function DashboardChat({ onGenerateDashboard, isGenerating = false }: DashboardChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your radio analytics assistant. Tell me what insights you want to see from your data. For example: 'Show me peak listening times' or 'Compare station performance'",
    },
  ]);
  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Generate dashboard with user context
    await onGenerateDashboard(input);

    // Add assistant response
    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "I've analyzed your request and updated the dashboard. What else would you like to explore?",
      },
    ]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 bg-radiomke-orange-500 hover:bg-radiomke-orange-600 text-white rounded-full p-4 shadow-lg transition-all flex items-center gap-2 z-50"
      >
        <Sparkles className="w-6 h-6" />
        <span className="font-semibold">Ask about your data</span>
      </button>
    );
  }

  return (
    <div className="bg-radiomke-charcoal-700 rounded-lg border border-radiomke-charcoal-400/30 overflow-hidden">
      {/* Header */}
      <div className="bg-radiomke-charcoal-600 px-4 py-3 flex items-center justify-between border-b border-radiomke-charcoal-400/30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-radiomke-orange-500" />
          <h3 className="font-semibold text-radiomke-cream-500">AI Assistant</h3>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-radiomke-cream-600 hover:text-radiomke-cream-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="h-64 overflow-y-auto p-4 space-y-4">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === "user"
                  ? "bg-radiomke-orange-500 text-white"
                  : "bg-radiomke-charcoal-600 text-radiomke-cream-500"
              }`}
            >
              <p className="text-sm">{message.content}</p>
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-radiomke-charcoal-600 text-radiomke-cream-500 rounded-lg px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-radiomke-orange-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-2 h-2 bg-radiomke-orange-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-2 h-2 bg-radiomke-orange-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="text-sm">Analyzing data...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-radiomke-charcoal-400/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask a question about your data..."
            disabled={isGenerating}
            className="flex-1 bg-radiomke-charcoal-600 border border-radiomke-charcoal-400/30 rounded-lg px-4 py-2 text-radiomke-cream-500 placeholder-radiomke-cream-700 focus:outline-none focus:ring-2 focus:ring-radiomke-orange-500 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="bg-radiomke-orange-500 hover:bg-radiomke-orange-600 disabled:bg-radiomke-charcoal-500 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-radiomke-cream-700 mt-2">
          Examples: "Show me peak listening hours" • "Compare stations by device" • "What's trending?"
        </p>
      </div>
    </div>
  );
}
