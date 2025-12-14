import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, Briefcase, Star, LayoutGrid, Camera, 
  MapPin, ChevronRight, Upload, Settings,
  LogOut, Plus, CheckCircle, Play, Heart, Send, X,
  Edit2, Save, ArrowLeft, Calendar, Globe, Video, FileText,
  Facebook, Linkedin, Instagram, Link as LinkIcon, Trash2, 
  Loader2, Phone, Mail, Tv, GraduationCap, Zap, AlertCircle, 
  Eye, Share2, BookOpen, Layers, Users, Filter, MessageSquare,
  RotateCw, Mic, Music, Image as ImageIcon, Wifi, Download
} from 'lucide-react';

// --- Types & Globals ---
declare global {
  interface Window {
    supabase: any;
  }
}

type ViewState = 'onboarding' | 'dashboard' | 'profile' | 'projects' | 'applications' | 'skilling' | 'ai-coach';

// --- UI Components ---

const Toast = ({ message, type = 'success', onClose }: any) => {
  if (!message) return null;
  const bg = type === 'error' ? 'bg-red-50 text-red-900 border-red-200' : 'bg-purple-900 text-white border-purple-800';
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg border flex items-center gap-3 animate-in slide-in-from-top-2 ${bg}`}>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
    </div>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '', disabled = false, size = 'md', type="button" }: any) => {
  const baseStyle = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-purple-700 text-white hover:bg-purple-800 shadow-sm",
    secondary: "bg-purple-100 text-purple-900 hover:bg-purple-200",
    ghost: "hover:bg-purple-50 text-slate-700",
    outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ai: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg"
  };
  const sizes = {
    xs: "h-6 px-2 text-[10px]",
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  };
  return (
    <button 
      type={type}
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl border border-purple-100 shadow-sm ${className}`}>
    {children}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text", className = "", disabled=false, ...props }: any) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input
      type={type}
      value={value === null || value === undefined ? '' : value}
      onChange={(e) => onChange && onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
      {...props}
    />
  </div>
);

