import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BOOKS, TRANSLATIONS, Translation, Verse, Book } from '../lib/constants';
import { fetchVersesFromAPI, preloadAdjacentChapters } from '../services/bibleService';
import { ScrollArea } from '../components/ui/scroll-area';
import { Button } from '../components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Languages, 
  Info, 
  Bookmark, 
  Highlighter, 
  Search,
  Book as BookIcon,
  MessageSquare,
  Share2,
  Loader2,
  ChevronDown,
  Flame,
  Heart,
  Anchor,
  Wind,
  Shield,
  Layers,
  Clock,
  ArrowRight,
  Volume2,
  Play,
  Pause,
  FastForward,
  Rewind
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getGenAI, BIBLE_ASSISTANT_SYSTEM_INSTRUCTION } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { ScrollArea as ScrollAreaUI } from '../components/ui/scroll-area';

export default function BibleReader() {
  const { bookId: paramBookId, chapter: paramChapter } = useParams();
  const navigate = useNavigate();

  const [activeBookId, setActiveBookId] = useState(paramBookId || 'john');
  const [activeChapter, setActiveChapter] = useState(parseInt(paramChapter || '1'));
  const [translation1, setTranslation1] = useState<Translation>('NIV');
  const [translation2, setTranslation2] = useState<Translation | null>(null);
  
  const [verses1, setVerses1] = useState<Verse[]>([]);
  const [verses2, setVerses2] = useState<Verse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<Verse | null>(null);
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [selection, setSelection] = useState<{ x: number, y: number, text: string, verseId?: string } | null>(null);
  const [highlights, setHighlights] = useState<Record<string, string>>({});
  const [collections, setCollections] = useState<Verse[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechRate, setSpeechRate] = useState(0.9);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Try to find the associated verse ID from the DOM
      let verseElement = e.target as HTMLElement;
      while (verseElement && !verseElement.dataset?.verseId && verseElement.parentElement) {
        verseElement = verseElement.parentElement;
      }

      setSelection({
        x: rect.left + rect.width / 2,
        y: rect.top,
        text: sel.toString(),
        verseId: verseElement?.dataset?.verseId
      });
    } else {
      setSelection(null);
    }
  }, []);

  const handleToggleParallel = useCallback(() => {
    if (translation2) {
      setTranslation2(null);
    } else {
      // Automatic selection logic
      if (translation1 === 'TB') {
        setTranslation2('NIV');
      } else {
        setTranslation2('TB');
      }
    }
  }, [translation1, translation2]);

  const handleHighlight = useCallback((color: string) => {
    if (selection?.verseId) {
      setHighlights(prev => ({ ...prev, [selection.verseId!]: color }));
      setSelection(null);
    }
  }, [selection]);

  const addToCollection = useCallback(() => {
    if (selection?.verseId) {
      const verse = verses1.find(v => v.id === selection.verseId) || verses2.find(v => v.id === selection.verseId);
      if (verse && !collections.find(c => c.id === verse.id)) {
        setCollections(prev => [...prev, verse]);
      }
      setSelection(null);
    }
  }, [selection, collections, verses1, verses2]);

  const activeBook = useMemo(() => BOOKS.find(b => b.id === activeBookId) || BOOKS[0], [activeBookId]);

  useEffect(() => {
    if (paramBookId && paramBookId !== activeBookId) {
      setActiveBookId(paramBookId);
      setTransitioning(true);
    }
    if (paramChapter && parseInt(paramChapter) !== activeChapter) {
      setActiveChapter(parseInt(paramChapter));
      setTransitioning(true);
    }
  }, [paramBookId, paramChapter, activeBookId, activeChapter]);

  // Fetch verses whenever book, chapter, or translations change
  useEffect(() => {
    let isMounted = true;
    
    const loadVerses = async () => {
      // If we already have verses, don't show blocking loader
      if (verses1.length === 0) setLoadingVerses(true);
      setTransitioning(true);

      try {
        const promises = [fetchVersesFromAPI(activeBook.name, activeChapter, translation1)];
        if (translation2) {
          promises.push(fetchVersesFromAPI(activeBook.name, activeChapter, translation2));
        }

        const [v1, v2] = await Promise.all(promises);
        
        if (isMounted) {
          setVerses1(v1);
          setVerses2(v2 || []);
          setLoadingVerses(false);
          setTransitioning(false);
          
          // Preload next/prev chapters in the background
          preloadAdjacentChapters(activeBook.name, activeChapter, translation1, translation2);
        }
      } catch (error) {
        console.error("Error loading verses:", error);
        if (isMounted) {
          setLoadingVerses(false);
          setTransitioning(false);
        }
      }
    };

    loadVerses();
    return () => { isMounted = false; };
  }, [activeBook.name, activeChapter, translation1, translation2]);

  const handleNextChapter = useCallback(() => {
    if (activeChapter < activeBook.chapterCount) {
      const next = activeChapter + 1;
      navigate(`/read/${activeBookId}/${next}`);
    } else {
      // Go to next book
      const currentIndex = BOOKS.findIndex(b => b.id === activeBookId);
      if (currentIndex < BOOKS.length - 1) {
        const nextBook = BOOKS[currentIndex + 1];
        navigate(`/read/${nextBook.id}/1`);
      }
    }
  }, [activeChapter, activeBook, activeBookId, navigate]);

  const handlePrevChapter = useCallback(() => {
    if (activeChapter > 1) {
      const prev = activeChapter - 1;
      navigate(`/read/${activeBookId}/${prev}`);
    } else {
      // Go to previous book last chapter
      const currentIndex = BOOKS.findIndex(b => b.id === activeBookId);
      if (currentIndex > 0) {
        const prevBook = BOOKS[currentIndex - 1];
        navigate(`/read/${prevBook.id}/${prevBook.chapterCount}`);
      }
    }
  }, [activeChapter, activeBookId, navigate]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const speakText = (text: string) => {
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };
  const askAI = async (prompt: string) => {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const ai = getGenAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          systemInstruction: BIBLE_ASSISTANT_SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });
      setAiResponse(response.text || "I'm sorry, I couldn't generate an answer at this time.");
    } catch (error) {
      console.error("AI Assistant Error:", error);
      setAiResponse("An error occurred while connecting to my knowledge base. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleVerseClick = (v: Verse) => {
    setSelectedVerse(v);
    setAiResponse(null);
    // User requested AI to only load when explicitly requested.
    // So we just select it, but don't ask AI yet.
  };

  const filteredBooks = useMemo(() => {
    if (!searchTerm) return BOOKS;
    return BOOKS.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  const SPIRITUAL_TOPICS = [
    { id: 'peace', icon: <Wind className="h-4 w-4" />, name: 'Seeking Peace', path: '/read/philippians/4' },
    { id: 'love', icon: <Heart className="h-4 w-4" />, name: 'True Love', path: '/read/1corinthians/13' },
    { id: 'faith', icon: <Anchor className="h-4 w-4" />, name: 'Firm Faith', path: '/read/hebrews/11' },
    { id: 'strength', icon: <Shield className="h-4 w-4" />, name: 'Spiritual Strength', path: '/read/ephesians/6' },
    { id: 'guidance', icon: <Flame className="h-4 w-4" />, name: 'Holy Guidance', path: '/read/romans/8' },
  ];

  const READING_PLANS = [
    { id: 'foundations', name: 'Faith Foundations', days: '7 Days', progress: 65 },
    { id: 'wisdom', name: 'Ancient Wisdom', days: '31 Days', progress: 12 },
  ];

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-background pt-16">
      {/* Spiritual Hub Sidebar */}
      <div className="w-64 border-r hidden lg:flex flex-col bg-background">
        <div className="p-6 border-b">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4 text-muted-foreground/40">Spiritual Hub</h3>
          <button 
            onClick={() => navigate('/daily-rhema')}
            className="w-full text-left p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-all group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">Daily Rhema</span>
            </div>
            <p className="text-[11px] leading-relaxed italic text-muted-foreground/80 group-hover:text-foreground transition-colors">
              "For I know the plans I have for you..."
            </p>
            <div className="mt-3 text-[9px] font-bold opacity-30 flex justify-between items-center">
              <span>JEREMIAH 29:11</span>
              <ArrowRight className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
          </button>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-8">
            <section>
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Spiritual Topics</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1">
                {SPIRITUAL_TOPICS.map(topic => (
                  <button
                    key={topic.id}
                    onClick={() => navigate(topic.path)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group"
                  >
                    <span className="opacity-40 group-hover:opacity-100 transition-opacity">{topic.icon}</span>
                    <span className="font-medium">{topic.name}</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between px-2 mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-3 w-3 text-muted-foreground/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Spiritual Growth</span>
                </div>
              </div>
              <div className="space-y-4 px-2">
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/50 group cursor-pointer hover:border-primary/20 transition-all">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center border shadow-sm">
                      <Flame className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold">Personal Devotion</h4>
                      <p className="text-[10px] text-muted-foreground">AI Faith Guide</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-primary' : 'bg-border/50'}`} />
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-secondary/30 border border-dashed border-border group cursor-pointer hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2 text-muted-foreground/60 mb-1">
                    <MessageSquare className="h-3 w-3" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">My Journal</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/60 italic">
                    Tap a verse to add your reflection...
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="p-4 border-t mt-auto">
          <Button variant="outline" className="w-full justify-start h-10 rounded-lg text-[10px] font-bold uppercase tracking-widest relative">
            <Bookmark className="h-3 w-3 mr-2" />
            My Collections
            {collections.length > 0 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[8px] px-1.5 py-0.5 rounded-full font-bold">
                {collections.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Main Reading Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden" onMouseUp={handleMouseUp}>
        <div className="px-4 md:px-8 h-16 border-b flex items-center justify-between bg-background shrink-0 z-10">
          <div className="flex items-center gap-4 md:gap-6">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex flex-col cursor-pointer group hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary bg-primary/10 px-1.5 py-0.5 rounded">Study Mode</span>
                    <ChevronDown className="h-2 w-2 text-muted-foreground/40" />
                  </div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    {activeBook.name} <span className="text-muted-foreground font-normal">{activeChapter}</span>
                  </h2>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-[480px] p-0">
                <div className="flex h-[400px]">
                  <ScrollAreaUI className="w-1/2 border-r p-4">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2">Books</DropdownMenuLabel>
                    <div className="space-y-1">
                      {BOOKS.map(book => (
                        <DropdownMenuItem 
                          key={book.id} 
                          className={`text-xs p-2 rounded-md cursor-pointer ${activeBookId === book.id ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => {
                            setActiveBookId(book.id);
                            setActiveChapter(1);
                            navigate(`/read/${book.id}/1`);
                          }}
                        >
                          {book.name}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </ScrollAreaUI>
                  <ScrollAreaUI className="w-1/2 p-4">
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/40 mb-2">Chapters</DropdownMenuLabel>
                    <div className="grid grid-cols-4 gap-1">
                      {Array.from({ length: activeBook.chapterCount }, (_, i) => i + 1).map(ch => (
                        <DropdownMenuItem 
                          key={ch}
                          className={`text-xs p-2 justify-center rounded-md cursor-pointer ${activeChapter === ch ? 'bg-primary text-secondary' : ''}`}
                          onClick={() => {
                            setActiveChapter(ch);
                            navigate(`/read/${activeBookId}/${ch}`);
                          }}
                        >
                          {ch}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  </ScrollAreaUI>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <div className="flex items-center gap-1 border rounded-lg p-0.5 ml-4">
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={handlePrevChapter} disabled={activeChapter === 1 && BOOKS.findIndex(b => b.id === activeBookId) === 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="h-4 w-[1px] bg-border mx-1" />
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-md" onClick={handleNextChapter} disabled={activeChapter === activeBook.chapterCount && BOOKS.findIndex(b => b.id === activeBookId) === BOOKS.length - 1}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex bg-secondary rounded-lg p-1">
              {(Object.keys(TRANSLATIONS) as Translation[]).slice(0, 3).map(trans => (
                <button
                  key={trans}
                  onClick={() => setTranslation1(trans)}
                  className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${
                    translation1 === trans ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {trans}
                </button>
              ))}
            </div>
            
            <Button 
              variant={translation2 ? "default" : "outline"} 
              size="sm" 
              className="rounded-lg h-9 px-4 text-xs font-bold uppercase tracking-widest"
              onClick={handleToggleParallel}
            >
              {translation2 ? 'Close Parallel' : 'Parallel View'}
            </Button>
            
            <Button
              variant="ghost" 
              size="icon" 
              onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
              className={`rounded-lg transition-colors ${isAiSidebarOpen ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <Sparkles className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className={`flex-1 overflow-y-auto scroll-smooth custom-scrollbar ${transitioning ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'} transition-all duration-300`}>
          <div className="max-w-2xl mx-auto py-12 px-4 md:px-6">
            <div className="space-y-1">
              {loadingVerses ? (
                <div className="space-y-6 pt-10">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-4 w-4 shrink-0 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : verses1.length > 0 ? (
                verses1.map((v, i) => {
                  const v2 = verses2.find(sec => sec.verse === v.verse);
                  const highlightColor = highlights[v.id];

                  return (
                    <div 
                      key={v.id} 
                      data-verse-id={v.id}
                      className="group py-1 relative border-b border-transparent hover:border-primary/5 transition-colors"
                      style={{ backgroundColor: highlightColor }}
                    >
                      <div className="flex gap-4">
                        <span className="text-[10px] font-bold text-muted-foreground/30 tabular-nums pt-1.5 shrink-0 w-4 text-right">
                          {v.verse}
                        </span>
                        <div className="space-y-0.5 w-full text-justify" onClick={() => handleVerseClick(v)}>
                          <p className={`text-base leading-relaxed text-foreground/90 font-light selection:bg-primary/20 hover:text-primary transition-colors cursor-pointer`}>
                            {v.text}
                          </p>
                          {v2 && (
                            <p className="text-[13px] border-l-2 border-primary/10 pl-4 py-0.5 italic text-muted-foreground leading-relaxed selection:bg-primary/20">
                              {v2.text}
                              <span className="ml-2 text-[8px] not-italic font-bold uppercase tracking-tighter text-muted-foreground/20">
                                {v2.translation}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-20 flex flex-col items-center gap-6">
                   <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center">
                     <BookIcon className="h-8 w-8 text-muted-foreground/20" />
                   </div>
                  <p className="text-sm text-muted-foreground italic font-light">"Ask, and it will be given to you..."</p>
                  <Button variant="outline" className="rounded-lg h-10 px-8 text-xs font-bold uppercase tracking-widest" onClick={() => window.location.reload()}>Retry Link</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: AI Assistant */}
      <AnimatePresence mode="wait">
        {isAiSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l hidden xl:flex flex-col bg-background relative shrink-0"
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground">Rhema AI Insight</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsAiSidebarOpen(false)} className="h-6 w-6 rounded-md">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <ScrollArea className="flex-1 p-8">
              {selectedVerse ? (
                <div className="space-y-8">
                  <div className="p-6 rounded-xl bg-secondary/50 border border-border/50">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Focus</h4>
                    <p className="text-sm text-foreground/80 font-light leading-relaxed mb-4">
                      "{selectedVerse.text}"
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60">
                      {selectedVerse.bookName} {selectedVerse.chapter}:{selectedVerse.verse} • {selectedVerse.translation}
                    </span>
                    
                    <div className="flex gap-2">
                       {!aiResponse && !aiLoading && (
                        <Button 
                          size="sm" 
                          className="mt-6 flex-1 text-[10px] font-bold uppercase tracking-widest"
                          onClick={() => askAI(`Explain ${selectedVerse.bookName} ${selectedVerse.chapter}:${selectedVerse.verse}. Current translation: ${selectedVerse.translation}. Text: "${selectedVerse.text}"`)}
                        >
                          Ask Rhema Insight
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        size="sm" 
                        className={`mt-6 h-9 w-12 rounded-lg ${isSpeaking ? 'text-primary bg-primary/10 border-primary/20' : ''}`}
                        onClick={() => isSpeaking ? stopSpeaking() : speakText(selectedVerse.text)}
                      >
                        {isSpeaking ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {aiLoading ? (
                      <div className="space-y-4">
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-[80%]" />
                        <Skeleton className="h-3 w-[90%]" />
                        <div className="h-24 bg-secondary rounded-lg animate-pulse" />
                      </div>
                    ) : aiResponse ? (
                      <div className="prose prose-sm dark:prose-invert font-light leading-relaxed text-muted-foreground/90">
                        <ReactMarkdown>{aiResponse}</ReactMarkdown>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 pt-20">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-muted-foreground/30" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest mb-1">AI Assistant</h3>
                    <p className="text-xs text-muted-foreground font-light leading-relaxed">Select text or a verse to begin analysis.</p>
                  </div>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Selection Popup */}
      <AnimatePresence>
        {selection && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed z-[100] flex items-center gap-1 p-1 bg-background border shadow-2xl rounded-lg"
            style={{ 
              left: selection.x, 
              top: selection.y - 50,
              transform: 'translateX(-50%)'
            }}
          >
            <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary" 
              onClick={() => {
                askAI(`Provide spiritual insight and context for this passage: "${selection.text}"`);
                setIsAiSidebarOpen(true);
                setSelection(null);
              }}
            >
              Analyze
            </Button>
            <div className="h-4 w-[1px] bg-border mx-1" />
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary"
              onClick={() => handleHighlight('rgba(234, 179, 8, 0.2)')}
            >
              {selection?.verseId && highlights[selection.verseId] ? 'Update Color' : 'Highlight'}
            </Button>
            {selection?.verseId && highlights[selection.verseId] && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10"
                onClick={() => {
                  setHighlights(prev => {
                    const next = { ...prev };
                    delete next[selection.verseId!];
                    return next;
                  });
                  setSelection(null);
                }}
              >
                Clear
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest hover:bg-secondary"
              onClick={addToCollection}
            >
              Add Collection
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


