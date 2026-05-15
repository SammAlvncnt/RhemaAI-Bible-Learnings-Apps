import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Sparkles, MessageSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MobileNav() {
  const location = useLocation();
  
  const navItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Home', path: '/' },
    { icon: <BookOpen className="h-5 w-5" />, label: 'Read', path: '/read' },
    { icon: <Sparkles className="h-5 w-5" />, label: 'AI', path: '/assistant' },
    { icon: <MessageSquare className="h-5 w-5" />, label: 'Journal', path: '/profile' },
    { icon: <User className="h-5 w-5" />, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-lg border-t flex items-center justify-around px-2 z-[60]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center gap-1 transition-all",
              isActive ? "text-primary" : "text-muted-foreground/60"
            )}
          >
            <div className={cn(
              "p-1 rounded-xl transition-colors",
              isActive ? "bg-primary/10" : ""
            )}>
              {item.icon}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