const Select = ({ label, value, onChange, options, className = "", ...props }: any) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <select
      value={value === null || value === undefined ? '' : value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      {...props}
    >
      <option value="">Select...</option>
      {options.map((opt: any) => (
        <option key={opt.value || opt} value={opt.value || opt}>{opt.label || opt}</option>
      ))}
    </select>
  </div>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const styles = {
    default: "bg-purple-100 text-purple-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    outline: "border border-slate-200 text-slate-600"
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[variant as keyof typeof styles]}`}>
      {children}
    </span>
  );
};

const Modal = ({ title, children, onClose, maxWidth="max-w-lg" }: any) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
    <div className={`bg-white rounded-xl w-full ${maxWidth} shadow-2xl animate-in zoom-in-95 my-8`}>
      <div className="flex justify-between items-center p-4 border-b border-purple-100 bg-purple-50 rounded-t-xl">
        <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
           {title}
        </h3>
        <button onClick={onClose}><X className="w-5 h-5 text-slate-400 hover:text-slate-600"/></button>
      </div>
      <div className="p-6 max-h-[85vh] overflow-y-auto">
        {children}
      </div>
    </div>
  </div>
);

// --- Helper: Robust Image Compression ---
const compressImage = (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    // If file is small (< 1MB), skip compression to avoid bugs/hanging
    if (file.size < 1024 * 1024) {
       resolve(file);
       return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    // Add timeout to prevent hanging forever
    const timeout = setTimeout(() => {
        console.warn("Compression timed out, uploading raw file");
        resolve(file); // Fallback to original if compression takes too long
    }, 3000);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        clearTimeout(timeout);
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1024; 
        const MAX_HEIGHT = 1024;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
        } else {
          if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob); else resolve(file); 
        }, 'image/jpeg', 0.7); 
      };
      img.onerror = () => { clearTimeout(timeout); resolve(file); };
    };
    reader.onerror = () => { clearTimeout(timeout); resolve(file); };
  });
};

// --- Config Screen ---
const ConfigScreen = ({ onSave, scriptStatus, errorMsg }: any) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');

  useEffect(() => {
    const savedUrl = localStorage.getItem('sb_url');
    const savedKey = localStorage.getItem('sb_key');
    if (savedUrl) setUrl(savedUrl);
    if (savedKey) setKey(savedKey);
  }, []);

  const handleSubmit = (e: any) => {
      e.preventDefault();
      onSave(url, key);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-purple-900">Setup Connection</h1>
          <p className="text-slate-500 text-sm mt-2">Connect to your Supabase backend.</p>
          {scriptStatus !== 'ready' ? 
            <p className="text-xs text-orange-600 mt-2 animate-pulse">Loading library...</p> : 
            <p className="text-xs text-green-600 mt-2">Ready</p>
          }
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="url" label="Supabase URL" placeholder="https://xyz.supabase.co" value={url} onChange={setUrl} />
          <Input name="key" label="Anon Key" placeholder="eyJ..." type="password" value={key} onChange={setKey} />
          <Button type="submit" className="w-full" disabled={scriptStatus !== 'ready'}>Connect</Button>
        </form>
      </Card>
    </div>
  );
};

// --- Main App ---
export default function App() {
  const [supabase, setSupabase] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewState>('dashboard');
  const [profile, setProfile] = useState<any>(null);
  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error'} | null>(null);
  
  // Script Loading State
  const [scriptStatus, setScriptStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [configError, setConfigError] = useState('');
  const [localApps, setLocalApps] = useState<any[]>([]); 

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // 1. Robust Script Loader
  useEffect(() => {
    if (window.supabase) {
      setScriptStatus('ready');
      return;
    }
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
    script.onload = () => setScriptStatus('ready');
    script.onerror = () => {
       setScriptStatus('error');
       setConfigError("Failed to load Supabase library. Check your ad-blocker or internet.");
    };
    document.body.appendChild(script);
  }, []);

  // 2. Auto-connect if config exists
  useEffect(() => {
    if (scriptStatus === 'ready') {
       const savedUrl = localStorage.getItem('sb_url');
       const savedKey = localStorage.getItem('sb_key');
       if (savedUrl && savedKey) {
          initSupabase(savedUrl, savedKey);
       } else {
          setLoading(false); // No config, show config screen
       }
    }
  }, [scriptStatus]);

  const initSupabase = (url: string, key: string) => {
    try {
      if (!window.supabase) {
         setConfigError("Library not loaded yet.");
         return;
      }
      const { createClient } = window.supabase;
      const client = createClient(url, key, {
        auth: { 
          persistSession: true, 
          storageKey: 'kala-sangam-auth-token', // Unique key to avoid collisions
          storage: window.localStorage, 
          autoRefreshToken: true 
        }
      });
      
      setSupabase(client);
      localStorage.setItem('sb_url', url);
      localStorage.setItem('sb_key', key);
      setConfigError('');

      // Init Session Check
      client.auth.getSession().then(({ data: { session } }: any) => {
        setSession(session);
        if (session) fetchProfile(session.user.id, client);
        else setLoading(false);
      });

      // Auth Listener
      client.auth.onAuthStateChange((_event: any, session: any) => {
        setSession(session);
        if (session) fetchProfile(session.user.id, client);
        else {
          setProfile(null);
          setLoading(false);
        }
      });
    } catch (e: any) {
      console.error(e);
      setConfigError(`Init Failed: ${e.message}`);
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string, client: any) => {
    try {
      const { data, error } = await client.from('profiles').select('*, profile_specs(*), profile_portfolio(*)').eq('id', userId).single();
      if (data) {
        const safeData = {
           ...data,
           profile_specs: Array.isArray(data.profile_specs) ? data.profile_specs[0] : data.profile_specs,
           profile_portfolio: Array.isArray(data.profile_portfolio) ? data.profile_portfolio[0] : data.profile_portfolio,
        };
        setProfile(safeData);
      } else if (error?.code === 'PGRST116') {
        setView('onboarding');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
  };

  if (!supabase) return <ConfigScreen onSave={initSupabase} scriptStatus={scriptStatus} errorMsg={configError} />;
  
  if (loading) return (
     <div className="min-h-screen flex items-center justify-center bg-purple-50 flex-col">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4"/>
        <p className="text-purple-900 font-medium">Starting Kalā Sangam...</p>
     </div>
  );

  if (!session) return <AuthScreen supabase={supabase} showToast={showToast} toast={toast} />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans text-slate-900">
      <Toast message={toast?.msg} type={toast?.type} onClose={() => setToast(null)} />
      
      {/* Mobile Header */}
      <div className="bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-purple-100 px-4 py-3 flex justify-between items-center md:hidden">
        <h1 className="text-xl font-bold text-purple-800">Kalā Sangam</h1>
        <div className="flex items-center gap-2">
           <button onClick={handleLogout}><LogOut className="w-5 h-5 text-slate-400" /></button>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <div className="hidden md:flex w-64 flex-col fixed h-full border-r border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-bold text-purple-900 mb-8">Kalā Sangam</h1>
          <nav className="space-y-2 flex-1">
            <NavButton icon={LayoutGrid} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
            <NavButton icon={User} label="My Profile" active={view === 'profile'} onClick={() => setView('profile')} />
            <NavButton icon={Briefcase} label="Projects" active={view === 'projects'} onClick={() => setView('projects')} />
            <NavButton icon={Star} label="Applications" active={view === 'applications'} onClick={() => setView('applications')} />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <span className="text-xs font-semibold text-slate-400 px-4 mb-2 block">GROWTH</span>
              <NavButton icon={GraduationCap} label="Skilling" active={view === 'skilling'} onClick={() => setView('skilling')} />
              <NavButton icon={Zap} label="AI Coach" active={view === 'ai-coach'} onClick={() => setView('ai-coach')} />
            </div>
          </nav>
          <div className="pt-6 border-t border-slate-100">
             <Button variant="ghost" className="w-full justify-start text-red-600" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" /> Logout</Button>
          </div>
        </div>

        <main className="flex-1 md:ml-64 p-4 md:p-8">
           {view === 'onboarding' && <Onboarding supabase={supabase} session={session} onComplete={() => fetchProfile(session.user.id, supabase)} showToast={showToast} />}
           {view === 'dashboard' && <Dashboard profile={profile} setView={setView} showToast={showToast} supabase={supabase} />}
           {view === 'profile' && <ProfileManager profile={profile} supabase={supabase} onUpdate={() => fetchProfile(session.user.id, supabase)} showToast={showToast} />}
           {view === 'projects' && <ProjectsFeed supabase={supabase} profile={profile} showToast={showToast} addLocalApp={(app: any) => setLocalApps([...localApps, app])} />}
           {view === 'applications' && <ApplicationsView supabase={supabase} userId={session.user.id} localApps={localApps} />}
           {view === 'skilling' && <SkillingPage />}
           {view === 'ai-coach' && <AICoachView supabase={supabase} profile={profile} showToast={showToast} />}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center md:hidden z-20 overflow-x-auto">
        <MobileNavButton icon={LayoutGrid} label="Home" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
        <MobileNavButton icon={Briefcase} label="Jobs" active={view === 'projects'} onClick={() => setView('projects')} />
        <MobileNavButton icon={Zap} label="AI Coach" active={view === 'ai-coach'} onClick={() => setView('ai-coach')} />
        <MobileNavButton icon={GraduationCap} label="Skill" active={view === 'skilling'} onClick={() => setView('skilling')} />
        <MobileNavButton icon={User} label="Profile" active={view === 'profile'} onClick={() => setView('profile')} />
      </div>
    </div>
  );
}

// --- Components ---

const NavButton = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-purple-100 text-purple-900' : 'text-slate-600 hover:bg-slate-50'}`}>
    <Icon className="w-5 h-5" /> {label}
  </button>
);

