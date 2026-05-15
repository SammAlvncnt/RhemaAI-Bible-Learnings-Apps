import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './lib/firebase';
import LandingPage from './pages/LandingPage';
import BibleReader from './pages/BibleReader';
import Profile from './pages/Profile';
import DailyRhema from './pages/DailyRhema';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import SearchOverlay from './components/SearchOverlay';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-primary font-serif text-3xl italic"
        >
          Rhema AI
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar 
          user={user} 
          isDark={isDark} 
          toggleTheme={() => setIsDark(!isDark)} 
          onSearchClick={() => setIsSearchOpen(true)}
        />
        <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <MobileNav />
        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<LandingPage user={user} />} />
              <Route path="/read" element={<BibleReader />} />
              <Route path="/read/:bookId" element={<BibleReader />} />
              <Route path="/read/:bookId/:chapter" element={<BibleReader />} />
              <Route path="/daily-rhema" element={<DailyRhema />} />
              <Route path="/assistant" element={<AIAssistant />} />
              <Route path="/settings" element={<Settings isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />} />
              <Route path="/profile" element={user ? <Profile user={user} /> : <Navigate to="/" />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </BrowserRouter>
  );
}

