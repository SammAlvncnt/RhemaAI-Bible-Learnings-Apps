import { motion } from 'motion/react';
import { 
  Moon, 
  Sun, 
  Volume2, 
  Type, 
  Layout, 
  Bell, 
  ChevronRight, 
  ChevronLeft,
  Settings as SettingsIcon,
  Shield,
  Eye,
  Languages
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
// Removed Switch and Slider imports as they are implemented with custom divs below

interface SettingsProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Settings({ isDark, toggleTheme }: SettingsProps) {
  const navigate = useNavigate();

  return (
    <div className="flex-1 bg-background pt-16 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-12">
           <Button 
            variant="ghost" 
            onClick={() => navigate(-1)} 
            className="mb-6 gap-2 text-muted-foreground hover:text-foreground group h-9 -ml-2"
          >
            <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center">
              <SettingsIcon className="h-6 w-6 text-foreground/70" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Personalize your sacred reading experience</p>
            </div>
          </div>
        </header>

        <div className="space-y-10">
          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b pb-2">Appearance</h3>
            
            <div className="space-y-2">
               <SettingRow 
                icon={<Moon className="h-4 w-4" />}
                title="Dark Mode"
                description="Reduce eye strain in low-light environments"
                action={
                  <div 
                    onClick={toggleTheme}
                    className={`w-12 h-6 rounded-full cursor-pointer transition-colors relative ${isDark ? 'bg-primary' : 'bg-secondary'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${isDark ? 'right-1' : 'left-1'}`} />
                  </div>
                }
              />
              <SettingRow 
                icon={<Type className="h-4 w-4" />}
                title="Font Family"
                description="Choose between Serif and Sans-serif"
                action={
                   <div className="flex bg-secondary/50 p-1 rounded-lg">
                      <button className="px-3 py-1 text-xs font-bold rounded-md bg-background shadow-sm">Serif</button>
                      <button className="px-3 py-1 text-xs font-medium text-muted-foreground">Sans</button>
                   </div>
                }
              />
               <SettingRow 
                icon={<Layout className="h-4 w-4" />}
                title="Line Spacing"
                description="Adjust vertical space between verses"
                action={<span className="text-xs font-bold text-primary">Relaxed</span>}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b pb-2">Voice AI</h3>
            <div className="space-y-2">
              <SettingRow 
                icon={<Languages className="h-4 w-4" />}
                title="Primary Language"
                description="Select voice for AI explanations"
                action={<span className="text-xs font-bold">Indonesian</span>}
              />
              <SettingRow 
                icon={<Volume2 className="h-4 w-4" />}
                title="Voice Type"
                description="Prefer male or female voice"
                action={<span className="text-xs font-bold">Female (Soft)</span>}
              />
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50 border-b pb-2">Account & Privacy</h3>
            <div className="space-y-2">
              <SettingRow 
                icon={<Bell className="h-4 w-4" />}
                title="Daily Devotional"
                description="Get notified when the daily Word is ready"
                action={
                  <div className={`w-12 h-6 rounded-full bg-primary relative`}>
                    <div className={`absolute top-1 right-1 w-4 h-4 rounded-full bg-white`} />
                  </div>
                }
              />
              <SettingRow 
                icon={<Eye className="h-4 w-4" />}
                title="Public Journal Items"
                description="Allow others to see your shared reflections"
                action={
                   <div className={`w-12 h-6 rounded-full bg-secondary relative`}>
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white`} />
                  </div>
                }
              />
            </div>
          </section>

          <div className="pt-8 flex flex-col gap-4">
             <Button variant="outline" className="w-full justify-between h-12 rounded-xl group">
               <div className="flex items-center gap-3">
                 <Shield className="h-4 w-4 text-muted-foreground" />
                 <span className="text-sm">Manage Privacy Policy</span>
               </div>
               <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
             </Button>
             <Button variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-12 rounded-xl">
               Delete Account Data
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, title, description, action }: { icon: React.ReactNode, title: string, description: string, action: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-secondary/30 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold">{title}</h4>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <div>
        {action}
      </div>
    </div>
  );
}
