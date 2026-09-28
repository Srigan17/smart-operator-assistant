import React, { useState } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  FileText, 
  Plus, 
  CheckCircle, 
  MapPin, 
  Bell, 
  Radio,
  Send,
  Eye
} from 'lucide-react';
import { HazardObject, IncidentReport, WeatherType } from '../../types';
import { ProximityRadar } from './ProximityRadar';
import { audioService } from '../../services/audioService';

interface SafetySuiteProps {
  seatbeltFastened: boolean;
  setSeatbeltFastened: (fastened: boolean) => void;
  hazards: HazardObject[];
  onAddHazard: (hazard: HazardObject) => void;
  onRemoveHazard: (id: string) => void;
  incidents: IncidentReport[];
  onAddIncident: (incident: IncidentReport) => void;
}

export const SafetySuite: React.FC<SafetySuiteProps> = ({
  seatbeltFastened,
  setSeatbeltFastened,
  hazards,
  onAddHazard,
  onRemoveHazard,
  incidents,
  onAddIncident
}) => {
  const [showLogModal, setShowLogModal] = useState(false);
  const [incidentCategory, setIncidentCategory] = useState<IncidentReport['category']>('Near Miss Proximity');
  const [severity, setSeverity] = useState<IncidentReport['severity']>('Medium');
  const [description, setDescription] = useState('');
  const [notifySupervisor, setNotifySupervisor] = useState(true);

  const handleSeatbeltToggle = () => {
    const next = !seatbeltFastened;
    setSeatbeltFastened(next);
    audioService.playSeatbeltChime(next);
    if (!next) {
      audioService.playWarningAlarm();
      audioService.speakVoice('Warning: Seatbelt sensor triggered unlatched.');
    } else {
      audioService.speakVoice('Seatbelt buckled. Safety compliance verified.');
    }
  };

  const handleSubmitIncident = (e: React.FormEvent) => {
    e.preventDefault();
    const newInc: IncidentReport = {
      id: `INC-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      category: incidentCategory,
      severity,
      description: description || `${incidentCategory} logged by OP1001 during active shift.`,
      operatorId: 'OP1001',
      machineId: 'EXC001',
      locationCoords: '37.7749° N, 122.4194° W (Sector 4)',
      weather: 'Sunny',
      status: 'Open',
      supervisorNotified: notifySupervisor,
      actionTaken: notifySupervisor ? 'Instant SMS broadcast sent to Site Safety Lead.' : 'Logged in black-box telematics.'
    };

    onAddIncident(newInc);
    setShowLogModal(false);
    setDescription('');
    audioService.playHydraulicClick();
    audioService.speakVoice(`Incident ${newInc.id} logged and reported.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Seatbelt Interlock State */}
        <div className={`hud-panel-active rounded-xl p-4 border transition-all ${
          seatbeltFastened ? 'border-emerald-500/40' : 'border-rose-500 bg-rose-950/40'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">CABIN SAFETY HARNESS</span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              seatbeltFastened ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-rose-950 text-rose-300 border border-rose-500 animate-pulse'
            }`}>
              {seatbeltFastened ? 'COMPLIANT' : 'NON-COMPLIANT'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShieldAlert className={`w-6 h-6 ${seatbeltFastened ? 'text-emerald-400' : 'text-rose-400 animate-bounce'}`} />
              <div>
                <div className="text-base font-bold text-white font-mono">
                  {seatbeltFastened ? 'FASTENED & SECURE' : 'UNFASTENED (HAZARD)'}
                </div>
                <div className="text-[11px] text-slate-400">
                  {seatbeltFastened ? 'Hydraulics unlocked' : 'Joy-lock throttled to idle'}
                </div>
              </div>
            </div>
            <button
              onClick={handleSeatbeltToggle}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                seatbeltFastened 
                  ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-black shadow-lg shadow-emerald-500/30'
              }`}
            >
              {seatbeltFastened ? 'UNBUCKLE' : 'LATCH NOW'}
            </button>
          </div>
        </div>

        {/* Card 2: Proximity Radar Status */}
        <div className="hud-panel-active rounded-xl p-4 border border-cat-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">360° SENTINEL SENSORS</span>
            <span className="text-[10px] font-mono bg-cat-surface px-2 py-0.5 rounded text-cat-yellow border border-cat-yellow/30">
              4 RADARS ACTIVE
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white font-mono">{hazards.length} OBJECTS DETECTED</div>
              <div className="text-[11px] text-slate-400">Blindspot cone active (120°-170°)</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-cat-surface border border-cat-border flex items-center justify-center text-cat-yellow">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Card 3: Safety Incidents Recorded */}
        <div className="hud-panel-active rounded-xl p-4 border border-cat-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-slate-400">SHIFT INCIDENT LOGS</span>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-[10px] font-mono bg-cat-yellow text-black font-bold px-2 py-0.5 rounded hover:bg-cat-gold flex items-center gap-1"
            >
              <Plus className="w-3 h-3" /> LOG INCIDENT
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-base font-bold text-white font-mono">{incidents.length} LOGGED TODAY</div>
              <div className="text-[11px] text-emerald-400 font-mono">
                {incidents.filter(i => i.status === 'Resolved').length} Resolved • {incidents.filter(i => i.status !== 'Resolved').length} Open
              </div>
            </div>
            <FileText className="w-6 h-6 text-slate-400" />
          </div>
        </div>
      </div>

      {/* Main 360 Proximity Radar Canvas Section */}
      <ProximityRadar
        hazards={hazards}
        onAddHazard={onAddHazard}
        onRemoveHazard={onRemoveHazard}
      />

      {/* Incident History & Logging Feed Table */}
      <div className="hud-panel rounded-xl p-6 border border-cat-border space-y-4">
        <div className="flex items-center justify-between border-b border-cat-border pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-cat-yellow" /> Safety Incident Log & Blackbox Feed
            </h3>
            <p className="text-xs text-slate-400">
              Complete audit trail of proximity warnings, seatbelt non-compliance, and excessive machine strain.
            </p>
          </div>

          <button
            onClick={() => setShowLogModal(true)}
            className="px-3.5 py-1.5 bg-cat-surface hover:bg-cat-card text-cat-yellow border border-cat-yellow/40 text-xs font-mono font-bold rounded-lg flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> + New Incident Report
          </button>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-cat-black/80 text-slate-400 border-b border-cat-border uppercase text-[10px]">
                <th className="p-3">Incident ID</th>
                <th className="p-3">Timestamp</th>
                <th className="p-3">Category</th>
                <th className="p-3">Severity</th>
                <th className="p-3">Description & Action</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cat-border/40">
              {incidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-cat-surface/50 transition-colors">
                  <td className="p-3 font-bold text-cat-yellow">{inc.id}</td>
                  <td className="p-3 text-slate-400">{inc.timestamp}</td>
                  <td className="p-3 text-white font-semibold">{inc.category}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.severity === 'Critical' ? 'bg-rose-950 text-rose-300 border border-rose-500' :
                      inc.severity === 'High' ? 'bg-amber-950 text-amber-300 border border-amber-500' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300 max-w-md">
                    <div>{inc.description}</div>
                    {inc.actionTaken && (
                      <div className="text-[10px] text-emerald-400 mt-0.5 font-sans">
                        ✓ {inc.actionTaken}
                      </div>
                    )}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inc.status === 'Resolved' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40' :
                      'text-amber-300 bg-amber-950/60 border border-amber-500/40'
                    }`}>
                      {inc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Incident Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-cat-surface border-2 border-cat-yellow rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-cat-border pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-cat-yellow" /> Log Safety Incident or Near Miss
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitIncident} className="space-y-3.5">
              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Incident Category</label>
                <select
                  value={incidentCategory}
                  onChange={(e) => setIncidentCategory(e.target.value as IncidentReport['category'])}
                  className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                >
                  <option value="Near Miss Proximity">Near Miss Proximity (Pedestrian / Vehicle)</option>
                  <option value="Unfastened Seatbelt">Unfastened Seatbelt in Operation</option>
                  <option value="Excessive Idling">Excessive Idling &gt; 45 mins</option>
                  <option value="Extreme Slope / Tilt">Extreme Slope / Tilt Rollover Warning</option>
                  <option value="Hydraulic Surge">Hydraulic Surge / Main Relief Spike</option>
                  <option value="Ground Collision">Ground Collision / Trench Slump</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Severity Level</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['Low', 'Medium', 'High', 'Critical'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                        severity === s
                          ? 'bg-cat-yellow text-black font-bold border-cat-yellow'
                          : 'bg-cat-black text-slate-400 border-cat-border'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-300 block mb-1">Description & Field Observations</label>
                <textarea
                  rows={3}
                  placeholder="Describe working conditions, personnel involved, and immediate corrective steps..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-cat-black border border-cat-border rounded-lg px-3 py-2 text-sm text-white focus:border-cat-yellow focus:outline-none"
                  required
                />
              </div>

              <div className="p-3 bg-cat-black/70 rounded-lg border border-cat-border text-[11px] font-mono text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span>GPS Telemetry:</span>
                  <span className="text-slate-200">37.7749° N, 122.4194° W</span>
                </div>
                <div className="flex justify-between">
                  <span>Machine ID / Hours:</span>
                  <span className="text-slate-200">EXC001 / 1530.2 hrs</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="notifySup"
                  checked={notifySupervisor}
                  onChange={(e) => setNotifySupervisor(e.target.checked)}
                  className="rounded accent-cat-yellow w-4 h-4 cursor-pointer"
                />
                <label htmlFor="notifySup" className="text-xs text-slate-300 cursor-pointer">
                  Send high-priority alert to Site Safety Supervisor via radio / SMS
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-cat-border">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 bg-cat-surface hover:bg-cat-card text-slate-300 text-xs font-mono rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cat-yellow hover:bg-cat-gold text-black font-bold text-xs font-mono rounded-lg shadow-md shadow-cat-yellow/20 flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Incident Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
