import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { 
  Bot, Send, Sparkles, Copy, RefreshCw, Bookmark, Heart, ThumbsUp, ThumbsDown, 
  Volume2, Mic, Image, Search, ChevronRight, Activity
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'coach';
  text: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

export const AICoachPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        id: '1',
        sender: 'coach',
        text: "Welcome to your Pulse AI Coach. I have analyzed your biometric indicators, CNS sleep trends, and nutrition history.\n\nAsk me anything regarding running, strength progression, menstrual cycle wellness, or meal planning targets.",
        timestamp: new Date()
      }
    ]);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/ai/coach', { question: textToSend });
      const fullAnswer = res.data.answer;

      // Add a placeholder message for streaming
      const coachMsgId = (Date.now() + 1).toString();
      const placeholderMsg: ChatMessage = {
        id: coachMsgId,
        sender: 'coach',
        text: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, placeholderMsg]);

      // Stream character by character
      let idx = 0;
      const interval = setInterval(() => {
        setMessages(prev => {
          return prev.map(m => {
            if (m.id === coachMsgId) {
              return { ...m, text: fullAnswer.substring(0, idx + 4) };
            }
            return m;
          });
        });
        idx += 4;
        if (idx >= fullAnswer.length) {
          clearInterval(interval);
          setLoading(false);
        }
      }, 15);

    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'coach',
        text: err.response?.data?.message || "I encountered an issue analyzing that. Please ask questions related to wellness, training volume, or diets.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
      toast.success("Playing voice narration...");
    } else {
      toast.error("Text-to-speech not supported in this browser.");
    }
  };

  const handleFeedback = (id: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(m => {
      if (m.id === id) {
        if (type === 'like') {
          return { ...m, liked: !m.liked, disliked: false };
        } else {
          return { ...m, disliked: !m.disliked, liked: false };
        }
      }
      return m;
    }));
    toast.success("Thank you for your feedback!");
  };

  const handleMockVoice = () => {
    setInput("Analyze my leg volume progression for this week");
    toast.success("Transcribed voice query: 'Analyze my leg volume progression...'");
  };

  const handleMockAttachment = () => {
    toast.success("Uploading image telemetry...");
    setTimeout(() => {
      setInput("Check this photo: scanned chicken breast salad. What is the estimate?");
      toast.success("Image Analysis Result: Grilled Chicken Salad detected (~340 kcal, 35g Protein).");
    }, 1500);
  };

  const suggestedQuestions = [
    "Why is my bench press not improving?",
    "Phase-based workouts for follicular stage?",
    "High protein vegetarian meal details",
    "CNS overtraining indicators checklist"
  ];

  // Helper to parse Markdown bold, lists, and tables
  const renderMessageContent = (text: string) => {
    // Check if there is an markdown table
    if (text.includes('|') && text.includes('---')) {
      const lines = text.split('\n').filter(l => l.trim() !== '');
      const tableLines = lines.filter(l => l.trim().startsWith('|'));
      if (tableLines.length >= 3) {
        const headers = tableLines[0].split('|').map(s => s.trim()).filter(s => s !== '');
        const rows = tableLines.slice(2).map(r => r.split('|').map(s => s.trim()).filter(s => s !== ''));
        return (
          <div className="overflow-x-auto my-2 border border-border rounded-xl">
            <table className="min-w-full divide-y divide-border text-left">
              <thead className="bg-surface-light">
                <tr>
                  {headers.map((h, i) => <th key={i} className="px-3 py-2 font-bold text-text-heading text-[10px] uppercase tracking-wider">{h}</th>)}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-border">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-surface-hover">
                    {row.map((val, cellIdx) => <td key={cellIdx} className="px-3 py-2 text-[11px] text-text-body">{val}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Split on newline to detect bullet lists or plain text blocks
    const blocks = text.split('\n');
    return (
      <div className="space-y-2">
        {blocks.map((block, bIdx) => {
          const trimmed = block.trim();
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <li key={bIdx} className="ml-4 list-disc text-xs text-text-body leading-relaxed">
                {trimmed.substring(2)}
              </li>
            );
          }
          return (
            <p key={bIdx} className="text-xs text-text-body leading-relaxed">
              {block}
            </p>
          );
        })}
      </div>
    );
  };

  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col justify-between pb-4">
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-xl font-extrabold text-text-heading uppercase tracking-wider">Pulse Coach Interactive</h2>
          <p className="text-xs text-text-muted">Biometrics-grounded coaching assistant</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={14} />
            <input
              type="text"
              placeholder="Search chat log..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-border rounded-xl text-xs focus:outline-none focus:border-primary placeholder-text-muted"
            />
          </div>
          
          <div className="px-3 py-1 bg-primary-light border border-primary/20 rounded-full text-[10px] text-primary font-bold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Bot size={12} /> Coach Active
          </div>
        </div>
      </div>

      {/* Chat Messages Viewport */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-2 scrollbar-thin">
        {filteredMessages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div 
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Profile Bubble */}
              <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-bold text-xs shadow-sm ${
                isUser 
                  ? 'bg-gradient-to-br from-primary to-secondary text-white' 
                  : 'bg-zinc-100 text-text-heading border border-border'
              }`}>
                {isUser ? 'ME' : 'AI'}
              </div>

              {/* Message Bubble container */}
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className={`p-4 rounded-[20px] shadow-sm border ${
                  isUser 
                    ? 'bg-primary-light border-primary/20 text-text-heading rounded-tr-none' 
                    : 'bg-white border-border text-text-body rounded-tl-none'
                }`}>
                  {renderMessageContent(msg.text)}
                </div>

                {/* Thumbs up/down feedback & options */}
                {!isUser && msg.id !== '1' && (
                  <div className="flex items-center gap-4 pl-2 text-[10px] text-text-muted font-bold uppercase tracking-wider">
                    <button onClick={() => handleCopy(msg.text)} className="hover:text-text-heading flex items-center gap-1">
                      <Copy size={12} /> Copy
                    </button>
                    <button onClick={() => handleTextToSpeech(msg.text)} className="hover:text-text-heading flex items-center gap-1">
                      <Volume2 size={12} /> Read
                    </button>
                    <div className="flex items-center gap-2 border-l border-border pl-3">
                      <button 
                        onClick={() => handleFeedback(msg.id, 'like')} 
                        className={`hover:text-primary ${msg.liked ? 'text-primary' : ''}`}
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button 
                        onClick={() => handleFeedback(msg.id, 'dislike')} 
                        className={`hover:text-danger ${msg.disliked ? 'text-danger' : ''}`}
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 mr-auto">
            <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-border text-text-muted flex items-center justify-center font-bold text-xs animate-pulse">
              AI
            </div>
            <div className="p-4 rounded-[20px] bg-white border border-border text-text-muted text-xs flex items-center gap-2 shadow-sm">
              <RefreshCw className="animate-spin text-primary" size={14} />
              <span>Analyzing biometrics ledger...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts list & Input */}
      <div className="space-y-4 pt-4 border-t border-border bg-background">
        {/* Suggestion list */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                className="p-3 text-left bg-white hover:bg-zinc-50 border border-border rounded-2xl text-xs text-text-body transition-all flex flex-col justify-between gap-2.5 group shadow-sm"
              >
                <span className="font-semibold">{q}</span>
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Ask Coach <ChevronRight size={10} />
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Input box */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }}
          className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 transition-all shadow-sm"
        >
          <button
            type="button"
            onClick={handleMockAttachment}
            title="Attach form image / food picture"
            className="p-2 text-text-muted hover:text-text-heading hover:bg-zinc-50 rounded-xl"
          >
            <Image size={18} />
          </button>
          
          <button
            type="button"
            onClick={handleMockVoice}
            title="Voice input transcription"
            className="p-2 text-text-muted hover:text-text-heading hover:bg-zinc-50 rounded-xl"
          >
            <Mic size={18} />
          </button>

          <input
            type="text"
            placeholder="Ask AI Coach (e.g. 'Phase-based workouts', 'High protein diets')..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1 bg-transparent px-3 py-2 text-xs focus:outline-none placeholder-text-muted text-text-heading font-medium"
          />
          
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl hover:shadow-lg disabled:opacity-40 transition-all border-0 shadow-sm"
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </div>
  );
};
export default AICoachPage;
