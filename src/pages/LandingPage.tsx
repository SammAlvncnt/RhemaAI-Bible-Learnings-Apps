import { Link } from 'react-router-dom';
import { User } from 'firebase/auth';
import { Button, buttonVariants } from '../components/ui/button';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';
import { BookOpen, Sparkles, Languages, Heart, ArrowRight, Star, Clock, BookMarked, MessageSquare } from 'lucide-react';

export default function LandingPage({ user }: { user: User | null }) {
  if (user) {
    return (
      <div className="flex-1 bg-background pt-24 pb-12 overflow-y-auto">
        <div className="container mx-auto px-4 max-w-6xl">
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl font-serif mb-2">Welcome back, <span className="text-primary italic">{user.displayName?.split(' ')[0]}</span>.</h1>
              <p className="text-muted-foreground font-light">"The Word is a lamp unto your feet."</p>
            </motion.div>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <DashboardCard 
              to="/read"
              icon={<BookOpen className="h-6 w-6 text-primary" />}
              title="Continue Reading"
              description="Pick up exactly where you left off in the Word."
              color="bg-primary/5"
            />
            <DashboardCard 
              to="/daily-rhema"
              icon={<Sparkles className="h-6 w-6 text-accent" />}
              title="Daily Devotional"
              description="Seek your spiritual nourishment for today."
              color="bg-accent/5"
            />
             <DashboardCard 
              to="/assistant"
              icon={<Star className="h-6 w-6 text-orange-500" />}
              title="Ask AI Assistant"
              description="Deep dive into theology with your companion."
              color="bg-orange-500/5"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <section className="space-y-6">
               <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <Clock className="h-4 w-4" /> Recent Activity
                </h3>
                <Button variant="ghost" size="sm" className="text-xs text-primary">View History</Button>
              </div>
              <div className="space-y-3">
                <ActivityItem book="John" chapter={1} time="2 hours ago" />
                <ActivityItem book="Romans" chapter={8} time="Yesterday" />
                <ActivityItem book="Psalms" chapter={23} time="3 days ago" />
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
                  <BookMarked className="h-4 w-4" /> Saved Collections
                </h3>
                <Link to="/profile" className="text-xs text-primary hover:underline">Manage</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <CollectionItem title="Daily Strength" count={12} icon={<Heart className="h-4 w-4 text-red-400" />} />
                <CollectionItem title="Study: Grace" count={5} icon={<Star className="h-4 w-4 text-yellow-400" />} />
              </div>
              
              <div className="p-6 rounded-3xl bg-secondary/30 border border-dashed border-border flex flex-col items-center justify-center text-center space-y-3">
                <MessageSquare className="h-6 w-6 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground italic">"Faith comes by hearing, and hearing by the Word of God."</p>
                <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest">Start Reviewing</Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#18181b_0%,#09090b_100%)] dark:block hidden" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-8 text-sm font-medium text-primary/80"
          >
            <Sparkles className="h-4 w-4" />
            <span>AI-Powered Scripture Experience</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-6xl md:text-8xl font-serif font-semibold tracking-tighter mb-6 italic leading-[1.1]"
          >
            The Living Word for the <br />
            <span className="text-primary italic">Modern Generation.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed font-light"
          >
            Experience the Bible like never before. Immerse yourself in the Word with AI-powered insights, 
            multilingual translations, and deep study tools designed for your spiritual journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/read/genesis/1" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-8 h-12 text-base cinematic-glow bg-primary text-primary-foreground font-bold border-none hover:scale-105 transition-transform")}>
                Start Reading <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link to="/read/john/1" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full px-8 h-12 text-base border-primary/20 hover:bg-primary/5")}>
              Explore John 1
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-serif mb-4">Crafted for Depth</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Every feature of Rhema AI is designed to remove barriers between you and the wisdom of God.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Languages className="h-8 w-8 text-primary" />}
              title="Multilingual Sync"
              description="Read and compare multiple translations in real-time. Stay perfectly synchronized across English and Indonesian."
            />
            <FeatureCard 
              icon={<Sparkles className="h-8 w-8 text-primary" />}
              title="AI Bible Assistant"
              description="Ask complex theological questions and get context-aware explanations powered by Gemini AI."
            />
            <FeatureCard 
              icon={<Star className="h-8 w-8 text-primary" />}
              title="Study & Meditate"
              description="Cross-references, thematic connections, and smart search help you uncover the deep layers of Scripture."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto glass p-12 md:p-20 rounded-[3rem] relative overflow-hidden backdrop-blur-2xl">
            <div className="absolute top-0 right-0 p-8">
              <Heart className="h-10 w-10 text-primary opacity-20" />
            </div>
            <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
              Begin your immersive <br /> journey into the Word today.
            </h2>
            <Link to="/read/genesis/1" className={cn(buttonVariants({ size: "lg" }), "rounded-full px-12 h-14 text-lg bg-primary text-primary-foreground font-bold border-none hover:scale-105 transition-transform shadow-xl shadow-primary/10")}>
              Open Rhema AI
            </Link>
          </div>
        </div>
      </section>
      
      <footer className="py-12 border-t font-light text-sm text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-serif italic text-lg text-primary">Rhema AI</div>
          <div>© 2024 Rhema AI. Built for the Glory of God.</div>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-primary">About</Link>
            <Link to="#" className="hover:text-primary">Terms</Link>
            <Link to="#" className="hover:text-primary">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-card p-10 rounded-[2rem] border border-border/50 transition-all hover:shadow-xl group"
    >
      <div className="mb-6 p-4 rounded-2xl bg-primary/5 w-fit group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <h3 className="text-2xl font-serif mb-4">{title}</h3>
      <p className="text-muted-foreground leading-relaxed font-light">
        {description}
      </p>
    </motion.div>
  );
}

function DashboardCard({ to, icon, title, description, color }: { to: string, icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <Link to={to}>
      <motion.div 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn("p-6 rounded-[2rem] border border-border/50 transition-all hover:shadow-xl group flex flex-col h-full", color)}
      >
        <div className="mb-4 p-3 rounded-xl bg-background w-fit shadow-sm">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed font-light">
          {description}
        </p>
      </motion.div>
    </Link>
  );
}

function ActivityItem({ book, chapter, time }: { book: string, chapter: number, time: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-transparent hover:border-border transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center text-primary font-bold text-[10px]">
          {book[0]}
        </div>
        <div>
          <h4 className="text-sm font-semibold">{book} {chapter}</h4>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{time}</p>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
    </div>
  );
}

function CollectionItem({ title, count, icon }: { title: string, count: number, icon: React.ReactNode }) {
  return (
    <div className="p-4 rounded-2xl bg-secondary/20 border border-transparent hover:border-border transition-all cursor-pointer group flex flex-col justify-between h-24">
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-background shadow-sm">
          {icon}
        </div>
        <span className="text-[10px] font-bold text-muted-foreground">{count} verses</span>
      </div>
      <h4 className="text-xs font-bold truncate group-hover:text-primary transition-colors">{title}</h4>
    </div>
  );
}

