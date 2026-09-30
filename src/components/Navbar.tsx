import React from 'react';
import { 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Bot, 
  Clock, 
  Radio, 
  AlertTriangle,
  Flame,
  LayoutDashboard,
  Compass,
  Calculator,
  LineChart,
  Gamepad2,
  GraduationCap
} from 'lucide-react';
import { audioService } from '../services/audioService';

export type NavTab = 'dashboard' | 'safety' | 'estimator' | 'anomalies' | 'simulator' | 'training';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  seatbeltFastened: boolean;
  setSeatbeltFastened: (fastened: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  onOpenCopilot: () => void;
  onTriggerSos: () => void;
  activeAlertCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  seatbeltFastened,
  setSeatbeltFastened,
  soundEnabled,
  setSoundEnabled,
  onOpenCopilot,
  onTriggerSos,
  activeAlertCount
}) => {
  const toggleSeatbelt = () => {
    const next = !seatbeltFastened;
    setSeatbeltFastened(next);
    audioService.playSeatbeltChime(next);
    if (!next) {
      audioService.playWarningAlarm();
      audioService.speakVoice('Warning. Operator seatbelt unlatched. Safety interlock engaged.');
    } else {
      audioService.speakVoice('Seatbelt secure. Hydraulic interlock ready.');
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    audioService.soundEnabled = next;
    audioService.speechEnabled = next;
  };

  const tabs: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Live Cockpit', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'safety', label: '360° Safety Radar', icon: <Compass className="w-4 h-4" />, badge: activeAlertCount > 0 ? `${activeAlertCount}` : undefined },
    { id: 'estimator', label: 'AI Task Estimator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'anomalies', label: 'Telematics & Idle AI', icon: <LineChart className="w-4 h-4" /> },
    { id: 'simulator', label: 'Excavator 3D Sim', icon: <Gamepad2 className="w-4 h-4" />, badge: 'Live' },
    { id: 'training', label: 'Training & Booking', icon: <GraduationCap className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#121316]/95 backdrop-blur-md border-b border-cat-border/80 shadow-2xl">
      {/* Top Industrial Strip */}
      <div className="h-1 w-full cat-pattern" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Equipment Info */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-cat-yellow flex items-center justify-center font-black text-black text-xl shadow-lg shadow-cat-yellow/20">
                <span>CAT</span>
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg tracking-wider text-white">SENTINEL</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-cat-yellow/20 text-cat-yellow border border-cat-yellow/40">PRO v4.8</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono flex items-center space-x-2">
                  <span className="text-cat-yellow font-semibold">EXC001</span>
                  <span>•</span>
                  <span>OP1001 (Mack Vance)</span>
                </div>
              </div>
            </div>

            {/* Live Operational Status Pill */}
            <div className="hidden lg:flex items-center space-x-2 bg-cat-surface px-3 py-1.5 rounded-md border border-cat-border text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-slate-300">TELEMETRICS LIVE</span>
              <span className="text-slate-500">|</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" /> 1530.2 HRS
              </span>
            </div>
          </div>

          {/* Center / Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Seatbelt Interlock Switch */}
            <button
              onClick={toggleSeatbelt}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                seatbeltFastened
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
                  : 'bg-rose-950/80 text-rose-300 border-rose-500 animate-pulse hover:bg-rose-900'
              }`}
              title="Toggle Seatbelt Compliance Switch"
            >
              <ShieldAlert className={`w-4 h-4 ${seatbeltFastened ? 'text-emerald-400' : 'text-rose-400 animate-bounce'}`} />
              <span className="hidden sm:inline">SEATBELT:</span>
              <span>{seatbeltFastened ? 'FASTENED ✓' : 'UNFASTENED ⚠️'}</span>
            </button>

            {/* Audio Mute/Unmute */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-lg border text-xs transition-colors ${
                soundEnabled 
                  ? 'bg-cat-card text-cat-yellow border-cat-border hover:border-cat-yellow' 
                  : 'bg-cat-surface text-slate-500 border-cat-border'
              }`}
              title={soundEnabled ? 'Audio alerts enabled' : 'Audio muted'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* AI Voice Copilot Button */}
            <button
              onClick={onOpenCopilot}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-cat-yellow/30 text-cat-yellow border border-cat-yellow/50 hover:bg-cat-yellow/20 text-xs font-semibold shadow-sm transition-all"
            >
              <Bot className="w-4 h-4 animate-pulse text-cat-yellow" />
              <span className="hidden md:inline">CAT Copilot</span>
            </button>

            {/* Emergency SOS Button */}
            <button
              onClick={onTriggerSos}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-red-600 text-white font-black text-xs hover:bg-red-700 active:scale-95 shadow-lg shadow-red-600/30 transition-all uppercase tracking-wider"
            >
              <Radio className="w-4 h-4 animate-ping" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Bottom Nav Tabs Bar */}
        <div className="flex space-x-1 overflow-x-auto py-2 border-t border-cat-border/40 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  audioService.playHydraulicClick();
                }}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cat-yellow text-black font-bold shadow-md shadow-cat-yellow/20'
                    : 'text-slate-300 hover:text-white hover:bg-cat-surface/80'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-black text-cat-yellow' : 'bg-rose-500 text-white animate-pulse'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
