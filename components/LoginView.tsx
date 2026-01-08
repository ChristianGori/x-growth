import React, { useState } from 'react';
import { signInWithGoogle } from '../services/firebase';
import { Loader2 } from 'lucide-react';

const LoginView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError("Failed to sign in. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl mx-auto flex items-center justify-center backdrop-blur-sm mb-4">
            <span className="text-3xl font-bold text-white">X</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">X-Growth Pilot</h1>
          <p className="text-slate-300">Your AI-powered assistant for social media dominance.</p>
        </div>
        
        <div className="p-8">
          <p className="text-center text-slate-600 mb-8">
            Sign in to sync your data across devices and unlock AI insights.
          </p>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            )}
            Continue with Google
          </button>
          
          <div className="mt-6 text-center text-xs text-slate-400">
            By continuing, you agree to store your tweet data for analysis purposes.
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginView;