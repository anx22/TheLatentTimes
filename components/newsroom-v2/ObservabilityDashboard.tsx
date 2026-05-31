import React, { useContext, useMemo } from 'react';
import { useQuery } from "convex/react";
import { api } from "../../frontendApi";
import { NewsroomContext } from "../../contexts/NewsroomContext";
import { NewsroomLabel, NewsroomPanel, NewsroomButton } from "./NewsroomUI";
import { Activity, ShieldAlert, CheckCircle2, Clock, Terminal, Search, Filter, AlertTriangle } from 'lucide-react';
import { cn } from "../../lib/utils";

export const ObservabilityDashboard: React.FC = () => {
    const context = useContext(NewsroomContext);
    const missions = useQuery(api.newsroom.queries.getMissions, { limit: 50 }) || [];
    const logs = context?.logs || [];
    
    const errorLogs = useMemo(() => logs.filter(l => l.level === 'error' || l.level === 'warning'), [logs]);
    const activeMissions = useMemo(() => missions.filter((m: any) => m.status === 'running'), [missions]);
    const failedMissions = useMemo(() => missions.filter((m: any) => m.status === 'failed'), [missions]);

    if (!context) return null;

    return (
        <div className="flex-1 bg-zinc-950 flex flex-col min-h-0 overflow-hidden font-mono">
            {/* Control Header */}
            <div className="p-6 border-b border-zinc-700 bg-zinc-900 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                        <Activity className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-white uppercase tracking-[0.3em]">System Observability</h1>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1 font-medium">LNT.OS Diagnostic Interface</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <NewsroomButton 
                        variant="ghost" 
                        onClick={() => context.clearLogs()}
                        className="text-[10px] border-zinc-700 hover:border-red-500/30 hover:text-red-500"
                    >
                        Flush Logs
                    </NewsroomButton>
                </div>
            </div>

            {/* Matrix View */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                
                {/* 1. Vital Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard 
                        label="Active Missions" 
                        value={activeMissions.length} 
                        status={activeMissions.length > 0 ? 'active' : 'idle'}
                        icon={Clock}
                    />
                    <StatCard 
                        label="System Failures" 
                        value={failedMissions.length} 
                        status={failedMissions.length > 0 ? 'error' : 'nominal'}
                        icon={ShieldAlert}
                    />
                    <StatCard 
                        label="Signal Resonance" 
                        value={`${Math.round(context.signals.length / Math.max(1, context.newsClusters.length))}x`} 
                        status="nominal"
                        icon={Activity}
                    />
                    <StatCard 
                        label="Log Density" 
                        value={logs.length} 
                        status="nominal"
                        icon={Terminal}
                    />
                </div>

                {/* 2. Critical Exceptions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <NewsroomLabel type="header" className="text-red-500/80 flex items-center gap-2">
                            <AlertTriangle className="w-3 h-3" />
                            Exceptions & Showstoppers
                        </NewsroomLabel>
                        <span className="text-[9px] text-zinc-600 uppercase tracking-widest">{errorLogs.length} caught in buffer</span>
                    </div>
                    <div className="space-y-2">
                        {errorLogs.length === 0 ? (
                            <div className="p-6 bg-zinc-900 border border-zinc-800 text-center rounded-sm">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500/20 mx-auto mb-2" />
                                <div className="text-[11px] text-zinc-600 uppercase tracking-widest">No critical errors detected. System is healthy.</div>
                            </div>
                        ) : (
                            errorLogs.slice(-10).reverse().map((log, i) => (
                                <div key={i} className="p-4 bg-red-950/10 border border-red-500/20 flex gap-4 items-start animate-in fade-in slide-in-from-left-2 transition-all">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-center text-[10px]">
                                            <span className="text-red-500 font-bold uppercase tracking-widest">[{log.agentName}] - {log.step}</span>
                                            <span className="text-zinc-700">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                        </div>
                                        <div className="text-xs text-red-500/80 leading-relaxed font-mono font-medium">
                                            {log.message}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* 3. Mission Manifest */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <NewsroomLabel type="header" className="text-emerald-500/80 flex items-center gap-2">
                            <Clock className="w-3 h-3" />
                            Mission Execution Manifest
                        </NewsroomLabel>
                        <NewsroomLabel type="key">Last 50 operations</NewsroomLabel>
                    </div>
                    <div className="overflow-hidden border border-zinc-600">
                        <table className="w-full text-left text-[11px] border-collapse">
                            <thead className="bg-zinc-900 text-zinc-500 uppercase tracking-widest font-black sticky top-0 z-10">
                                <tr>
                                    <th className="p-3 border-b border-zinc-700 font-bold">Operation ID</th>
                                    <th className="p-3 border-b border-zinc-700 font-bold">Process</th>
                                    <th className="p-3 border-b border-zinc-700 font-bold">Thread</th>
                                    <th className="p-3 border-b border-zinc-700 font-bold">Status</th>
                                    <th className="p-3 border-b border-zinc-700 font-bold">Duration</th>
                                    <th className="p-3 border-b border-zinc-700 font-bold">Telemetry</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-800">
                                {missions.map((mission: any) => (
                                    <tr key={mission._id} className="hover:bg-zinc-900/50 transition-colors group">
                                        <td className="p-3 text-zinc-600 font-mono">#{mission._id.slice(-6)}</td>
                                        <td className="p-3">
                                            <div className="flex flex-col">
                                                <span className="text-zinc-200 font-bold uppercase tracking-tight">{mission.topic}</span>
                                                <span className="text-[9px] text-zinc-500 uppercase tracking-widest">{new Date(mission.startedAt).toLocaleTimeString()}</span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <span className={cn(
                                                "px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest rounded-xs",
                                                mission.type === 'editorial' ? 'border-purple-500/20 text-purple-500 bg-purple-500/5' :
                                                mission.type === 'scout' ? 'border-blue-500/20 text-blue-500 bg-blue-500/5' :
                                                'border-zinc-700 text-zinc-500'
                                            )}>
                                                {mission.type}
                                            </span>
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-1.5 h-1.5 rounded-full",
                                                    mission.status === 'completed' ? 'bg-emerald-500' :
                                                    mission.status === 'failed' ? 'bg-red-500' : 'bg-amber-500 animate-pulse'
                                                )} />
                                                <span className={cn(
                                                    "uppercase text-[10px] font-bold tracking-widest",
                                                    mission.status === 'completed' ? 'text-emerald-500/80' :
                                                    mission.status === 'failed' ? 'text-red-500/80' : 'text-amber-500/80'
                                                )}>
                                                    {mission.status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-zinc-500">
                                            {mission.durationMs ? `${(mission.durationMs / 1000).toFixed(1)}s` : '--'}
                                        </td>
                                        <td className="p-3">
                                            {mission.tokenUsage ? (
                                                <div className="flex flex-col text-[9px] text-zinc-600">
                                                    <span>Σ {mission.tokenUsage.totalTokens}t</span>
                                                </div>
                                            ) : (
                                                <span className="text-zinc-800 italic">No usage recorded</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ label: string, value: string | number, status: 'active' | 'nominal' | 'error' | 'idle', icon: any }> = ({ label, value, status, icon: Icon }) => (
    <div className="bg-zinc-900 border border-zinc-700 p-4 flex items-center justify-between shadow-xl group hover:border-zinc-500 transition-colors">
        <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black block">{label}</span>
            <div className="flex items-center gap-3">
                <span className={cn(
                    "text-2xl font-bold tracking-tighter",
                    status === 'active' ? 'text-[#ccff00]' :
                    status === 'error' ? 'text-red-500' :
                    'text-white'
                )}>{value}</span>
                <div className={cn(
                    "px-2 py-0.5 text-[8px] uppercase tracking-widest font-black rounded-xs border",
                    status === 'active' ? 'bg-[#ccff00]/10 border-[#ccff00]/30 text-[#ccff00]' :
                    status === 'error' ? 'bg-red-500/10 border-red-500/30 text-red-500' :
                    status === 'idle' ? 'bg-zinc-800 border-zinc-700 text-zinc-500' :
                    'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                )}>
                    {status}
                </div>
            </div>
        </div>
        <Icon className="w-8 h-8 text-zinc-800 group-hover:text-zinc-700 transition-colors" />
    </div>
);
