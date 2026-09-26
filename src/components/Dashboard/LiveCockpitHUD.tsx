import React, { useState, useEffect } from 'react';
import { 
  Gauge, 
  Fuel, 
  Activity, 
  RotateCw, 
  Compass, 
  Zap, 
  AlertTriangle, 
  Layers, 
  Timer,
  Play,
  Pause,
  Sliders
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface LiveCockpitHUDProps {
  seatbeltFastened: boolean;
  onOpenRadar: () => void;
}

export const LiveCockpitHUD: React.FC<LiveCockpitHUDProps> = ({
  seatbeltFastened,
  onOpenRadar
}) => {
  const [engineMode, setEngineMode] = useState<'ECO' | 'STANDARD' | 'HEAVY_POWER'>('STANDARD');
  const [isSimulatingLoad, setIsSimulatingLoad] = useState(true);
  
  // Real-time telemetry states
  const [rpm, setRpm] = useState(1850);
  const [hydraulicPressure, setHydraulicPressure] = useState(285);
  const [fuelRate, setFuelRate] = useState(14.8);
  const [pitchAngle, setPitchAngle] = useState(2.8);
  const [rollAngle, setRollAngle] = useState(1.4);
  const [coolantTemp, setCoolantTemp] = useState(86);
  const [currentCycles, setCurrentCycles] = useState(14);
  const [liveIdlingMinutes, setLiveIdlingMinutes] = useState(18);

  // Live telemetry pulse animation
  useEffect(() => {
    if (!isSimulatingLoad) return;
    const interval = setInterval(() => {
      const baseRpm = engineMode === 'ECO' ? 1400 : engineMode === 'HEAVY_POWER' ? 2100 : 1800;
      const basePressure = engineMode === 'ECO' ? 240 : engineMode === 'HEAVY_POWER' ? 320 : 280;
      const baseFuel = engineMode === 'ECO' ? 11.2 : engineMode === 'HEAVY_POWER' ? 17.5 : 14.2;

      setRpm(Math.round(baseRpm + (Math.random() * 80 - 40)));
      setHydraulicPressure(Math.round(basePressure + (Math.random() * 20 - 10)));
      setFuelRate(Number((baseFuel + (Math.random() * 1.2 - 0.6)).toFixed(1)));
      setPitchAngle(Number((2.8 + (Math.random() * 0.8 - 0.4)).toFixed(1)));
      setRollAngle(Number((1.4 + (Math.random() * 0.6 - 0.3)).toFixed(1)));
      setCoolantTemp(prev => Math.min(94, Math.max(82, prev + (Math.random() * 0.4 - 0.2))));
    }, 1500);

    return () => clearInterval(interval);
  }, [isSimulatingLoad, engineMode]);

  const handleModeChange = (mode: 'ECO' | 'STANDARD' | 'HEAVY_POWER') => {
    setEngineMode(mode);
    audioService.playHydraulicClick();
    audioService.speakVoice(`Engine throttle mode set to ${mode.replace('_', ' ')}`);
  };

  const triggerCycleCount = () => {
    setCurrentCycles(c => c + 1);
    audioService.playHydraulicClick();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert if Seatbelt is unfastened */}
      {!seatbeltFastened && (
        <div className="bg-rose-950/80 border-2 border-rose-500 rounded-xl p-4 flex items-center justify-between animate-pulse shadow-lg shadow-rose-950/50">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-7 h-7 text-rose-400 animate-bounce" />
            <div>
              <h4 className="text-white font-bold text-sm tracking-wide">MANDATORY SAFETY WARNING: SEATBELT UNFASTENED</h4>
              <p className="text-xs text-rose-200">
                Hydraulic implement lockout active. Fasten seatbelt via the top bar switch to restore standard travel & slew capabilities.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-rose-600 text-white font-mono text-xs font-bold rounded">
            CODE: SEC-04
          </span>
        </div>
      )}

      {/* Main Cockpit Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gauge 1: Engine RPM */}
        <div className="hud-panel-active rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-cat-yellow" /> Engine Tachometer
            </span>
            <span className="text-[10px] font-mono bg-cat-surface px-2 py-0.5 rounded border border-cat-border text-emerald-400">
              OPTIMAL
            </span>
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-3xl font-black font-mono text-white">{rpm}</span>
            <span className="text-xs font-mono text-slate-400">RPM</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-cat-surface h-2 rounded-full overflow-hidden border border-cat-border mt-3">
            <div 
              className={`h-full transition-all duration-700 ${
                rpm > 2200 ? 'bg-rose-500' : rpm > 1700 ? 'bg-cat-yellow' : 'bg-emerald-500'
              }`}
              style={{ width: `${(rpm / 2400) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0</span>
            <span>1200 ECO</span>
            <span>2400 MAX</span>
          </div>
        </div>

        {/* Gauge 2: Hydraulic Main Pressure */}
        <div className="hud-panel-active rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cat-yellow" /> Main Hydraulics
            </span>
            <span className="text-[10px] font-mono bg-cat-surface px-2 py-0.5 rounded border border-cat-border text-cat-yellow">
              350 BAR MAX
            </span>
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-3xl font-black font-mono text-white">{hydraulicPressure}</span>
            <span className="text-xs font-mono text-slate-400">BAR</span>
          </div>
          <div className="w-full bg-cat-surface h-2 rounded-full overflow-hidden border border-cat-border mt-3">
            <div 
              className={`h-full transition-all duration-700 ${
                hydraulicPressure > 320 ? 'bg-amber-500' : 'bg-emerald-400'
              }`}
              style={{ width: `${(hydraulicPressure / 350) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>0 BAR</span>
            <span>280 RELIEF</span>
            <span>350 MAX</span>
          </div>
        </div>

        {/* Gauge 3: Fuel Consumption Burn Rate */}
        <div className="hud-panel-active rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-cat-yellow" /> Fuel Flow Rate
            </span>
            <span className="text-[10px] font-mono bg-cat-surface px-2 py-0.5 rounded border border-cat-border text-slate-300">
              C9.3B DIESEL
            </span>
          </div>
          <div className="flex items-baseline space-x-2 my-2">
            <span className="text-3xl font-black font-mono text-white">{fuelRate}</span>
            <span className="text-xs font-mono text-slate-400">L / HR</span>
          </div>
          <div className="w-full bg-cat-surface h-2 rounded-full overflow-hidden border border-cat-border mt-3">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 via-cat-yellow to-amber-500 transition-all duration-700"
              style={{ width: `${(fuelRate / 22) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
            <span>3.5 IDLE</span>
            <span>14.5 AVG</span>
            <span>22.0 PEAK</span>
          </div>
        </div>

        {/* Gauge 4: Digital Inclinometer & Stability */}
        <div className="hud-panel-active rounded-xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-cat-yellow" /> Inclinometer
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
              pitchAngle > 15 || rollAngle > 15 
                ? 'bg-rose-950 text-rose-300 border-rose-500 animate-pulse' 
                : 'bg-cat-surface text-emerald-400 border-cat-border'
            }`}>
              {pitchAngle > 15 ? 'TIP WARNING' : 'STABLE'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 my-2">
            <div className="bg-cat-surface p-2 rounded-lg border border-cat-border">
              <span className="text-[10px] text-slate-400 font-mono">PITCH:</span>
              <div className="text-xl font-bold font-mono text-white">+{pitchAngle}°</div>
            </div>
            <div className="bg-cat-surface p-2 rounded-lg border border-cat-border">
              <span className="text-[10px] text-slate-400 font-mono">ROLL:</span>
              <div className="text-xl font-bold font-mono text-white">{rollAngle}°</div>
            </div>
          </div>
          <div className="text-[10px] font-mono text-slate-400 text-center">
            Max Permissible Slope: 18.0°
          </div>
        </div>
      </div>

      {/* Control Console Strip: Engine Mode, Load Cycle Increment, Telemetry Controls */}
      <div className="hud-panel rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-cat-border">
        {/* Left: Engine Mode selector */}
        <div className="flex items-center space-x-3">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-cat-yellow" /> THROTTLE MODE:
          </span>
          <div className="inline-flex rounded-lg p-1 bg-cat-black border border-cat-border">
            <button
              onClick={() => handleModeChange('ECO')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                engineMode === 'ECO'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ECO SAVE (-18% Fuel)
            </button>
            <button
              onClick={() => handleModeChange('STANDARD')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                engineMode === 'STANDARD'
                  ? 'bg-cat-yellow text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              STANDARD WORK
            </button>
            <button
              onClick={() => handleModeChange('HEAVY_POWER')}
              className={`px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
                engineMode === 'HEAVY_POWER'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              POWER PLUS (+20% Force)
            </button>
          </div>
        </div>

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={triggerCycleCount}
            className="flex items-center space-x-2 px-3.5 py-1.5 rounded-lg bg-cat-surface hover:bg-cat-card text-cat-yellow border border-cat-yellow/40 text-xs font-mono font-bold shadow transition-all active:scale-95"
            title="Register completed truck loading / bucket dump cycle"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>+1 LOAD CYCLE ({currentCycles})</span>
          </button>

          <button
            onClick={() => setIsSimulatingLoad(!isSimulatingLoad)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cat-surface hover:bg-cat-card text-slate-300 border border-cat-border text-xs font-mono"
          >
            {isSimulatingLoad ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isSimulatingLoad ? 'Telemetry Active' : 'Paused'}</span>
          </button>

          <button
            onClick={onOpenRadar}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cat-yellow text-black font-bold text-xs hover:bg-cat-gold shadow-md shadow-cat-yellow/20 font-mono"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>OPEN 360° RADAR</span>
          </button>
        </div>
      </div>

      {/* Live Auxiliary Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-cat-surface/80 p-3 rounded-lg border border-cat-border flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">COOLANT TEMP</div>
            <div className="text-lg font-bold font-mono text-slate-100">{coolantTemp.toFixed(1)}°C</div>
          </div>
          <div className="text-emerald-400 text-xs font-mono">NORMAL</div>
        </div>

        <div className="bg-cat-surface/80 p-3 rounded-lg border border-cat-border flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">LOAD CYCLES (SHIFT)</div>
            <div className="text-lg font-bold font-mono text-cat-yellow">{currentCycles} CYCLES</div>
          </div>
          <Layers className="w-4 h-4 text-cat-yellow/60" />
        </div>

        <div className="bg-cat-surface/80 p-3 rounded-lg border border-cat-border flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">IDLE TIMER (CURRENT)</div>
            <div className={`text-lg font-bold font-mono ${liveIdlingMinutes > 30 ? 'text-amber-400' : 'text-slate-100'}`}>
              {liveIdlingMinutes} MIN
            </div>
          </div>
          <Timer className="w-4 h-4 text-slate-400" />
        </div>

        <div className="bg-cat-surface/80 p-3 rounded-lg border border-cat-border flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-400 font-mono">DEF FLUID LEVEL</div>
            <div className="text-lg font-bold font-mono text-cyan-400">88% (42 L)</div>
          </div>
          <div className="text-cyan-400 text-xs font-mono">OK</div>
        </div>
      </div>
    </div>
  );
};
