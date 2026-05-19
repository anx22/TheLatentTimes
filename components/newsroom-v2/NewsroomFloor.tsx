import React, { useContext } from 'react';
import { X, Radio, MessageSquare, Image, Printer, Layout, Terminal } from 'lucide-react';
import { NewsroomContext } from '../../contexts/NewsroomContext';
import { TheWire } from './TheWire';
import { TheBullpen } from './TheBullpen';
import { TheDarkroom } from './TheDarkroom';
import { PrintingPress } from './printing-press/PrintingPress';

interface NewsroomFloorProps {
  onClose: () => void;
}

export const NewsroomFloor: React.FC<NewsroomFloorProps> = ({ onClose }) => {
  const context = useContext(NewsroomContext);
  if (!context) return null;

  const { step, setStep, logs } = context;

  const departments = [
    { id: 'NEWS_TERMINAL', name: 'The Wire', icon: Radio },
    { id: 'EDITORIAL_BOARD', name: 'The Bullpen', icon: MessageSquare },
    { id: 'DARKROOM', name: 'The Darkroom', icon: Image },
    { id: 'PRINTING_PRESS', name: 'The Press', icon: Printer },
  ];

  const renderActiveDepartment = () => {
    switch (step) {
      case 'NEWS_TERMINAL':
        return <TheWire />;
      case 'EDITORIAL_BOARD':
        return <TheBullpen />;
      case 'DARKROOM':
        return <TheDarkroom />;
      case 'PRINTING_PRESS':
      case 'PUBLISHED':
        return <PrintingPress />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center bg-[#111] text-zinc-500 border-zinc-800 border-l">
            <Terminal className="w-12 h-12 mb-4 opacity-20" />
            <h2 className="font-mono text-xs uppercase tracking-[0.3em]">System Standby</h2>
            <p className="font-mono text-[10px] mt-2 opacity-50">Awaiting operational signal</p>
            <button 
                onClick={() => setStep('NEWS_TERMINAL')}
                className="mt-8 border border-zinc-800 px-6 py-2 text-[10px] font-mono uppercase tracking-widest hover:bg-zinc-800 hover:text-white transition-all"
            >
                Initialize Terminal
            </button>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col animate-fade-in text-white font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Bar */}
      <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 shrink-0 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] font-bold">
            Newsroom Floor <span className="text-zinc-600">v2.0</span>
          </span>
        </div>
        
        <div className="flex items-center gap-8">
           <div className="hidden md:flex items-center gap-6">
              {departments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setStep(dept.id as any)}
                  className={`flex items-center gap-2 text-[10px] uppercase tracking-widest transition-all ${
                    step === dept.id ? 'text-emerald-400' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <dept.icon className={`w-3.5 h-3.5 ${step === dept.id ? 'text-emerald-400' : 'text-zinc-600'}`} />
                  {dept.name}
                </button>
              ))}
           </div>
           
           <div className="h-4 w-px bg-zinc-800"></div>

           <button 
             onClick={onClose}
             className="text-zinc-500 hover:text-white transition-colors p-2"
           >
             <X className="w-5 h-5" />
           </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar: Operational Chain */}
        <div className="w-16 md:w-20 border-r border-zinc-800 flex flex-col items-center py-8 gap-10 bg-[#0a0a0a] shrink-0">
            {departments.map((dept) => (
                <div key={dept.id} className="relative group">
                    <button
                        onClick={() => setStep(dept.id as any)}
                        className={`w-10 h-10 rounded-sm flex items-center justify-center transition-all border ${
                            step === dept.id 
                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400' 
                            : 'border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:bg-zinc-900'
                        }`}
                    >
                        <dept.icon className="w-5 h-5" />
                    </button>
                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 bg-black border border-zinc-800 px-2 py-1 rounded text-[8px] font-mono uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                        {dept.name}
                    </div>
                </div>
            ))}
        </div>

        {/* Center: Department Content */}
        <div className="flex-1 flex overflow-hidden bg-[#0a0a0a]">
          {renderActiveDepartment()}
        </div>

        {/* Right Sidebar: Logs/System Monitor */}
        <div className="hidden lg:flex w-80 border-l border-zinc-800 flex-col bg-[#0a0a0a] shrink-0">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-black/40">
            <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-400">System Logs</span>
            <div className="flex gap-1">
              <span className="w-1 h-1 bg-emerald-500 rounded-full"></span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-50"></span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full opacity-20"></span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
            {logs.slice().reverse().map((log, i) => (
              <div key={log._id || i} className="space-y-1.5 animate-in slide-in-from-right-2 duration-300">
                <div className="flex justify-between items-center text-[8px]">
                  <span className={`uppercase tracking-widest font-bold ${
                    log.agentName === 'SYSTEM' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    [{log.agentName}]
                  </span>
                  <span className="text-zinc-600">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="text-[10px] leading-relaxed text-zinc-300 break-words border-l border-zinc-800 pl-3 py-0.5">
                  {log.message}
                </div>
              </div>
            ))}
            {logs.length === 0 && (
                <div className="h-full flex items-center justify-center">
                    <p className="text-[10px] text-zinc-700 uppercase tracking-widest">No active traffic</p>
                </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Bottom Status Bar */}
      <div className="h-10 border-t border-zinc-800 bg-[#0a0a0a] text-zinc-500 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-6 text-[8px] font-mono uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <span className="w-1 h-1 bg-emerald-500"></span>
                Status: Operational
              </span>
              <span className="text-zinc-800">|</span>
              <span>Agents: Active</span>
          </div>
          <div className="flex items-center gap-4 text-[8px] font-mono uppercase tracking-widest">
              <span className="text-emerald-500/50">LNT.OS_v2.1</span>
          </div>
      </div>
    </div>
  );
};
