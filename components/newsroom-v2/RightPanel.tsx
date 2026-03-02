
import React, { useState, useEffect, useRef } from 'react';
import { useNewsroom } from '../../hooks/useNewsroom';
import { ParametersPanel } from './ParametersPanel';
import { Settings, MessageSquare, Radio, Users, PenTool, Camera, Type } from 'lucide-react';

interface RightPanelProps {
  activeDept: string;
}

export const RightPanel: React.FC<RightPanelProps> = ({ activeDept }) => {
  const { logs, step } = useNewsroom();
  const [showParams, setShowParams] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getAgentIcon = (agentName: string) => {
    switch (agentName) {
      case 'THE SCOUT': return <Radio className="w-3 h-3" />;
      case 'THE BOARD': return <Users className="w-3 h-3" />;
      case 'THE COLUMNIST': return <Type className="w-3 h-3" />;
      case 'THE EDITOR': return <PenTool className="w-3 h-3" />;
      case 'THE PHOTOGRAPHER': return <Camera className="w-3 h-3" />;
      default: return <MessageSquare className="w-3 h-3" />;
    }
  };

  const getAgentColor = (agentName: string) => {
    switch (agentName) {
      case 'THE SCOUT': return 'text-blue-400';
      case 'THE BOARD': return 'text-purple-400';
      case 'THE COLUMNIST': return 'text-emerald-400';
      case 'THE EDITOR': return 'text-red-400';
      case 'THE PHOTOGRAPHER': return 'text-pink-400';
      default: return 'text-zinc-400';
    }
  };

  return (
    <div className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col shrink-0 h-full">
      {/* Header */}
      <div className="h-12 border-b border-zinc-800 flex items-center justify-between px-4 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${step !== 'IDLE' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'}`} />
          <span className="text-xs font-bold tracking-widest text-zinc-300 uppercase">AGENT CHATTER</span>
        </div>
        <button 
          onClick={() => setShowParams(!showParams)}
          className={`p-2 rounded hover:bg-zinc-800 transition-colors ${showParams ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-500'}`}
          title="Toggle Parameters"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Parameters Overlay (if active) */}
      {showParams ? (
        <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 animate-slide-in">
          <ParametersPanel activeDept={activeDept} />
        </div>
      ) : (
        /* Agent Chatter Stream */
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scroll-smooth"
        >
          {logs.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 italic">
              Awaiting agent signals...
            </div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="flex gap-3 animate-fade-in group">
                <div className={`mt-1 shrink-0 ${getAgentColor(log.agentName)} opacity-70 group-hover:opacity-100 transition-opacity`}>
                  {getAgentIcon(log.agentName)}
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold tracking-wider text-[10px] ${getAgentColor(log.agentName)}`}>
                      {log.agentName}
                    </span>
                    <span className="text-[10px] text-zinc-600">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    {log.message}
                  </p>
                </div>
              </div>
            ))
          )}
          {/* Typing Indicator if active */}
          {step !== 'IDLE' && step !== 'PUBLISHED' && (
            <div className="flex gap-2 items-center px-8 py-2 opacity-50">
              <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1 h-1 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
