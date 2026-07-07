import React, { useState } from 'react';
import { apiFetch } from '../../../../utils/apiFetch';

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
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (overrideMessage?: string, endpoint: string = '/mentor/chat') => {
    const textToSend = overrideMessage || input;
    if (!textToSend.trim() && endpoint === '/mentor/chat') return;

    if (endpoint === '/mentor/chat') {
      setMessages((prev) => [...prev, { role: 'user', content: textToSend }]);
      setInput('');
    } else {
      // For quick actions, just show what they requested
      let actionText = "Requesting hint...";
      if (endpoint.includes("debug")) actionText = "Requesting code debug...";
      if (endpoint.includes("complexity")) actionText = "Analyzing complexity...";
      setMessages((prev) => [...prev, { role: 'user', content: actionText }]);
    }
    
    setLoading(true);

    try {
      // In a real implementation, this connects to the AI backend
      const res = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          interviewSessionId,
          questionId,
          currentCode,
          message: textToSend,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.data.response }]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', content: 'Error: ' + data.message }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Network error occurred.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg p-4 border border-slate-700">
      <h3 className="text-xl font-bold text-white mb-4">AI Mentor</h3>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded-lg max-w-[85%] ${m.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-slate-700 text-slate-200'}`}>
            <p className="whitespace-pre-wrap text-sm">{m.content}</p>
          </div>
        ))}
        {loading && (
          <div className="p-3 rounded-lg bg-slate-700 text-slate-200 w-16">
            <span className="animate-pulse">...</span>
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        <button
          onClick={() => sendMessage(undefined, '/mentor/hint')}
          disabled={loading}
          className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-full whitespace-nowrap transition-colors"
        >
          💡 Get Hint
        </button>
        <button
          onClick={() => sendMessage(undefined, '/mentor/debug')}
          disabled={loading}
          className="text-xs bg-rose-600 hover:bg-rose-500 text-white px-3 py-1 rounded-full whitespace-nowrap transition-colors"
        >
          🐛 Debug Code
        </button>
        <button
          onClick={() => sendMessage(undefined, '/mentor/complexity')}
          disabled={loading}
          className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-full whitespace-nowrap transition-colors"
        >
          ⏱️ Analyze Complexity
        </button>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 bg-slate-800 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
          placeholder="Ask for a hint..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};
