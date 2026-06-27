// components/AIQuoteChat.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Lock } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIQuoteChatProps {
  isPro: boolean;
  sessionToken: string;
  initialContext?: string;
}

const STARTER_PROMPTS = [
  "What should I charge for 180ft cedar fence, sloped yard, 2 gates?",
  "A contractor quoted me $8,400 for 150ft vinyl fence. Is that fair?",
  "How much will a 200ft wood privacy fence cost in 75201?",
  "Give me a pro bid for 120ft chain link, standard terrain, 1 gate.",
];

export default function AIQuoteChat({ isPro, sessionToken, initialContext }: AIQuoteChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text?: string) {
    const userText = text ?? input.trim();
    if (!userText || loading) return;

    const userMsg: Message = { role: "user", content: userText };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          messages: [
            ...(initialContext && messages.length === 0
              ? [{ role: "user", content: `Current project context: ${initialContext}` },
                 { role: "assistant", content: "Got it — I have your current project loaded. What would you like to know?" }]
              : []),
            ...updated.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      const data = await res.json();

      if (res.status === 403 && data.upgrade) {
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "This feature requires a Pro subscription. Upgrade to unlock the AI quoting assistant.",
        }]);
        return;
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: data.reply ?? "Something went wrong. Please try again.",
      }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Connection error. Please try again.",
      }]);
    } finally {
      setLoading(false);
    }
  }

if (!isPro)   {
    return (
      <div className="rounded-2xl border border-orange-400/20 bg-slate-900 p-6 text-center">
        <Lock className="mx-auto mb-3 text-orange-400" size={28} />
        <h3 className="text-lg font-black text-white">AI Quoting Assistant</h3>
        <p className="mt-2 text-sm text-slate-400">
          Ask natural language questions — get instant quotes, bid scores, and contractor pricing from FenceQuoteHQ's real data.
        </p>
        <button className="mt-4 rounded-xl bg-orange-500 px-6 py-2.5 font-bold text-white hover:bg-orange-600">
          Upgrade to Pro — $49/mo
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-2xl border border-slate-700 bg-slate-900 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-800 px-5 py-4">
        <div className="rounded-xl bg-orange-500/20 p-2">
          <Sparkles className="text-orange-400" size={18} />
        </div>
        <div>
          <h3 className="font-black text-white">AI Quoting Assistant</h3>
          <p className="text-xs text-slate-400">Powered by FenceQuoteHQ pricing data</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">PRO</span>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ minHeight: 280, maxHeight: 420 }}>
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-sm text-slate-400">Try asking:</p>
            {STARTER_PROMPTS.map(prompt => (
              <button
                key={prompt}
                onClick={() => sendMessage(prompt)}
                className="block w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-left text-sm text-slate-300 hover:border-orange-400/40 hover:bg-slate-700 transition"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === "user"
                ? "bg-orange-500 text-white"
                : "bg-slate-800 text-slate-200"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-800 px-4 py-3">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div key={i} className="h-2 w-2 rounded-full bg-orange-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="border-t border-slate-800 p-4 flex gap-3">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Ask about fence costs, bid scoring, or contractor pricing..."
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-orange-400"
          disabled={loading}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="rounded-xl bg-orange-500 p-2.5 text-white hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
