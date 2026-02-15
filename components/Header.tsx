
import React, { useState } from 'react';
import { login, signUp, signOut } from '../services/storage';
import { IssueMeta } from '../types';

interface HeaderProps {
  onNavigate: (section: string) => void;
  onOpenNewsroom: () => void;
  onOpenArchive: () => void;
  onShare: () => void;
  session: any;
  meta?: IssueMeta;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, onOpenNewsroom, onShare, session, meta }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // BYPASS AUTH FOR DEMO
  const handleAuthSubmit = async (e: React.FormEvent) => { e.preventDefault(); await login(email, password); setShowLoginModal(false); };

  return (
    <>
      <header className="w-full bg-white border-b border-black sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 h-14 flex justify-between items-center text-black">
          
          {/* LEFT: LOGO */}
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
            <span className="w-3 h-3 bg-black rounded-full mr-3"></span>
            <h1 className="font-sans font-black uppercase text-base tracking-tighter leading-none">NormPrompt</h1>
          </div>

          {/* CENTER: META (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.2em]">
             <span>{meta?.date || "2026"}</span>
             <span className="text-gray-400">•</span>
             <span>{meta?.theme || "SYNTHETIC ERA"}</span>
          </div>

          {/* RIGHT: ACTIONS */}
          <nav className="flex items-center gap-6">
              <button onClick={onShare} className="hidden md:block text-[10px] font-bold uppercase tracking-widest hover:underline decoration-1 underline-offset-4">
                  Contribute
              </button>
              <button className="hidden md:block text-[10px] font-bold uppercase tracking-widest hover:underline decoration-1 underline-offset-4">
                  Subscribe
              </button>
              
              {session ? (
                  <button onClick={onOpenNewsroom} className="bg-black text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
                      Redaktion
                  </button>
              ) : (
                  <button onClick={() => setShowLoginModal(true)} className="text-[10px] font-bold uppercase tracking-widest">
                      Login
                  </button>
              )}
          </nav>
        </div>
      </header>

      {/* MODAL REMOVED FOR BREVITY - KEEPING LOGIC MINIMAL */}
      {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 backdrop-blur">
              <div className="bg-white border border-black p-8 max-w-sm w-full shadow-2xl">
                  <h2 className="text-xl font-bold uppercase mb-6">Access Control</h2>
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                      <input type="email" placeholder="AGENT ID" className="w-full border-b border-black py-2 outline-none text-sm font-mono" value={email} onChange={e => setEmail(e.target.value)} />
                      <input type="password" placeholder="KEY" className="w-full border-b border-black py-2 outline-none text-sm font-mono" value={password} onChange={e => setPassword(e.target.value)} />
                      <div className="flex gap-4 pt-4">
                          <button type="submit" className="flex-1 bg-black text-white py-3 text-xs font-bold uppercase">Enter</button>
                          <button type="button" onClick={() => setShowLoginModal(false)} className="flex-1 border border-black py-3 text-xs font-bold uppercase">Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </>
  );
};
