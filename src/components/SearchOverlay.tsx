import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Book, Sparkles, MessageSquare, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '../components/ui/input';
import { useNavigate } from 'react-router-dom';
import { BOOKS } from '../lib/constants';
import { cn } from '../lib/utils';

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
    }
  }, [isOpen]);

  const filteredBooks = useMemo(() => {
    if (!query) return [];
    return BOOKS.filter(b => b.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
  }, [query]);

  const topics = [
    { name: 'Peace', verses: 'John 14:27, Philippians 4:7' },
    { name: 'Faith', verses: 'Hebrews 11:1, Romans 10:17' },
    { name: 'Grace', verses: 'Ephesians 2:8, 2 Corinthians 12:9' },
  ].filter(t => t.name.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 backdrop-blur-md bg-background/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            className="w-full max-w-2xl bg-card border border-border/50 shadow-2xl rounded-[2rem] overflow-hidden flex flex-col max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center gap-3">
              <Search className="h-5 w-5 text-primary" />
              <Input
                autoFocus
                placeholder="Search for verses, books, or spiritual topics..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-lg h-12"
              />
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-6">
              {query.length > 0 ? (
                <div className="space-y-8">
                  {filteredBooks.length > 0 && (
                    <section className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                        <Book className="h-3 w-3" /> Books
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {filteredBooks.map(book => (
                          <SearchItem 
                            key={book.id}
                            title={book.name}
                            subtitle={`${book.testament === 'OT' ? 'Old Testament' : 'New Testament'} • ${book.chapterCount} Chapters`}
                            onClick={() => handleSelect(`/read/${book.id}/1`)}
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {topics.length > 0 && (
                    <section className="space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 flex items-center gap-2">
                        <Sparkles className="h-3 w-3" /> Spiritual Topics
                      </h4>
                      <div className="grid grid-cols-1 gap-1">
                        {topics.map(topic => (
                          <SearchItem 
                            key={topic.name}
                            title={topic.name}
                            subtitle={`Relevant Verses: ${topic.verses}`}
                            onClick={() => handleSelect(`/read`)} // In real app, search for topic
                          />
                        ))}
                      </div>
                    </section>
                  )}

                  {filteredBooks.length === 0 && topics.length === 0 && (
                    <div className="text-center py-10 space-y-4">
                       <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mx-auto text-muted-foreground/30">
                        <Search className="h-6 w-6" />
                      </div>
                      <p className="text-sm text-muted-foreground italic">No results for "{query}". Try searching for categories like "Peace" or "Grace".</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-8">
                  <section className="space-y-3">
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">Recent Searches</h4>
                    <div className="flex flex-wrap gap-2">
                      {['John 3:16', 'Psalms 23', 'Love', 'Genesis'].map(s => (
                        <Button 
                          key={s} 
                          variant="secondary" 
                          size="sm" 
                          className="rounded-full h-8 text-[11px] font-medium"
                          onClick={() => setQuery(s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>
                  </section>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <QuickLink 
                      icon={<BookOpen className="h-4 w-4 text-primary" />}
                      title="Bible Reader"
                      description="Explore the full testament"
                      onClick={() => handleSelect('/read')}
                     />
                     <QuickLink 
                      icon={<Sparkles className="h-4 w-4 text-accent" />}
                      title="Daily Devotional"
                      description="Scripture for today"
                      onClick={() => handleSelect('/daily-rhema')}
                     />
                  </div>
                </div>
              )}
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function SearchItem({ title, subtitle, onClick }: { title: string, subtitle: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/50 transition-all text-left group"
    >
      <div>
        <h4 className="text-sm font-semibold group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{subtitle}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </button>
  );
}

function QuickLink({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="p-5 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all text-left group"
    >
      <div className="mb-4 p-2.5 rounded-xl bg-background w-fit shadow-sm">
        {icon}
      </div>
      <h4 className="text-sm font-bold group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-[11px] text-muted-foreground font-light">{description}</p>
    </button>
  );
}

function Button({ children, variant = 'default', size = 'default', className, onClick }: any) {
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-secondary text-muted-foreground hover:text-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
  };
  const sizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    icon: 'h-10 w-10 p-0',
  };
  return (
    <button 
      onClick={onClick}
      className={cn('inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:opacity-50', variants[variant as keyof typeof variants], sizes[size as keyof typeof sizes], className)}
    >
      {children}
    </button>
  );
}

function ScrollArea({ children, className }: any) {
    return (
        <div className={cn("overflow-y-auto custom-scrollbar", className)}>
            {children}
        </div>
    )
}
