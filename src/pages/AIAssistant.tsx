import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, MessageSquare, Book, Lightbulb, RefreshCw, Volume2, History } from 'lucide-react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { Input } from '../components/ui/input';
import { getGenAI } from '../lib/gemini';
import Markdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const SUGGESTED_QUESTIONS = [
  "Explain Romans 8",
  "Verses About Peace",
  "Explain Revelation",
  "What is Isaiah 53 about?",
  "How to pray effectively?",
];

const SYSTEM_PROMPT = `
You are Rhema AI, a wise and compassionate spiritual companion. 
Your goal is to help users understand the Bible deeply and apply it to their lives.
Provide theological context, historical insights, and practical spiritual reflections.
Always maintain a reverent and encouraging tone.
When referencing verses, provide the full text if relevant.
`;

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const ai = getGenAI();
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        })),
      });

      const result = await chat.sendMessage({ message: text });
      const response = result.text || "";

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceExplain = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex-1 flex flex-col bg-background h-[calc(100vh-64px)] overflow-hidden">
      <div className="flex-1 overflow-hidden flex flex-col max-w-5xl mx-auto w-full pt-8 px-4 md:px-8">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/10">
              <Bot className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI Assistant</h1>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Divine Wisdom Companion</span>
            </div>
          </div>
          <Button variant="outline" size="sm" className="rounded-full gap-2 text-xs font-bold uppercase tracking-widest" onClick={() => setMessages([])}>
            <History className="h-3 w-3" /> Clear History
          </Button>
        </header>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 pb-20">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="h-10 w-10 text-primary animate-pulse" />
              </div>
              <h2 className="text-3xl font-serif italic text-foreground/80">"How can I help your journey today?"</h2>
              <p className="text-muted-foreground max-w-md mx-auto text-sm">
                Ask about theology, seek context for a verse, or explore spiritual themes with your AI companion.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <motion.button
                  key={q}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => handleSend(q)}
                  className="p-4 rounded-xl border bg-secondary/30 hover:bg-secondary/50 hover:border-primary/20 transition-all text-left text-xs font-medium group flex items-center justify-between"
                >
                  {q}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                </motion.button>
              ))}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 pr-4 mb-4">
            <div className="space-y-8 pb-10">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-secondary' : 'bg-primary'}`}>
                      {m.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4 text-primary-foreground" />}
                    </div>
                    <div className={`space-y-2 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <div className={`p-4 rounded-2xl ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary/50'}`}>
                        <div className="text-[13px] leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            <Markdown>{m.content}</Markdown>
                        </div>
                      </div>
                      {m.role === 'assistant' && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                            onClick={() => handleVoiceExplain(m.content)}
                          >
                            <Volume2 className="h-3 w-3 mr-1" /> Voice Explain
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 px-2 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
                          >
                            <Book className="h-3 w-3 mr-1" /> Open Verses
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div className="bg-secondary/50 p-4 rounded-2xl">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        )}

        <div className="p-4 bg-background border-t mt-auto">
          <div className="relative flex items-center gap-2 max-w-3xl mx-auto w-full">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about the Word..."
              className="flex-1 bg-secondary/50 border-border/50 h-12 rounded-full px-6 focus-visible:ring-primary/20"
            />
            <Button 
              size="icon" 
              className="h-12 w-12 rounded-full absolute right-0" 
              disabled={loading || !input.trim()}
              onClick={() => handleSend()}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
)
