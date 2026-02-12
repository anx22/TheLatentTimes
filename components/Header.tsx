
import React, { useState, useEffect } from 'react';
import { login, signUp, signOut, supabase } from '../services/storage';

interface HeaderProps {
  onNavigate: (section: string) => void;
  onOpenNewsroom: () => void;
  onOpenArchive: () => void; // New prop
  session: any;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenNewsroom, onOpenArchive, session }) => {
  const [showStealth, setShowStealth] = useState(false);
  
  // Login State
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setShowStealth(true);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt') setShowStealth(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      setAuthError(null);
      setAuthSuccess(null);
      
      let result;
      if (isSignUp) {
          result = await signUp(email, password);
      } else {
          result = await login(email, password);
      }
      
      setAuthLoading(false);
      
      if (result.error) {
          setAuthError(result.error.message);
      } else {
          if (isSignUp) {
            setAuthSuccess("Registration successful. Please check your email to confirm, then login.");
            setIsSignUp(false); // Switch back to login mode
          } else {
            // Success: Close modal (App.tsx handles session update)
            setShowLoginModal(false);
            setEmail('');
            setPassword('');
          }
      }
  };

  const handleLogout = async () => {
      await signOut();
  };

  return (
    <>
      <header className="w-full bg-white border-b border-black py-6 sticky top-0 z-30">
        <div className="max-w-[1536px] mx-auto px-6 md:px-16 flex justify-between items-end">
          {/* Left: Branding */}
          <div className="flex items-baseline gap-4 group cursor-pointer" onClick={() => onNavigate('home')}>
            <h1 
              className="font-display font-bold uppercase leading-none text-6xl md:text-7xl tracking-tighter"
            >
              Modus
            </h1>
            <div className="hidden md:flex flex-col gap-0 text-[9px] font-sans font-bold tracking-[0.2em] uppercase opacity-100 mb-1 group-hover:text-accent transition-colors">
              <span>Vol. 13</span>
              <span className="text-neutral-400">Sep. 25</span>
            </div>
          </div>

          {/* Right: Nav */}
          <nav className="flex items-center gap-8">
            {showStealth ? (
              <div className="flex items-center gap-4 animate-fade-in">
                  {session ? (
                      <>
                          <span className="text-[9px] font-mono text-neutral-400 hidden md:block">
                              {session.user.email}
                          </span>
                          <button 
                              onClick={onOpenNewsroom}
                              className="bg-accent text-white hover:bg-black transition-colors duration-300 font-sans font-bold uppercase tracking-[0.2em] px-5 py-2 text-[10px]"
                          >
                              Redaktion
                          </button>
                          <button 
                              onClick={handleLogout}
                              className="text-neutral-500 hover:text-black font-sans font-bold uppercase tracking-[0.2em] text-[9px]"
                          >
                              Logout
                          </button>
                      </>
                  ) : (
                      <button 
                          onClick={() => setShowLoginModal(true)}
                          className="bg-black text-white hover:bg-neutral-800 transition-colors duration-300 font-sans font-bold uppercase tracking-[0.2em] px-5 py-2 text-[10px] border border-transparent hover:border-accent"
                      >
                          Initialize Access
                      </button>
                  )}
              </div>
            ) : (
              <>
                  <button 
                    onClick={onOpenArchive}
                    className="hidden md:block text-[10px] font-sans font-bold uppercase tracking-[0.2em] hover:text-accent transition-colors"
                  >
                      The Archive
                  </button>
                  <button className="bg-black text-white hover:bg-accent transition-colors duration-300 font-sans font-bold uppercase tracking-[0.2em] px-5 py-2 text-[10px]">
                      Subscribe
                  </button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
              onClick={() => setShowLoginModal(false)}
            />
            
            {/* Dialog Content */}
            <div className="relative bg-white border-2 border-black p-8 w-full max-w-sm shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-fade-in">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                        {isSignUp ? 'New Credential' : 'System Access'}
                    </h2>
                    <button onClick={() => setShowLoginModal(false)} className="text-xl hover:text-accent">×</button>
                </div>
                
                {/* Tabs */}
                <div className="flex border-b border-neutral-200 mb-6">
                    <button 
                        onClick={() => { setIsSignUp(false); setAuthError(null); setAuthSuccess(null); }}
                        className={`flex-1 pb-2 text-[10px] font-sans font-bold uppercase tracking-widest ${!isSignUp ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'}`}
                    >
                        Login
                    </button>
                    <button 
                        onClick={() => { setIsSignUp(true); setAuthError(null); setAuthSuccess(null); }}
                        className={`flex-1 pb-2 text-[10px] font-sans font-bold uppercase tracking-widest ${isSignUp ? 'border-b-2 border-black text-black' : 'text-neutral-400 hover:text-black'}`}
                    >
                        Register
                    </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-sans font-bold tracking-[0.2em] uppercase mb-2 text-neutral-500">
                            Email Identifier
                        </label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-300 p-3 text-sm focus:border-black focus:outline-none transition-colors font-mono"
                            placeholder="agent@modus.news"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-[10px] font-sans font-bold tracking-[0.2em] uppercase mb-2 text-neutral-500">
                            Passkey
                        </label>
                        <input 
                            type="password" 
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-neutral-50 border border-neutral-300 p-3 text-sm focus:border-black focus:outline-none transition-colors font-mono"
                            placeholder="••••••••"
                        />
                    </div>

                    {authError && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-3 text-[10px] text-red-600 font-mono">
                            ERR: {authError}
                        </div>
                    )}

                    {authSuccess && (
                        <div className="bg-green-50 border-l-4 border-green-500 p-3 text-[10px] text-green-700 font-mono">
                            {authSuccess}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={authLoading}
                        className="w-full bg-black text-white hover:bg-accent py-4 font-sans font-bold uppercase tracking-[0.25em] text-xs transition-colors disabled:opacity-50 disabled:cursor-wait"
                    >
                        {authLoading ? 'Processing...' : (isSignUp ? 'Create ID' : 'Authenticate')}
                    </button>

                    <div className="text-center pt-4 border-t border-neutral-100">
                         <span className="text-[9px] text-neutral-400 font-sans tracking-widest uppercase">Restricted Area • Authorized Personnel Only</span>
                    </div>
                </form>
            </div>
        </div>
      )}
    </>
  );
};
