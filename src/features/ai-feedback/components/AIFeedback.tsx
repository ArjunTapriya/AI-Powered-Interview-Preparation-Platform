import React, { useState, useEffect, useRef } from "react";
import { apiFetch } from "../../../utils/apiFetch";
import { 
  Bot, Sparkles, Send, Code, Image as ImageIcon, FileText, 
  Hexagon, Plus, Mic, TrendingUp, MessageSquare, MoreVertical, Edit2, Trash2, Check, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  messages: Message[];
  title?: string;
  updatedAt?: string;
}

export const AIFeedback: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const fetchHistory = async (silent = false) => {
    try {
      const res = await apiFetch("/ai-feedback/conversations");
      const data = await res.json();
      
      if (data.success && data.data) {
        setConversations(data.data);
        if (!silent && data.data.length > 0 && !conversationId) {
          setConversationId(data.data[0].id);
          setMessages(data.data[0].messages);
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI feedback history", err);
    } finally {
      if (!silent) setIsInitializing(false);
    }
  };

  // Fetch recent conversation on load
  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript + " ";
        }
      }
      if (final) {
        setInput(prev => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${final.trim()}` : final.trim();
        });
      }
    };

    recognition.onerror = (err: any) => {
      console.error("Speech recognition error:", err.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  const startNewChat = async () => {
    setIsInitializing(true);
    try {
      const res = await apiFetch("/ai-feedback/conversations", {
        method: "POST"
      });
      const data = await res.json();
      if (data.success) {
        setConversationId(data.data.id);
        setMessages([]);
        await fetchHistory(true); // refresh the list silently
      }
    } catch (err) {
      console.error("Error creating new chat", err);
    } finally {
      setIsInitializing(false);
    }
  };

  const selectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setConversationId(conv.id);
      setMessages(conv.messages);
    }
  };

  const handleRename = async (id: string) => {
    if (!editTitle.trim()) {
      setEditingId(null);
      return;
    }
    try {
      const res = await apiFetch(`/ai-feedback/conversations/${id}/title`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle.trim() })
      });
      const data = await res.json();
      if (data.success) {
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title: editTitle.trim() } : c));
      }
    } catch (err) {
      console.error("Failed to rename conversation", err);
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;
    try {
      const res = await apiFetch(`/ai-feedback/conversations/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setConversations(prev => prev.filter(c => c.id !== id));
        if (conversationId === id) {
          setConversationId(null);
          setMessages([]);
        }
      }
    } catch (err) {
      console.error("Failed to delete conversation", err);
    }
    setMenuOpenId(null);
  };

  const handleSend = async (messageText: string = input) => {
    if (!messageText.trim()) return;

    let currentConversationId = conversationId;
    
    // Create conversation on the fly if none exists
    if (!currentConversationId) {
      try {
        const res = await apiFetch("/ai-feedback/conversations", {
          method: "POST"
        });
        const data = await res.json();
        if (data.success) {
          currentConversationId = data.data.id;
          setConversationId(currentConversationId);
          await fetchHistory(true); // update sidebar silently
        } else {
          alert("Failed to create conversation: " + (data.message || "Unknown error"));
          return;
        }
      } catch (err: any) {
        console.error(err);
        alert("Network error: " + err.message);
        return;
      }
    }

    const newMessage: Message = { id: Date.now().toString(), role: "user", content: messageText };
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await apiFetch(`/ai-feedback/conversations/${currentConversationId}/message`, {
        method: "POST",
        body: JSON.stringify({ message: messageText })
      });
      const data = await res.json();
      if (data.success && data.data?.reply) {
        setMessages(prev => {
          const newMessages = [...prev, data.data.reply];
          // update the conversation list in state silently
          setConversations(cList => cList.map(c => 
            c.id === currentConversationId ? { ...c, messages: newMessages } : c
          ));
          return newMessages;
        });
      } else {
        alert("Failed to send message: " + (data.message || "Unknown error"));
      }
    } catch (err: any) {
      console.error("Failed to send message", err);
      alert("Network error: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestionChips = [
    { icon: <Code size={12} />, text: "Explain a DSA concept", color: "text-[var(--accent-primary)]", bg: "bg-[var(--accent-primary)]/10" },
    { icon: <FileText size={12} />, text: "Review my resume", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: <TrendingUp size={12} />, text: "Improve my answer", color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: <Hexagon size={12} />, text: "System design help", color: "text-emerald-400", bg: "bg-emerald-500/10" }
  ];

  if (isInitializing) {
    return (
      <div className="flex-1 flex items-center justify-center animate-pulse">
        <Bot size={48} className="text-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex w-full h-[calc(100vh-120px)] -mt-2 animate-fadeIn bg-transparent overflow-hidden">
      
      {/* Left Sidebar for Chat History */}
      <div className="w-64 border-r border-[var(--surface-border-new)] bg-transparent flex flex-col z-20">
        <div className="p-4 border-b border-[var(--surface-border-new)]">
          <button 
            onClick={startNewChat}
            className="w-full py-2.5 text-sm font-bold bg-[var(--surface-hover-new)] border border-[var(--surface-border-new)] rounded-lg hover:border-[var(--accent-primary)]/50 transition-colors flex items-center justify-center gap-2 text-white"
          >
            <Plus size={16} /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar-new p-3 space-y-2">
          {conversations.length === 0 && (
            <p className="text-xs text-gray-500 text-center mt-4">No past conversations.</p>
          )}
          {conversations.map((conv, idx) => (
            <div key={conv.id} className="relative group" onMouseLeave={() => setMenuOpenId(null)}>
              {editingId === conv.id ? (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-white/5 rounded-lg border border-white/10 mb-1">
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') handleRename(conv.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="bg-transparent text-sm text-white outline-none flex-1 min-w-0"
                  />
                  <button onClick={() => handleRename(conv.id)} className="text-emerald-400 hover:text-emerald-300 p-1"><Check size={14}/></button>
                  <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-300 p-1"><X size={14}/></button>
                </div>
              ) : (
                <button
                  onClick={() => selectConversation(conv.id)}
                  className={`w-full text-left px-3 py-3 text-sm rounded-lg flex items-center justify-between transition-colors mb-1 ${
                    conversationId === conv.id 
                      ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] border border-[var(--accent-primary)]/30" 
                      : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className="shrink-0" />
                    <span className="truncate font-medium">{conv.title || `Chat ${conversations.length - idx}`}</span>
                  </div>
                  
                  <div 
                    className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center shrink-0 ${menuOpenId === conv.id ? 'opacity-100' : ''}`}
                    onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === conv.id ? null : conv.id); }}
                  >
                    <MoreVertical size={16} className="text-gray-400 hover:text-white p-0.5 rounded hover:bg-white/10" />
                  </div>
                </button>
              )}

              {menuOpenId === conv.id && (
                <div className="absolute right-2 top-10 bg-[#1a1d2d] border border-white/10 rounded-lg shadow-xl py-1 z-30 min-w-[120px]">
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditTitle(conv.title || `Chat ${conversations.length - idx}`); 
                      setEditingId(conv.id); 
                      setMenuOpenId(null); 
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                  >
                    <Edit2 size={12} /> Rename
                  </button>
                  <button 
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="w-full text-left px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-transparent">
        {/* Chat header panel */}
        <div className="px-6 py-4 border-b border-[var(--surface-border-new)] bg-transparent flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[var(--accent-primary)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg shadow-[rgba(var(--accent-rgb),0.15)]">
              <Bot size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                AI Interview Coach
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-[10px] text-gray-400">Personalized feedback & mock preparation advice</p>
            </div>
          </div>
        </div>
        
        {/* Background glow effects */}
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-[var(--accent-primary)]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex-1 overflow-y-auto custom-scrollbar-new p-6">
          {messages.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center min-h-full py-12 max-w-2xl mx-auto text-center space-y-6">
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center relative z-10">
                  <Bot size={28} className="text-[var(--accent-primary)]" />
                </div>
                <div className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2">
                  <Sparkles size={14} className="text-[var(--accent-primary)]" />
                </div>
              </div>
              
              <div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  How can I <span className="text-[var(--accent-primary)]">help you today?</span>
                </h2>
                <p className="text-gray-400 text-xs md:text-sm">
                  Ask me anything about DSA, System Design, Mock Interviews, or your preparation strategy.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2.5 w-full">
                {suggestionChips.map((chip, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSend(chip.text)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[var(--surface-border-new)] bg-[var(--surface-hover-new)] hover:border-[var(--accent-primary)]/50 transition-all group"
                  >
                    <div className={`p-1.5 rounded-lg ${chip.bg}`}>
                      {chip.icon}
                    </div>
                    <span className="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">{chip.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Chat Messages
            <div className="space-y-6 max-w-4xl mx-auto w-full z-10 relative">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-4`}>
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center shrink-0 mt-1">
                      <Bot size={16} className="text-[var(--accent-primary)]" />
                    </div>
                  )}
                  
                  <div className={`max-w-[85%] rounded-2xl p-4 ${
                    msg.role === "user" 
                      ? "bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 text-white rounded-br-sm" 
                      : "bg-[rgba(255,255,255,0.03)] border border-[var(--surface-border-new)] text-gray-200 rounded-bl-sm"
                  }`}>
                    {msg.role === "user" ? (
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="text-sm leading-relaxed prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/10 prose-td:border-white/10 prose-th:border-white/10 max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]/30 flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} className="text-[var(--accent-primary)]" />
                  </div>
                  <div className="bg-[rgba(255,255,255,0.03)] border border-[var(--surface-border-new)] rounded-2xl rounded-bl-sm p-4 flex items-center gap-1.5 w-16">
                    <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1.5 h-1.5 bg-[var(--accent-primary)] rounded-full animate-bounce" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 z-10 bg-transparent border-t border-[var(--surface-border-new)]">
          <div className="max-w-4xl mx-auto w-full">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-purple)] rounded-2xl opacity-20 group-focus-within:opacity-40 transition-opacity blur" />
              <div className="relative bg-[#131522] border border-[var(--surface-border-new)] rounded-xl flex flex-col p-2 focus-within:border-white/20 transition-colors shadow-2xl">
                
                <textarea
                  rows={input.split("\n").length > 3 ? 3 : 1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent text-sm text-white placeholder-gray-500 resize-none outline-none py-3 px-3 custom-scrollbar-new min-h-[44px]"
                  style={{ maxHeight: '120px' }}
                />
                
                <div className="flex items-center justify-end mt-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2 pr-1">
                    <button 
                      onClick={toggleListening}
                      className={`p-2 transition-colors rounded-full ${isListening ? 'text-red-400 bg-red-500/10 animate-pulse' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                      title={isListening ? "Stop listening" : "Start Voice Typing"}
                    >
                      <Mic size={18} />
                    </button>
                    <button 
                      onClick={() => handleSend()}
                      disabled={!input.trim() || isLoading}
                      className="w-8 h-8 rounded-lg bg-[var(--accent-primary)] text-white flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--accent-primary)]/90 transition-colors"
                    >
                      <Send size={14} className="ml-0.5" />
                    </button>
                  </div>
                </div>
                
              </div>
            </div>
            <p className="text-center text-[10px] text-gray-500 mt-3 font-medium">
              AI can make mistakes. Please verify important information.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
