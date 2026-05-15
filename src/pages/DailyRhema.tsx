import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Sparkles, 
  Calendar, 
  Quote, 
  Heart, 
  Share2, 
  RefreshCw,
  Loader2,
  BookOpen,
  Volume2,
  Pause
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/ui/button';
import { ScrollArea } from '../components/ui/scroll-area';
import { getGenAI } from '../lib/gemini';

const DAILY_RHEMA_SYSTEM_PROMPT = `
You are a wise spiritual mentor. Provide a 'Daily Rhema' for the user.
Your response must be in JSON format:
{
  "verse": "The full verse text",
  "reference": "Book Chapter:Verse",
  "reflection": "A 2-3 paragraph deep spiritual reflection/devotion",
  "prayer": "A short closing prayer",
  "action_step": "A practical application for today"
}
Focus on themes of hope, faith, and renewal.
`;

export default function DailyRhema() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const fetchRhema = async () => {
    setLoading(true);
    try {
      const ai = getGenAI();
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Generate today's spiritual nourishment.",
        config: {
          systemInstruction: DAILY_RHEMA_SYSTEM_PROMPT,
          responseMimeType: "application/json",
        }
      });
      const response = result.text || "{}";
      const cleanJson = response.replace(/```json|```/g, '');
      setData(JSON.parse(cleanJson));
    } catch (error) {
      console.error("Error fetching rhema:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRhema();
    return () => window.speechSynthesis.cancel();
  }, []);

  const handleVoiceAI = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const textToRead = `${data.verse}. ${data.reference}. Reflection. ${data.reflection}. Prayer. ${data.prayer}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16 flex flex-col">
      <div className="border-b bg-background/50 backdrop-blur-md sticky top-16 z-20">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className="gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            Back to Library
          </Button>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto py-12 px-6">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-6"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-primary/10 border-t-primary animate-spin" />
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] animate-pulse">Consulting the Word</p>
                  <p className="text-xs text-muted-foreground">Seeking spiritual nourishment for you...</p>
                </div>
              </motion.div>
            ) : data ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 pb-20"
              >
                {/* Hero Verse */}
                <header className="text-center space-y-8">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10 mb-4">
                    <Sparkles className="h-3 w-3 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Today's Rhema</span>
                  </div>
                  
                  <div className="relative px-8">
                    <Quote className="absolute -top-6 -left-2 h-12 w-12 text-primary/5 -z-10 rotate-12" />
                    <h1 className="text-3xl md:text-4xl font-serif italic leading-snug text-foreground/90">
                      "{data.verse}"
                    </h1>
                    <p className="mt-6 text-xs font-bold uppercase tracking-widest text-primary">
                      {data.reference}
                    </p>
                  </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                  <section className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-0.5 flex-1 bg-border/40" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Reflection</span>
                      <div className="h-0.5 flex-1 bg-border/40" />
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="text-base leading-relaxed text-foreground/80 space-y-4 whitespace-pre-wrap font-light">
                        {data.reflection}
                      </div>
                    </div>
                  </section>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl bg-secondary/30 border border-border/50 space-y-4">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500/60" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Prayer</h3>
                      </div>
                      <p className="text-sm italic leading-relaxed text-muted-foreground">
                        {data.prayer}
                      </p>
                    </div>

                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10 space-y-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-primary" />
                        <h3 className="text-[10px] font-bold uppercase tracking-widest">Action Step</h3>
                      </div>
                      <p className="text-sm leading-relaxed font-medium">
                        {data.action_step}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4 pt-8">
                   <Button 
                    onClick={handleVoiceAI} 
                    variant={isSpeaking ? "default" : "outline"} 
                    className={`rounded-full gap-2 text-xs font-bold uppercase tracking-widest ${isSpeaking ? 'cinematic-glow' : ''}`}
                  >
                    {isSpeaking ? <Pause className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    {isSpeaking ? 'Stop Reading' : 'Listen with Voice AI'}
                  </Button>
                  <Button 
                    onClick={() => navigate(`/read`)} 
                    variant="outline" 
                    className="rounded-full gap-2 text-xs font-bold uppercase tracking-widest"
                  >
                    <BookOpen className="h-3 w-3" />
                    Related Scripture
                  </Button>
                  <Button className="rounded-full gap-2 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/10">
                    <Share2 className="h-3 w-3" />
                    Share Word
                  </Button>
                </div>
                
                <div className="flex justify-center">
                   <Button onClick={fetchRhema} variant="ghost" className="text-[10px] uppercase tracking-widest text-muted-foreground opacity-30 hover:opacity-100 transition-opacity">
                    Seek New Insight
                  </Button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </ScrollArea>
    </div>
  );
}
