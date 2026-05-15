import { Link, useNavigate } from 'react-router-dom';
import { User, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Button, buttonVariants } from './ui/button';
import { cn } from '../lib/utils';
import { Moon, Sun, Search, BookOpen, User as UserIcon, LogIn, LogOut, Menu, ChevronDown, Settings as SettingsIcon, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { BOOKS } from '../lib/constants';
import { ScrollArea } from './ui/scroll-area';

interface NavbarProps {
  user: User | null;
  isDark: boolean;
  toggleTheme: () => void;
  onSearchClick: () => void;
}

export default function Navbar({ user, isDark, toggleTheme, onSearchClick }: NavbarProps) {
  const navigate = useNavigate();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="h-16 border-b glass fixed top-0 w-full z-50 px-4 md:px-8 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
          <BookOpen className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="font-serif text-lg font-medium tracking-tight text-foreground leading-none">
            Rhema AI
          </span>
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] mt-1">Sacred Word</span>
        </div>
      </Link>

      <div className="hidden md:flex items-center gap-6">
        <DropdownMenu>
          <DropdownMenuTrigger className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors flex items-center gap-1 cursor-pointer outline-none group">
            Old Testament <ChevronDown className="h-3 w-3 opacity-30 group-hover:opacity-100 transition-opacity" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64 p-0 shadow-2xl border-primary/5" align="start">
            <ScrollArea className="h-[450px]">
              <div className="p-2 grid grid-cols-1 gap-0.5">
                <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Books of the Covenant</div>
                {BOOKS.filter(b => b.testament === 'OT').map(book => (
                  <DropdownMenuItem 
                    key={book.id} 
                    onClick={() => navigate(`/read/${book.id}/1`)} 
                    className="text-xs py-2.5 px-3 rounded-md cursor-pointer hover:bg-secondary focus:bg-secondary"
                  >
                    {book.name}
                  </DropdownMenuItem>
                ))}
              </div>
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>

        <Link to="/" className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors">Home</Link>
        <Link to="/read" className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors">Bible</Link>
        <Link to="/assistant" className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors">AI Assistant</Link>
        <Link to="/daily-rhema" className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors">Daily Word</Link>
        {user && <Link to="/profile" className="text-[10px] font-bold uppercase tracking-widest text-foreground/50 hover:text-foreground transition-colors">Journal</Link>}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onSearchClick} className="rounded-full hidden sm:flex">
          <Search className="h-5 w-5" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
          {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative h-9 w-9 rounded-full cursor-pointer")}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback>{user.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserIcon className="mr-2 h-4 w-4" /> Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/read')}>
                <BookOpen className="mr-2 h-4 w-4" /> Bible
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/assistant')}>
                <Sparkles className="mr-2 h-4 w-4" /> AI Assistant
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <SettingsIcon className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={handleLogin} variant="outline" className="rounded-full gap-2 border-primary/20 hover:bg-primary/5">
            <LogIn className="h-4 w-4" /> Sign In
          </Button>
        )}
      </div>
    </nav>
  );
}