const MobileNavButton = ({ icon: Icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 min-w-[50px] ${active ? 'text-purple-700' : 'text-slate-400'}`}>
    <Icon className="w-6 h-6" /> <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const AuthScreen = ({ supabase, showToast }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    try {
      const { error } = mode === 'login' ? await supabase.auth.signInWithPassword({ email, password }) : await supabase.auth.signUp({ email, password });
      if (error) throw error;
      if (mode === 'signup') showToast('Check email for confirmation!');
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-100 to-white">
      <Card className="w-full max-w-md p-8 shadow-xl border-purple-200">
        <h1 className="text-3xl font-bold text-purple-900 mb-2 text-center">Kalā Sangam</h1>
        <div className="space-y-4 mt-6">
          <Input label="Email" value={email} onChange={setEmail} placeholder="artist@example.com" />
          <Input label="Password" value={password} onChange={setPassword} type="password" placeholder="••••••••" />
          <Button onClick={handleAuth} className="w-full mt-4" disabled={loading}>{loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}</Button>
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full text-center text-sm text-purple-700 hover:underline mt-2">{mode === 'login' ? 'New here? Sign Up' : 'Already have account? Login'}</button>
        </div>
      </Card>
    </div>
  );
};

const Onboarding = ({ supabase, session, onComplete, showToast }: any) => {
  const [formData, setFormData] = useState({ full_name: '', username: '', role_type: 'talent' });
  
  const handleSubmit = async () => {
    try {
      await supabase.from('profiles').insert({ id: session.user.id, ...formData, onboarding_status: 'details_added' });
      await supabase.from('profile_specs').insert({ profile_id: session.user.id });
      await supabase.from('profile_portfolio').insert({ profile_id: session.user.id });
      onComplete();
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="max-w-lg mx-auto pt-10">
      <Card className="p-8">
        <h2 className="text-2xl font-bold text-purple-900 mb-6">Welcome!</h2>
        <div className="space-y-4">
          <Input label="Full Name" value={formData.full_name} onChange={(v: string) => setFormData({...formData, full_name: v})} />
          <Input label="Username" value={formData.username} onChange={(v: string) => setFormData({...formData, username: v})} />
          <div className="space-y-2"><label className="text-sm font-medium text-slate-700">Role</label><div className="grid grid-cols-3 gap-2">{['talent', 'casting', 'both'].map((role) => (<button key={role} onClick={() => setFormData({...formData, role_type: role})} className={`p-3 rounded-lg border text-sm capitalize ${formData.role_type === role ? 'bg-purple-100 border-purple-500 text-purple-900' : 'border-slate-200'}`}>{role}</button>))}</div></div>
          <Button onClick={handleSubmit} className="w-full mt-6" disabled={!formData.username}>Get Started</Button>
        </div>
      </Card>
    </div>
  );
};

// --- FEATURE: DASHBOARD ---
const Dashboard = ({ profile, setView, showToast, supabase }: any) => {
  const [activeApps, setActiveApps] = useState(0);
  const [showChallenge, setShowChallenge] = useState(false);
  
  // Logic: Hide banner if Name and Stage Name are set
  const isProfileComplete = profile?.full_name && profile?.profile_specs?.stage_name;

  useEffect(() => {
    const getCount = async () => {
       // Real count from DB
       if (!profile?.id) return;
       const { count } = await supabase.from('user_applications').select('*', { count: 'exact', head: true }).eq('applicant_id', profile.id);
       setActiveApps(count || 0);
    }
    getCount();
  }, [profile?.id]);

  const shareToInsta = () => {
    const textToCopy = "Taking the #KalaSangamWeek42 challenge! Watch me perform 'The Emotional Breakdown'. Join me on Kalā Sangam!";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast("Caption copied! Opening Instagram...");
        window.open('https://instagram.com', '_blank');
      });
    } else {
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast("Caption copied! Opening Instagram...");
        window.open('https://instagram.com', '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hello, {profile?.full_name?.split(' ')[0]}</h2>
          <p className="text-slate-500">Ready to create today?</p>
        </div>
        <Button variant="ai" size="sm" onClick={() => setView('ai-coach')} className="hidden md:flex">
           <Zap className="w-4 h-4 mr-2" /> Video AI Coach
        </Button>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 flex items-center gap-4 bg-gradient-to-br from-white to-purple-50">
          <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Star className="w-5 h-5"/></div>
          <div>
            <div className="text-2xl font-bold">{activeApps}</div>
            <div className="text-xs text-slate-500">Active Apps</div>
          </div>
        </Card>
        
        {/* Weekly Challenge Tile */}
        <div 
          onClick={() => setShowChallenge(true)}
          className="p-4 rounded-xl border border-orange-200 bg-orange-50 cursor-pointer hover:shadow-md transition-shadow relative overflow-hidden group"
        >
           <div className="absolute top-0 right-0 bg-orange-200 text-orange-800 text-[10px] px-2 py-1 rounded-bl-lg font-bold">WEEK 42</div>
           <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-full text-orange-600"><Tv className="w-5 h-5"/></div>
              <h3 className="font-bold text-orange-900">Weekly Challenge</h3>
           </div>
           <p className="text-xs text-orange-700 leading-snug">"The Emotional Breakdown" - Monologue. Click to view!</p>
        </div>

        {/* AI Shortcut (Visible on Mobile) */}
        <div 
          onClick={() => setView('ai-coach')}
          className="col-span-2 p-4 rounded-xl border border-indigo-200 bg-indigo-50 cursor-pointer hover:shadow-md transition-shadow md:hidden"
        >
           <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-full text-indigo-600"><Zap className="w-5 h-5"/></div>
                <h3 className="font-bold text-indigo-900">AI Video Coach</h3>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-400" />
           </div>
           <p className="text-xs text-indigo-700 ml-11">Get instant body language & tone feedback.</p>
        </div>
      </div>

      {activeApps === 0 && (
         <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center animate-in fade-in">
            <h4 className="text-lg font-bold text-slate-800 mb-2">Start your journey!</h4>
            <p className="text-sm text-slate-500 mb-4">You haven't applied to any roles yet.</p>
            <Button onClick={() => setView('projects')} className="bg-purple-700 hover:bg-purple-800 text-white">Find Auditions</Button>
         </div>
      )}

      {!isProfileComplete && (
        <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-purple-200 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-purple-100 rounded-full"><AlertCircle className="w-5 h-5 text-purple-600"/></div>
             <div>
               <h4 className="font-bold text-sm text-slate-900">Complete your profile</h4>
               <p className="text-xs text-slate-500">Add your Stage Name to get matched.</p>
             </div>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setView('profile')}>Update</Button>
        </div>
      )}

      {showChallenge && (
        <Modal title="Weekly Challenge: The Breakdown" onClose={() => setShowChallenge(false)}>
           <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm italic text-slate-700">
                 "You just found out your best friend betrayed you. You are hurt, confused, but trying to keep your dignity. Start quiet, end with a single tear."
              </div>
              <div className="text-sm space-y-2">
                 <h4 className="font-bold">Instructions:</h4>
                 <ul className="list-disc pl-5"><li>Record a 30-60s video (Landscape).</li><li>Ensure good lighting.</li><li>Upload to Instagram with tag #KalaSangamWeek42.</li></ul>
              </div>
              <div className="flex gap-2">
                 <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white" onClick={shareToInsta}><Instagram className="w-4 h-4 mr-2"/> Share on Insta</Button>
                 <Button className="w-full" variant="outline" onClick={() => setShowChallenge(false)}>Close</Button>
              </div>
           </div>
        </Modal>
      )}
    </div>
  );
};

// --- FEATURE: APPLICATIONS VIEW (REAL DB) ---
const ApplicationsView = ({ supabase, userId, localApps }: any) => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      // Fetch real applications from DB
      const { data } = await supabase.from('user_applications').select('*, projects(*)').eq('applicant_id', userId);
      // Merge with local demo applications
      setApps([...(data || []), ...localApps]);
      setLoading(false);
    };
    fetchApps();
  }, [userId, localApps]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">My Applications</h2>
      {loading ? <div className="text-center py-10">Loading...</div> : apps.length === 0 ? (
        <Card className="p-10 text-center text-slate-500"><p>You haven't applied to any roles yet.</p></Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {apps.map((app, i) => (
            <Card key={i} className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{app.projects?.title || app.title || 'Demo Project'}</h3>
                <Badge variant={app.status === 'shortlisted' ? 'success' : 'default'}>{app.status || 'Applied'}</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-3">Applied on: {new Date(app.created_at || Date.now()).toLocaleDateString()}</p>
              <div className="p-3 bg-slate-50 rounded text-sm text-slate-700 italic">"{app.cover_note}"</div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// --- FEATURE: SKILLING ---
const SkillingPage = () => {
  const [activeTab, setActiveTab] = useState('academy');
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeArticle, setActiveArticle] = useState<any>(null);

  const videos = [
     { id: 1, title: "Method Acting Basics", src: "https://www.w3schools.com/html/mov_bbb.mp4" },
     { id: 2, title: "Voice Modulation", src: "https://www.w3schools.com/html/movie.mp4" }
  ];

  const articles = [
     { title: "The Art of Auditioning", type: "Article", author: "Casting Guild", content: "Auditioning is not just about acting; it's about problem solving..." },
     { title: "Lighting Yourself", type: "Blog", author: "Tech Team", content: "Always face the window. Natural light is your best friend..." },
  ];

  const flashcards = [
     { title: "Stanislavski's 'Magic If'", desc: "Ask yourself: 'If I were in this situation, what would I do?'" },
     { title: "Chekhov's Atmosphere", desc: "Imagine the air around you is filled with a specific mood." },
     { title: "Meisner's Repetition", desc: "Repeat what your partner says to get out of your head." }
  ];

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold text-slate-900">Artist Academy</h2>
       </div>
       
       <div className="flex gap-2 overflow-x-auto pb-2">
          {['academy', 'library', 'flashcards'].map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-purple-900 text-white' : 'bg-white border border-slate-200 text-slate-600'}`}
             >
                {tab}
             </button>
          ))}
       </div>

       {activeTab === 'academy' && (
         <div className="grid md:grid-cols-2 gap-4 animate-in fade-in">
            {videos.map(v => (
               <Card key={v.id} className="p-0 overflow-hidden group cursor-pointer hover:shadow-md">
                  <div onClick={() => setActiveVideo(v.src)} className="h-40 bg-slate-900 relative flex items-center justify-center">
                     <Play className="w-12 h-12 text-white opacity-80 group-hover:scale-110 transition-transform"/>
                  </div>
                  <div className="p-4">
                     <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-purple-100 text-purple-800">Video Lesson</Badge>
                     </div>
                     <h3 className="font-bold text-lg mb-1">{v.title}</h3>
                  </div>
               </Card>
            ))}
         </div>
       )}

       {activeTab === 'library' && (
         <div className="space-y-4 animate-in fade-in">
            {articles.map((item, i) => (
               <div key={i} onClick={() => setActiveArticle(item)} className="flex items-start gap-4 p-4 bg-white rounded-xl border border-slate-100 hover:shadow-sm cursor-pointer transition-shadow">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-6 h-6"/></div>
                  <div>
                     <h4 className="font-bold text-slate-900">{item.title}</h4>
                     <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{item.type}</span>
                        <span>•</span>
                        <span>By {item.author}</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>
       )}

       {activeTab === 'flashcards' && (
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
            {flashcards.map((card, i) => (
               <FlashCard key={i} card={card} />
            ))}
         </div>
       )}

       {activeVideo && (
          <Modal title="Now Playing" onClose={() => setActiveVideo(null)} maxWidth="max-w-2xl">
             <video src={activeVideo} controls className="w-full rounded-lg" autoPlay />
          </Modal>
       )}

       {activeArticle && (
          <Modal title={activeArticle.title} onClose={() => setActiveArticle(null)}>
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                   <Badge variant="outline">{activeArticle.type}</Badge>
                   <span>By {activeArticle.author}</span>
                </div>
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{activeArticle.content}</p>
             </div>
          </Modal>
       )}
    </div>
  );
}

const FlashCard = ({ card }: any) => {
   const [flipped, setFlipped] = useState(false);
   return (
      <div onClick={() => setFlipped(!flipped)} className={`h-48 cursor-pointer transition-all duration-500 preserve-3d perspective-1000 group`}>
         <div className={`relative w-full h-full rounded-xl border border-orange-100 shadow-sm p-6 flex flex-col items-center justify-center text-center transition-all duration-500 bg-gradient-to-br from-yellow-50 to-orange-50 ${flipped ? 'rotate-y-180' : ''}`} style={{transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'}}>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 backface-hidden" style={{backfaceVisibility: 'hidden'}}>
               <Layers className="w-12 h-12 text-orange-400 mb-3 opacity-50"/>
               <h4 className="font-bold text-orange-900 text-lg">{card.title}</h4>
               <span className="text-xs text-orange-600 mt-4 font-bold flex items-center gap-1"><RotateCw className="w-3 h-3"/> CLICK TO FLIP</span>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-orange-200 backface-hidden" style={{backfaceVisibility: 'hidden', transform: 'rotateY(180deg)'}}>
               <p className="text-sm text-slate-700 leading-relaxed font-medium">{card.desc}</p>
            </div>
         </div>
      </div>
   );
};

// --- FEATURE: AI COACH ---
const AICoachView = ({ showToast }: any) => {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [autoDelete, setAutoDelete] = useState(true);

  const handleAnalyze = () => {
      setAnalyzing(true);
      setTimeout(() => {
          setAnalyzing(false);
          // Insert the user's specific prompt into result
          setResult(`**Analysis based on request:** "${prompt}"\n\n1. **Visuals:** Good posture.\n2. **Tone:** Clear voice.\n3. **Expression:** Needs more emotion in eyes.`);
          showToast("Analysis Complete!");
          if (autoDelete) {
             setFile(null);
             showToast("Video deleted for privacy");
          }
      }, 3000);
  };

  const saveReport = () => {
      // Create a real downloadable text file
      const blob = new Blob([result || ''], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `AI_Coach_Report_${Date.now()}.txt`;
      a.click();
      showToast("Report Saved!");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <div className="text-center mb-8"><h2 className="text-3xl font-bold text-slate-900">AI Coach</h2></div>
       <Card className="p-6">
          {!result ? (
             <div className="space-y-4">
                <Input type="file" onChange={(e:any) => setFile(e.target.files[0])} />
                <Input label="Specific Request" value={prompt} onChange={setPrompt} placeholder="What should I focus on?" />
                <div className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autoDelete} onChange={(e) => setAutoDelete(e.target.checked)}/> Auto-delete video</div>
                <Button onClick={handleAnalyze} disabled={!file || analyzing} className="w-full">{analyzing ? 'Analyzing...' : 'Analyze Performance'}</Button>
             </div>
          ) : (
             <div className="space-y-4">
                <div className="p-4 bg-green-50 text-green-900 rounded whitespace-pre-wrap">{result}</div>
                <div className="flex gap-2">
                   <Button variant="outline" className="w-full" onClick={() => setResult(null)}>Analyze Another</Button>
                   <Button variant="secondary" className="w-full" onClick={saveReport}><Download className="w-4 h-4 mr-2"/> Save Report</Button>
                </div>
             </div>
          )}
       </Card>
    </div>
  );
};

// --- UPDATED PROFILE MANAGER ---
const ProfileManager = ({ profile, supabase, onUpdate, showToast }: any) => {
  const [isEditing, setIsEditing] = useState(false);

  const shareProfile = async () => {
    const url = window.location.origin + '?user=' + profile.username;
    if (navigator.share) {
      try { await navigator.share({ title: `Check out ${profile.full_name}`, text: `View my artist portfolio!`, url: url }); } catch (err) { console.log('Share canceled'); }
    } else {
      if (navigator.clipboard) { await navigator.clipboard.writeText(url); showToast('Profile link copied to clipboard!'); } else { showToast('Profile link copied!'); }
    }
  };

  const handleUpdateAndClose = () => {
     onUpdate();
     setIsEditing(false); // Only switch back AFTER update confirms
  };

  return (
    <div className="max-w-4xl mx-auto">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-slate-900">My Profile</h2>
         <div className="flex gap-2">
            <Button onClick={shareProfile} variant="secondary"><Share2 className="w-4 h-4 mr-2"/> Share</Button>
            <Button onClick={() => setIsEditing(!isEditing)} variant={isEditing ? 'outline' : 'primary'}>{isEditing ? <><ArrowLeft className="w-4 h-4 mr-2"/> Back to View</> : <><Edit2 className="w-4 h-4 mr-2"/> Edit Profile</>}</Button>
         </div>
       </div>
       {isEditing ? <ProfileEditor profile={profile} supabase={supabase} onUpdate={handleUpdateAndClose} showToast={showToast} /> : <ProfileViewer profile={profile} />}
    </div>
  );
};

const ProfileViewer = ({ profile }: any) => {
  const specs = profile?.profile_specs || {};
  const portfolio = profile?.profile_portfolio || {};
  const media = portfolio?.media_assets || {};
  const socials = portfolio?.social_links || {};
  const experience = portfolio?.experience_json || [];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {/* LEFT COLUMN: Identity & Stats */}
      <Card className="p-6 space-y-6 md:col-span-1 h-fit">
         <div className="text-center">
            {media.headshot ? <img src={media.headshot} alt="Headshot" className="w-32 h-32 mx-auto rounded-full object-cover mb-4 border-4 border-purple-100 shadow-md bg-slate-100" onError={(e: any) => { e.target.onerror = null; e.target.src='https://ui-avatars.com/api/?name='+profile.full_name+'&background=random'; }} /> : <div className="w-32 h-32 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-4xl font-bold text-purple-700 mb-4 shadow-md">{profile.full_name[0]}</div>}
            <h3 className="font-bold text-xl text-slate-900">{specs.stage_name || profile.full_name}</h3>
            <p className="text-slate-500 text-sm">@{profile.username}</p>
            <div className="flex justify-center gap-2 mt-3"><Badge className="bg-purple-100 text-purple-800">{specs.primary_skill || 'Artist'}</Badge><Badge variant="outline">{profile.role_type}</Badge></div>
         </div>

         <div className="border-t border-slate-100 pt-4 text-sm space-y-2">
            <div className="flex justify-between"><span>Year of Birth</span><span className="font-medium">{specs.date_of_birth ? new Date(specs.date_of_birth).getFullYear() : '-'}</span></div>
            <div className="flex justify-between"><span>Height</span><span className="font-medium">{specs.height_ft ? `${specs.height_ft}'${specs.height_in}"` : '-'}</span></div>
            <div className="flex justify-between"><span>Build</span><span className="font-medium">{specs.build_type || '-'}</span></div>
         </div>

         <div className="border-t border-slate-100 pt-4"><h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</h4><p className="text-sm text-slate-600">{specs.city || 'Not set'}, {specs.country}</p></div>

         {/* Socials */}
         <div className="flex justify-center gap-4 pt-2">
            {socials.facebook && <a href={socials.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:scale-110 transition-transform"><Facebook className="w-5 h-5"/></a>}
            {socials.instagram && <a href={socials.instagram} target="_blank" rel="noreferrer" className="text-pink-600 hover:scale-110 transition-transform"><Instagram className="w-5 h-5"/></a>}
            {socials.linkedin && <a href={socials.linkedin} target="_blank" rel="noreferrer" className="text-blue-700 hover:scale-110 transition-transform"><Linkedin className="w-5 h-5"/></a>}
         </div>
      </Card>

      {/* RIGHT COLUMN: Portfolio Content */}
      <div className="md:col-span-2 space-y-6">
         {/* Bio */}
         <Card className="p-6">
            <h4 className="font-bold text-lg mb-3 text-purple-900">About Me</h4>
            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">{portfolio.bio || "No bio added."}</p>
            
            {portfolio.artistic_belief && (
               <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100 italic text-purple-800 text-sm">
                  "{portfolio.artistic_belief}"
               </div>
            )}
         </Card>

         {/* Media Gallery */}
         <Card className="p-6">
            <h4 className="font-bold text-lg mb-4 text-purple-900 flex items-center gap-2"><Camera className="w-5 h-5"/> Gallery</h4>
            <div className="grid grid-cols-3 gap-4">
               {['headshot', 'midshot', 'longshot'].map(key => {
                  const imgUrl = media[key];
                  return (
                    <div key={key} className="aspect-[3/4] bg-slate-100 rounded-lg overflow-hidden border border-slate-200 relative group">
                       {imgUrl ? (
                          <img 
                            src={imgUrl} 
                            alt={key} 
                            className="w-full h-full object-cover" 
                            onError={(e: any) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                          />
                       ) : null}
                       {/* Fallback if no image or error */}
                       <div className="absolute inset-0 flex items-center justify-center text-slate-300 text-xs uppercase" style={{ display: imgUrl ? 'none' : 'flex' }}>
                          No {key}
                       </div>
                       <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-1 text-center uppercase tracking-wider">
                          {key}
                       </div>
                    </div>
                  );
               })}
            </div>
         </Card>

         {/* Skills */}
         <Card className="p-6">
            <h4 className="font-bold text-lg mb-4 text-purple-900 flex items-center gap-2"><Star className="w-5 h-5"/> Skills</h4>
            <div className="flex flex-wrap gap-2">
               <Badge className="px-3 py-1 bg-purple-100 text-purple-800 text-sm">{specs.primary_skill || 'Artist'}</Badge>
               {specs.secondary_skills?.map((s: string, i: number) => (
                  <Badge key={i} variant="outline" className="px-3 py-1 text-sm">{s}</Badge>
               ))}
               {specs.languages_spoken?.map((l: string, i: number) => (
                  <Badge key={i} className="bg-orange-50 text-orange-700 border-orange-100">{l}</Badge>
               ))}
            </div>
         </Card>

         <Card className="p-6">
            <h4 className="font-bold text-lg mb-4 text-purple-900 flex items-center gap-2"><Briefcase className="w-5 h-5"/> Experience</h4>
            {/* Intro Video Sub-section */}
             {media.intro_video && (
               <div className="mb-6">
                  <h5 className="text-xs font-bold uppercase text-slate-400 mb-2">Intro Video</h5>
                  <video src={media.intro_video} controls className="w-full h-48 bg-black rounded"/>
               </div>
            )}
            {experience.length === 0 ? <p className="text-slate-400 text-sm">No experience listed.</p> : (
               <div className="space-y-4">
                  {experience.map((exp: any, i: number) => (
                     <div key={i} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex justify-between">
                           <h5 className="font-bold text-slate-900">{exp.title}</h5>
                           <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">{exp.year}</span>
                        </div>
                        <p className="text-sm text-purple-700 font-medium">{exp.role}</p>
                        <p className="text-sm text-slate-600 mt-1">{exp.description}</p>
                        {exp.media_url && (
                           <div className="mt-3">
                              {exp.media_type === 'video' ? (
                                 <video src={exp.media_url} controls className="w-full h-48 object-cover rounded-md bg-black" />
                              ) : exp.media_type === 'audio' ? (
                                 <audio src={exp.media_url} controls className="w-full" />
                              ) : (
                                 <img src={exp.media_url} alt="Work sample" className="h-32 rounded-md object-cover" />
                              )}
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            )}
         </Card>
      </div>
    </div>
  );
};

const ProfileEditor = ({ profile, supabase, onUpdate, showToast }: any) => {
  const [tab, setTab] = useState('intro');
  const [specs, setSpecs] = useState<any>(profile?.profile_specs || {});
  const [portfolio, setPortfolio] = useState<any>(profile?.profile_portfolio || {});
  const [media, setMedia] = useState<any>(portfolio?.media_assets || {});
  const [socials, setSocials] = useState<any>(portfolio?.social_links || {});
  const [experience, setExperience] = useState<any[]>(portfolio?.experience_json || []);
  const [uploading, setUploading] = useState<string | null>(null); // SINGLE UPLOAD STATE (v1.4)
  
  // Experience Form State
  const [showAddExp, setShowAddExp] = useState(false);
  const [expForm, setExpForm] = useState({ title: '', role: '', year: '', description: '', media_type: '', media_url: '' });
  const [expUploading, setExpUploading] = useState(false);

  const handleSave = async () => {
    try {
      await supabase.from('profile_specs').upsert({ ...specs, profile_id: profile.id });
      await supabase.from('profile_portfolio').upsert({ ...portfolio, profile_id: profile.id, media_assets: media, experience_json: experience, social_links: socials });
      onUpdate(); 
      showToast('Profile updated!');
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleImageUpload = async (event: any, type: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(type);
    try {
      // Compress first
      const compressedBlob = await compressImage(file); 
      const compressedFile = new File([compressedBlob], file.name, { type: 'image/jpeg' });
      const fileName = `${profile.id}/${type}_${Date.now()}.jpg`;
      
      const { error } = await supabase.storage.from('portfolio-media').upload(fileName, compressedFile, { upsert: true });
      if (error) throw error;

      const { data } = supabase.storage.from('portfolio-media').getPublicUrl(fileName);
      const key = type.toLowerCase().replace('-', '');
      const newMedia = { ...media, [key]: `${data.publicUrl}?t=${Date.now()}` }; 
      setMedia(newMedia);
      
      // Auto-save media state immediately
      await supabase.from('profile_portfolio').upsert({ profile_id: profile.id, media_assets: newMedia });
      showToast(`${type} uploaded!`);
    } catch (e: any) {
      showToast(`Upload failed: ${e.message}`, 'error');
    } finally {
      setUploading(null);
    }
  };

  const handleExpMediaUpload = async (e: any) => {
     const file = e.target.files?.[0];
     if (!file) return;
     setExpUploading(true);
     try {
        const fileExt = file.name.split('.').pop();
        let type = 'image';
        if (file.type.includes('video')) type = 'video';
        if (file.type.includes('audio')) type = 'audio';
        
        const fileName = `${profile.id}/exp_${Date.now()}.${fileExt}`;
        const { error } = await supabase.storage.from('portfolio-media').upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from('portfolio-media').getPublicUrl(fileName);
        setExpForm(prev => ({ ...prev, media_url: data.publicUrl, media_type: type }));
        showToast('Media attached!');
     } catch(err: any) {
        showToast(err.message, 'error');
     } finally {
        setExpUploading(false);
     }
  };

  const addExperience = () => {
     setExperience([...experience, expForm]);
     setShowAddExp(false);
     setExpForm({ title: '', role: '', year: '', description: '', media_type: '', media_url: '' });
  };

  return (
    <div className="bg-purple-50/50 p-6 rounded-xl border border-purple-100">
      <div className="flex justify-center mb-6 bg-white p-1 rounded-lg inline-block w-full shadow-sm">
        {['intro', 'skills_exp', 'hire_me'].map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-md text-sm font-medium capitalize w-1/3 ${tab === t ? 'bg-purple-100 text-purple-800' : 'text-slate-500'}`}>{t.replace('_', ' ')}</button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === 'intro' && (
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <h4 className="text-purple-800 font-bold mb-4">Profile Images</h4>
               <div className="grid grid-cols-3 gap-4">
                 {['Head-Shot', 'Mid-Shot', 'Long-Shot'].map((type) => {
                    const key = type.toLowerCase().replace('-', '');
                    return (
                      <div key={type} className="relative border-2 border-dashed border-purple-200 rounded-lg h-40 flex flex-col items-center justify-center bg-slate-50 overflow-hidden">
                         {uploading === type ? <Loader2 className="animate-spin text-purple-600"/> : media[key] ? <img src={media[key]} className="w-full h-full object-cover"/> : <Upload className="text-purple-300"/>}
                         <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleImageUpload(e, type)} disabled={!!uploading} />
                      </div>
                    )
                 })}
               </div>
             </div>
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 grid md:grid-cols-2 gap-4">
               <Input label="Stage Name" value={specs.stage_name} onChange={(v: string) => setSpecs({...specs, stage_name: v})} />
               <Input label="City" value={specs.city} onChange={(v: string) => setSpecs({...specs, city: v})} />
               <Input label="Height (Ft)" type="number" value={specs.height_ft} onChange={(v: string) => setSpecs({...specs, height_ft: parseInt(v)})} />
               <Input label="Build" value={specs.build_type} onChange={(v: string) => setSpecs({...specs, build_type: v})} />
               <Input label="Date of Birth" type="date" value={specs.date_of_birth} onChange={(v: string) => setSpecs({...specs, date_of_birth: v})} />
               <Input label="Languages (comma sep)" value={specs.languages_spoken?.join(', ')} onChange={(v: string) => setSpecs({...specs, languages_spoken: v.split(',').map(s=>s.trim())})} />
             </div>
          </div>
        )}

        {/* Merged Skills & Experience */}
        {tab === 'skills_exp' && (
           <div className="space-y-6">
              <div className="bg-white p-4 rounded-lg border border-slate-100">
                 <h4 className="font-bold text-purple-900 mb-2">Skills & Assets</h4>
                 <div className="space-y-3">
                    <div>
                       <label className="text-xs font-bold text-slate-500">Core Skill</label>
                       <Select value={specs.primary_skill} onChange={(v: string) => setSpecs({...specs, primary_skill: v})} options={['Actor', 'Dancer', 'Singer', 'Model', 'Voice Over']} />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500">Secondary Skills (comma separated)</label>
                       <textarea className="w-full border rounded p-2 text-sm" value={specs.secondary_skills?.join(', ')} onChange={(e) => setSpecs({...specs, secondary_skills: e.target.value.split(',').map(s=>s.trim())})} />
                    </div>
                    <div>
                       <label className="text-xs font-bold text-slate-500 mb-1 block">Intro Video (No Contact Info)</label>
                       <div className="border border-dashed p-3 rounded text-center relative bg-slate-50">
                          {media.intro_video ? <span className="text-green-600 text-sm">Video Uploaded</span> : <span className="text-slate-400 text-sm">Upload MP4</span>}
                          {uploading === 'intro_video' && <Loader2 className="animate-spin inline ml-2"/>}
                          <input type="file" accept="video/*" className="absolute inset-0 opacity-0" onChange={(e) => handleImageUpload(e, 'intro_video')} />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <h4 className="font-bold text-purple-900">Work Experience</h4>
                    <Button size="sm" variant="outline" onClick={() => setShowAddExp(true)}>+ Add Experience</Button>
                 </div>
                 {experience.map((ex, i) => (
                    <div key={i} className="p-3 bg-white border rounded flex justify-between items-center">
                       <div><div className="font-bold text-sm">{ex.title}</div><div className="text-xs text-slate-500">{ex.role}</div></div>
                       <Button size="sm" variant="danger" onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}><Trash2 className="w-3 h-3"/></Button>
                    </div>
                 ))}
              </div>
           </div>
        )}

        {tab === 'hire_me' && (
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-4">
              <h4 className="font-bold text-slate-900">Social Links</h4>
              <Input value={socials.facebook} onChange={(v: string) => setSocials({...socials, facebook: v})} placeholder="Facebook URL" />
              <Input value={socials.instagram} onChange={(v: string) => setSocials({...socials, instagram: v})} placeholder="Instagram URL" />
              <Input value={socials.linkedin} onChange={(v: string) => setSocials({...socials, linkedin: v})} placeholder="LinkedIn URL" />
           </div>
        )}
      </div>

      <div className="mt-6 flex justify-end sticky bottom-4">
        <Button onClick={handleSave} size="lg" className="shadow-xl">Save & Exit</Button>
      </div>

      {showAddExp && (
         <Modal title="Add Experience" onClose={() => setShowAddExp(false)}>
            <div className="space-y-4">
               <Input label="Project Title" value={expForm.title} onChange={(v: string) => setExpForm({...expForm, title: v})} />
               <Input label="Role" value={expForm.role} onChange={(v: string) => setExpForm({...expForm, role: v})} />
               <Input label="Year" value={expForm.year} onChange={(v: string) => setExpForm({...expForm, year: v})} />
               <Input label="Description" value={expForm.description} onChange={(v: string) => setExpForm({...expForm, description: v})} />
               <div className="border-2 border-dashed p-4 rounded text-center">
                  {expUploading ? <Loader2 className="animate-spin mx-auto"/> : (
                     <>
                        <Upload className="w-6 h-6 mx-auto mb-2 text-slate-400"/>
                        <p className="text-xs text-slate-500">Upload Image, GIF, Audio or Video (Max 50MB)</p>
                        <input type="file" accept="image/*,video/*,audio/*" onChange={handleExpMediaUpload} className="mt-2" />
                     </>
                  )}
                  {expForm.media_url && <p className="text-xs text-green-600 mt-2">File Attached!</p>}
               </div>
               <Button onClick={addExperience} disabled={!expForm.title || expUploading} className="w-full">Add to Profile</Button>
            </div>
         </Modal>
      )}
    </div>
  );
};

// --- PROJECTS ---
const ProjectsFeed = ({ supabase, profile, showToast, addLocalApp }: any) => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'mine'>('all');
  const [applicationModal, setApplicationModal] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const fetchProjects = async () => {
    setLoading(true);
    let query = supabase.from('projects').select('*, project_roles(*)').neq('status', 'closed').order('created_at', { ascending: false });
    if (filter === 'mine') query = query.eq('creator_id', profile.id);
    const { data } = await query;
    let list = data || [];

    // Add mocks if 'all'
    if (filter === 'all') {
       const mocks = [
          { id: 'mock1', title: 'The Silent Hill', description: 'Horror short film.', casting_agency: 'Red Chillies', project_roles: [{ role_name: 'Ghost' }], application_count: 12 },
          { id: 'mock2', title: 'Fizz Soda Ad', description: 'High energy dancers needed.', casting_agency: 'Ogilvy', project_roles: [{ role_name: 'Lead Dancer' }], application_count: 45 }
       ];
       list = [...list.filter(p => p.creator_id !== profile.id), ...mocks];
    }
    setProjects(list);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [filter]);

  const handleDelete = async (projectId: string) => {
    const { error } = await supabase.from('projects').update({ status: 'closed' }).eq('id', projectId);
    if (error) showToast('Error deleting', 'error');
    else { showToast('Project archived'); setDeleteConfirm(null); fetchProjects(); }
  };

  const handleApply = async (note: string) => {
     try {
        await supabase.from('user_applications').insert({
           applicant_id: profile.id,
           project_id: applicationModal.id,
           role_id: applicationModal.project_roles?.[0]?.id,
           cover_note: note,
           status: 'applied'
        });
        showToast('Application Sent!');
        setApplicationModal(null);
     } catch (e: any) { showToast(e.message, 'error'); }
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between bg-slate-100 p-1 rounded-lg">
          <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-xs rounded-md ${filter === 'all' ? 'bg-white shadow' : ''}`}>All Open</button>
          <button onClick={() => setFilter('mine')} className={`px-4 py-1.5 text-xs rounded-md ${filter === 'mine' ? 'bg-white shadow' : ''}`}>My Projects</button>
       </div>
       {loading ? <div className="text-center py-10">Loading...</div> : (
          <div className="grid md:grid-cols-2 gap-4">
             {projects.map((p, i) => (
                <ProjectCard key={i} project={p} isOwner={p.creator_id === profile.id} onEdit={() => setEditingProject(p)} onDelete={() => setDeleteConfirm(p.id)} onView={() => filter === 'mine' ? showToast("Manage applicants coming soon") : setApplicationModal(p)} />
             ))}
          </div>
       )}
       {applicationModal && <ApplicantFormModal project={applicationModal} onClose={() => setApplicationModal(null)} onApply={handleApply} showToast={showToast} />}
       {editingProject && <ProjectEditorModal supabase={supabase} creatorId={profile.id} project={editingProject} onClose={() => setEditingProject(null)} onSuccess={() => { setEditingProject(null); showToast('Project Saved!'); fetchProjects(); }} />}
       {deleteConfirm && <Modal title="Archive Project?" onClose={() => setDeleteConfirm(null)}><div className="space-y-4 text-center"><p className="text-slate-600">Are you sure?</p><div className="flex gap-2 justify-center"><Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button><Button variant="danger" onClick={() => handleDelete(deleteConfirm)}>Archive</Button></div></div></Modal>}
    </div>
  );
};

const ApplicantFormModal = ({ project, onClose, onApply }: any) => {
  const [coverNote, setCoverNote] = useState('');
  return (
    <Modal title={`Apply to ${project.title}`} onClose={onClose}>
       <div className="space-y-4">
          <Input label="Cover Note" placeholder="Why are you perfect for this role?" value={coverNote} onChange={setCoverNote} />
          <Button className="w-full" onClick={() => onApply(coverNote)}>Submit Audition</Button>
       </div>
    </Modal>
  );
};

const ProjectEditorModal = ({ supabase, creatorId, project, onClose, onSuccess }: any) => {
  const isNew = !project.id;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: project.title || '', description: project.description || '', casting_agency: project.casting_agency || '', project_type: project.project_type || '', start_date: project.date_start || '', end_date: project.date_end || '' });
  const [role, setRole] = useState(project.project_roles?.[0] || { role_name: '', description: '', audition_instructions: '' });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: projData, error: pError } = await supabase.from('projects').upsert({ id: project.id, creator_id: creatorId, ...form, status: 'casting' }).select().single();
      if (pError) throw pError;
      await supabase.from('project_roles').upsert({ project_id: projData.id, ...role, id: role.id });
      onSuccess();
    } catch (e: any) { alert(e.message); } finally { setLoading(false); }
  };

  return (
    <Modal title={isNew ? "Create Your Masterpiece" : "Edit Masterpiece"} onClose={onClose}>
      <div className="space-y-6">
        <Input label="Project Title" value={form.title} onChange={(v: string) => setForm({...form, title: v})} />
        <Input label="Description" value={form.description} onChange={(v: string) => setForm({...form, description: v})} />
        <Input label="Role Name" value={role.role_name} onChange={(v: string) => setRole({...role, role_name: v})} />
        <Button onClick={handleSubmit} disabled={loading} className="w-full">{loading ? 'Publishing...' : 'Publish Project'}</Button>
      </div>
    </Modal>
  );
};

const ProjectCard = ({ project, isOwner, onEdit, onDelete, onView }: any) => {
  const role = project.project_roles?.[0];
  return (
    <Card className="p-0 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full group relative">
      {isOwner && <div className="absolute top-2 right-2 flex gap-1 z-10"><button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 bg-white rounded-full shadow-sm text-purple-700"><Edit2 className="w-3 h-3"/></button><button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 bg-white rounded-full shadow-sm text-red-600"><Trash2 className="w-3 h-3"/></button></div>}
      <div className={`h-2 ${isOwner ? 'bg-green-500' : 'bg-gradient-to-r from-purple-500 to-indigo-500'}`}/>
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-1">{project.title}</h3>
        <p className="text-sm text-slate-500 mb-4">{project.description}</p>
        <div className="space-y-2 mb-4 flex-1">{role && <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded"><User className="w-4 h-4 mr-2" /> {role.role_name}</div>}</div>
        <Button className="w-full" variant={isOwner ? 'outline' : 'secondary'} onClick={onView}>{isOwner ? 'View Applicants' : 'View Details & Apply'}</Button>
      </div>
    </Card>
  );
};