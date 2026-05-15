import { useState } from 'react';
import { User } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';
import { 
  Flame, 
  Calendar, 
  BookMarked, 
  Settings, 
  Award,
  ChevronRight,
  TrendingUp,
  Clock,
  ChevronLeft,
  Plus,
  MessageSquare,
  Heart as Pray,
  Heart,
  Sparkles,
  Save,
  RefreshCw
} from 'lucide-react';
import Markdown from 'react-markdown';
import { getGenAI } from '../lib/gemini';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'reflections' | 'prayers' | 'saved'>('reflections');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [aiEnhancing, setAiEnhancing] = useState(false);

  const handleEnhance = async () => {
    if (!newContent) return;
    setAiEnhancing(true);
    try {
      const ai = getGenAI();
      const promptText = `
        Enhance this spiritual reflection. 
        Add relevant Bible verse references and deepen the theological insights while maintaining the author's original heart.
        
        Original Reflection:
        ${newContent}
      `;
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: promptText,
      });
      setNewContent(result.text || newContent);
    } catch (error) {
      console.error("AI Enhancement failed", error);
    } finally {
      setAiEnhancing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-background pt-16 overflow-y-auto">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-8 gap-2 text-muted-foreground hover:text-foreground group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back
        </Button>
        
        {/* Header Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row items-center gap-8 mb-12"
        >
          <Avatar className="h-32 w-32 border-4 border-primary shadow-xl shadow-primary/10">
            <AvatarImage src={user.photoURL || ''} />
            <AvatarFallback className="text-4xl">{user.displayName?.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="text-center md:text-left flex-1">
            <h1 className="text-4xl font-serif mb-2 tracking-tight">{user.displayName}</h1>
            <p className="text-muted-foreground font-light mb-6">Faithful seeker, exploring the depths of Rhema since May 2026.</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 shadow-sm">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-semibold text-primary">12 Day Streak</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10 shadow-sm">
                < Award className="h-5 w-5 text-primary" />
                <span className="font-semibold text-primary">Prophecy Scholar</span>
              </div>
              <Button variant="ghost" size="sm" className="rounded-2xl border border-dashed border-primary/30">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Reading Stats */}
          <div className="space-y-8">
            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden">
              <CardHeader className="bg-primary text-primary-foreground">
                <CardTitle className="text-xl font-serif">Reading Progress</CardTitle>
                <CardDescription className="text-primary-foreground/70">Historical overview of your journey</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <StatRow icon={<TrendingUp className="h-4 w-4" />} label="Verses Read" value="1,248" />
                  <StatRow icon={<Clock className="h-4 w-4" />} label="Reading Time" value="14h 20m" />
                  <StatRow icon={<BookMarked className="h-4 w-4" />} label="Bookmarks" value="44" />
                  <StatRow icon={<Calendar className="h-4 w-4" />} label="Study Sessions" value="28" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border-none shadow-sm overflow-hidden bg-accent/20">
              <CardContent className="p-6">
                <h3 className="font-serif text-xl mb-4">Verse of the Day</h3>
                <p className="text-sm italic font-light mb-4 text-primary leading-relaxed">
                  "But seek first the kingdom of God and his righteousness, and all these things will be added to you."
                </p>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary/60">Matthew 6:33</p>
              </CardContent>
            </Card>
          </div>

          {/* Center/Right: Activity & Journal */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-[2rem] border-none shadow-sm min-h-[500px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex bg-secondary p-1 rounded-xl">
                  {(['reflections', 'prayers', 'saved'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        activeTab === tab ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
                {!isEditorOpen && (
                   <Button onClick={() => setIsEditorOpen(true)} className="rounded-full gap-2">
                    <Plus className="h-4 w-4" /> New {activeTab === 'prayers' ? 'Prayer' : 'Reflection'}
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  {isEditorOpen ? (
                    <motion.div
                      key="editor"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <input 
                        className="w-full bg-transparent text-3xl font-serif outline-none placeholder:text-muted-foreground/30"
                        placeholder="Title of your reflection..."
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                      />
                      <textarea
                        className="w-full bg-transparent min-h-[300px] outline-none text-base font-light leading-relaxed placeholder:text-muted-foreground/30 resize-none"
                        placeholder="Pour out your heart here..."
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                      />
                      <div className="flex items-center justify-between pt-6 border-t">
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            className="rounded-full gap-2 text-xs font-bold uppercase tracking-widest border-primary/20 text-primary"
                            onClick={handleEnhance}
                            disabled={aiEnhancing}
                          >
                            {aiEnhancing ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                            AI Enhance
                          </Button>
                          <Button variant="ghost" onClick={() => setIsEditorOpen(false)} className="text-xs font-bold uppercase tracking-widest">Cancel</Button>
                        </div>
                        <Button className="rounded-full gap-2 px-8" onClick={() => setIsEditorOpen(false)}>
                          <Save className="h-4 w-4" /> Save
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-6"
                    >
                      {activeTab === 'reflections' ? (
                        <>
                          <JournalItem 
                            date="Today, 08:30 AM"
                            title="Reflections on John 1"
                            content="The concept of the Word (Logos) being both with God and being God is so profound. It implies a coexistence that's hard to grasp but beautiful in its unity..."
                          />
                          <JournalItem 
                            date="Yesterday, 09:15 PM"
                            title="Strength in weakness (2 Cor 12:9)"
                            content="Thinking about how grace is sufficient even during my hardest weeks at work. AI assistant provided amazing context on Paul's thorn in the flesh."
                          />
                        </>
                      ) : activeTab === 'prayers' ? (
                        <div className="text-center py-20">
                          <p className="text-muted-foreground italic font-light">"Therefore I tell you, whatever you ask in prayer..."</p>
                          <Button variant="ghost" className="mt-4 text-xs font-bold uppercase tracking-widest" onClick={() => setIsEditorOpen(true)}>Add your first prayer note</Button>
                        </div>
                      ) : (
                         <div className="text-center py-20">
                          <p className="text-muted-foreground italic font-light">"Thy word have I hid in mine heart..."</p>
                          <Button variant="ghost" className="mt-4 text-xs font-bold uppercase tracking-widest" onClick={() => navigate('/read')}>Browse verses to save</Button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-[2rem] border-none shadow-sm p-6 flex items-center gap-4 group cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <BookMarked className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium">Bookmarks</h4>
                  <p className="text-xs text-muted-foreground">Access your saved verses</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Card>
              <Card className="rounded-[2rem] border-none shadow-sm p-6 flex items-center gap-4 group cursor-pointer hover:bg-muted/50 transition-colors">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-medium">Achievements</h4>
                  <p className="text-xs text-muted-foreground">View your milestones</p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto text-muted-foreground" />
              </Card>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function StatRow({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold text-primary">{value}</span>
    </div>
  );
}

function JournalItem({ date, title, content }: { date: string, title: string, content: string }) {
  return (
    <motion.div 
      whileHover={{ scale: 1.01 }}
      className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer"
    >
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2 flex items-center gap-2">
        <Clock className="h-3 w-3" /> {date}
      </div>
      <h4 className="font-serif text-lg mb-2">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed font-light line-clamp-2">
        {content}
      </p>
    </motion.div>
  );
}
