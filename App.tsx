import React, { useState, useEffect } from 'react';
import { TweetData, AppTab } from './types';
import TweetLogger from './components/TweetLogger';
import StrategyView from './components/StrategyView';
import TipsView from './components/TipsView';
import LoginView from './components/LoginView';
import { auth, fetchUserTweets, logout } from './services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { BarChart3, PenTool, BookOpen, LogOut, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.DASHBOARD);
  const [tweets, setTweets] = useState<TweetData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Auth & Data Loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userTweets = await fetchUserTweets(currentUser.uid);
          setTweets(userTweets);
        } catch (e) {
          console.error("Failed to load tweets", e);
        }
      } else {
        setTweets([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setTweets([]);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case AppTab.DASHBOARD:
        return <TweetLogger tweets={tweets} setTweets={setTweets} user={user} />;
      case AppTab.STRATEGY:
        return <StrategyView tweets={tweets} />;
      case AppTab.TIPS:
        return <TipsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-slate-200 flex flex-col fixed md:sticky top-0 z-20 h-auto md:h-screen">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-lg">X</div>
          <span className="font-bold text-xl tracking-tight text-slate-900">Growth Pilot</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button
            onClick={() => setActiveTab(AppTab.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === AppTab.DASHBOARD 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Logger & Rewrite</span>
          </button>
          
          <button
            onClick={() => setActiveTab(AppTab.STRATEGY)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === AppTab.STRATEGY 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>AI Strategy</span>
          </button>
          
          <button
            onClick={() => setActiveTab(AppTab.TIPS)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              activeTab === AppTab.TIPS 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Growth Handbook</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-200 mb-3">
            {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-8 h-8 rounded-full" />
            ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold">
                    {user.email?.charAt(0).toUpperCase()}
                </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user.displayName || "User"}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto mt-16 md:mt-0">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;