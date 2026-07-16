import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const API_BASE = 'http://localhost:4000/api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  streaming?: boolean;
}

interface MentorChatPanelProps {
  interviewSessionId: string;
  questionId: string;
  currentCode: string;
}

export const MentorChatPanel: React.FC<MentorChatPanelProps> = ({
  interviewSessionId,
  questionId,
  currentCode,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getToken = () => localStorage.getItem('interview_prep_token') ?? '';

  /**
   * Sends a request to the SSE /mentor/stream endpoint and streams
   * the response tokens into the last assistant message in state.
   */
  const streamMessage = async (
    userText: string,
    mode: 'hint' | 'debug' | 'complexity' | 'general' = 'general'
  ) => {
    if (loading) {
      abortRef.current?.abort();
    }

    // Add user bubble
    setMessages((prev) => [...prev, { role: 'user', content: userText }]);
    setInput('');
    setLoading(true);

    // Add a placeholder streaming assistant bubble
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: '', streaming: true },
    ]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/mentor/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          interviewSessionId,
          questionId,
          currentCode,
          message: userText,
          mode,
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`Server error: ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ')) continue;
          const jsonStr = trimmed.slice(6);
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.done) break;
            if (parsed.error) throw new Error(parsed.error);
            if (parsed.token) {
              setMessages((prev) => {
                const updated = [...prev];
                const last = updated[updated.length - 1];
                if (last?.role === 'assistant') {
                  updated[updated.length - 1] = {
                    ...last,
                    content: last.content + parsed.token,
                  };
                }
                return updated;
              });
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'assistant') {
            updated[updated.length - 1] = {
              ...last,
              content: last.content || `⚠️ ${err.message || 'Stream failed. Please try again.'}`,
              streaming: false,
            };
          }
          return updated;
        });
      }
    } finally {
      // Mark streaming as done
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last?.role === 'assistant') {
          updated[updated.length - 1] = { ...last, streaming: false };
        }
        return updated;
      });
      setLoading(false);
    }
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || loading) return;
    streamMessage(text, 'general');
  };

  const handleQuickAction = (defaultPrompt: string, mode: 'hint' | 'debug' | 'complexity') => {
    const customPrompt = input.trim() ? `${defaultPrompt}\n\nMy question/thoughts: ${input.trim()}` : defaultPrompt;
    streamMessage(customPrompt, mode);
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] rounded-xl border border-[rgba(255,255,255,0.08)] overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.08)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-sm">
          🤖
        </div>
        <div>
          <p className="text-sm font-semibold text-white leading-none">AI Mentor</p>
          <p className="text-xs text-gray-500 mt-0.5">Streaming responses</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.1)]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <div className="text-4xl">💡</div>
            <p className="text-sm text-gray-400 max-w-xs">
              Ask me for a hint, debug help, or complexity analysis. I'll respond in real-time!
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex-shrink-0 flex items-center justify-center text-xs mr-2 mt-0.5">
                🤖
              </div>
            )}
            <div
              className={`max-w-[85%] px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-sm'
                  : 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-gray-200 rounded-tl-sm'
              }`}
            >
              {m.role === 'assistant' ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {m.content || ''}
                  </ReactMarkdown>
                  {m.streaming && (
                    <span className="inline-block w-1.5 h-4 bg-indigo-400 ml-0.5 animate-pulse rounded-sm align-middle" />
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-wrap">{m.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Buttons */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-[rgba(255,255,255,0.06)]">
        <button
          onClick={() => handleQuickAction("I'm stuck. Can you give me a small hint?", 'hint')}
          disabled={loading}
          className="text-xs bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1"
        >
          💡 Hint
        </button>
        <button
          onClick={() => handleQuickAction("My code isn't working. Can you spot any issues?", 'debug')}
          disabled={loading}
          className="text-xs bg-rose-600/80 hover:bg-rose-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1"
        >
          🐛 Debug
        </button>
        <button
          onClick={() => handleQuickAction("Analyze the time and space complexity of my code.", 'complexity')}
          disabled={loading}
          className="text-xs bg-emerald-600/80 hover:bg-emerald-500 disabled:opacity-40 text-white px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1"
        >
          ⏱️ Complexity
        </button>
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.08)] flex gap-2 items-end">
        <textarea
          rows={1}
          className="flex-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
          placeholder="Ask me anything about this problem..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{ maxHeight: '120px', overflowY: 'auto' }}
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all"
          title="Send (Enter)"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};
