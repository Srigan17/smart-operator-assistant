import React, { useState, useEffect } from 'react';
import { 
  Radio, 
  AlertOctagon, 
  PhoneCall, 
  Flame, 
  MapPin, 
  ShieldAlert, 
  X,
  CheckCircle2
} from 'lucide-react';
import { audioService } from '../../services/audioService';

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SosModal: React.FC<SosModalProps> = ({ isOpen, onClose }) => {
  const [dispatched, setDispatched] = useState(false);
  const [selectedEmergency, setSelectedEmergency] = useState<string>('Machine Rollover / Slope Collapse');

  useEffect(() => {
    if (isOpen) {
      audioService.playWarningAlarm();
      audioService.speakVoice('Emergency SOS beacon active. Transmitting site coordinates.');
    }
  }, [isOpen]);

  const handleDispatch = (category: string) => {
    setSelectedEmergency(category);
    setDispatched(true);
    audioService.playWarningAlarm();
    audioService.speakVoice(`Emergency priority broadcast dispatched: ${category}. Emergency crews alerted.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#181111] border-4 border-rose-600 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-pulse-slow">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-rose-800/80 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white animate-bounce shadow-lg shadow-rose-600/50">
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white font-mono tracking-wider flex items-center gap-2">
                EMERGENCY SATELLITE SOS
              </h2>
              <p className="text-xs text-rose-300 font-mono">
                CAT SATELLITE SAFETY BROADCAST • EXC001 (OP1001)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg font-mono text-sm"
          >
            ✕
          </button>
        </div>

        {/* Live GPS Coordinates and Machine Telemetry */}
        <div className="bg-rose-950/60 p-4 rounded-xl border border-rose-700/60 text-xs font-mono text-rose-200 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-rose-300 font-bold">
              <MapPin className="w-4 h-4 text-rose-400" /> SITE GPS COORDINATES:
            </span>
            <span className="text-white font-black">37.7749° N, 122.4194° W</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Machine Status:</span>
            <span className="text-rose-300 font-bold">EXC001 (Hydraulic Lock Engaged)</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>Satellite Uplink:</span>
            <span className="text-emerald-400 font-bold">ACTIVE (Iridium Network)</span>
          </div>
        </div>

        {/* Emergency Type Dispatch Buttons */}
        {!dispatched ? (
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-300 uppercase">
              Select Immediate Hazard Condition:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                { title: 'Machine Rollover / Slope Tip', desc: 'Cabin tilt failure or trench wall collapse' },
                { title: 'Medical Emergency', desc: 'Operator injury or sudden health issue' },
                { title: 'Utility / Gas Pipe Strike', desc: 'High voltage or flammable line rupture' },
                { title: 'Site Fire / Evacuation', desc: 'Immediate site clear siren trigger' },
              ].map((em) => (
                <button
                  key={em.title}
                  onClick={() => handleDispatch(em.title)}
                  className="p-3 bg-rose-900/40 hover:bg-rose-700 text-left rounded-xl border border-rose-600 transition-all text-xs group active:scale-95"
                >
                  <div className="font-bold text-white font-mono group-hover:text-yellow-300">{em.title}</div>
                  <div className="text-[10px] text-rose-300 font-sans mt-0.5">{em.desc}</div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-emerald-950/60 border-2 border-emerald-500 rounded-2xl p-5 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-base font-bold text-white font-mono">
              SOS DISPATCH CONFIRMED: {selectedEmergency}
            </h3>
            <p className="text-xs text-emerald-200">
              Site Safety Response Unit and Field Paramedics have been alerted with live machine GPS. Stay inside the ROPS protected cabin.
            </p>
          </div>
        )}

        {/* Action Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-rose-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono rounded-xl"
          >
            Cancel / False Alarm
          </button>

          <a
            href="tel:911"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs font-mono rounded-xl shadow-lg flex items-center gap-2"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" /> CALL SITE DISPATCH (911)
          </a>
        </div>
      </div>
    </div>
  );
};
