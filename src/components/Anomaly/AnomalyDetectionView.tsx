import React, { useState } from 'react';
import { 
  LineChart, 
  AlertTriangle, 
  Clock, 
  Fuel, 
  TrendingDown, 
  DollarSign, 
  RotateCw, 
  ShieldAlert, 
  CheckCircle2, 
  Layers, 
  Radio,
  Zap,
  Activity
} from 'lucide-react';
import { TelemetryRecord } from '../../types';
import { detectTelemetryAnomalies, analyzeFleetTelematics, TelemetryAnomaly } from '../../services/anomalyService';
import { audioService } from '../../services/audioService';

interface AnomalyDetectionViewProps {
  telemetryLogs: TelemetryRecord[];
  onAddTelemetryRecord: (record: TelemetryRecord) => void;
}

export const AnomalyDetectionView: React.FC<AnomalyDetectionViewProps> = ({
  telemetryLogs,
  onAddTelemetryRecord
}) => {
  const [selectedRecord, setSelectedRecord] = useState<TelemetryRecord | null>(null);

  // Compute fleet telemetry summary
  const fleetSummary = analyzeFleetTelematics(telemetryLogs);

  // Collect all anomalies
  const allAnomalies: TelemetryAnomaly[] = telemetryLogs.flatMap(r => detectTelemetryAnomalies(r));

  // Simulate a new live anomaly event
  const handleSimulateExcessiveIdle = () => {
    const newRecord: TelemetryRecord = {
      id: `LOG-00${telemetryLogs.length + 1}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      machineId: 'EXC001',
      operatorId: 'OP1001',
      engineHours: Number((1530.2 + telemetryLogs.length * 0.8).toFixed(1)),
      fuelUsedLiters: 4.5,
      loadCycles: 0,
      idlingTimeMin: 58,
      seatbeltStatus: 'Unfastened',
      safetyAlertTriggered: 'Yes',
      alertReason: 'Excessive Idling (58 min) without hydraulic actuation & Seatbelt unlatched',
      hydraulicPressureBar: 110,
      engineRpm: 850,
      coolantTempC: 92,
      tiltAngleDeg: 1.5,
      fuelRateLph: 3.8,
    };

    onAddTelemetryRecord(newRecord);
    audioService.playWarningAlarm();
    audioService.speakVoice('Anomaly detected: Engine idle exceeded 50 minutes with seatbelt unlatched.');
  };

  const handleSimulateHydraulicSurge = () => {
    const newRecord: TelemetryRecord = {
      id: `LOG-00${telemetryLogs.length + 1}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      machineId: 'EXC001',
      operatorId: 'OP1001',
      engineHours: Number((1530.2 + telemetryLogs.length * 0.8).toFixed(1)),
      fuelUsedLiters: 7.2,
      loadCycles: 15,
      idlingTimeMin: 10,
      seatbeltStatus: 'Fastened',
      safetyAlertTriggered: 'Yes',
      alertReason: 'Hydraulic Pressure Overload Surge (342 BAR) & Rapid Slew Brake Shock',
      hydraulicPressureBar: 342,
      engineRpm: 2150,
      coolantTempC: 96,
      tiltAngleDeg: 8.4,
      fuelRateLph: 18.2,
    };

    onAddTelemetryRecord(newRecord);
    audioService.playWarningAlarm();
    audioService.speakVoice('Hydraulic overpressure spike recorded. Telemetry flag created.');
  };

  return (
    <div className="space-y-6">
      {/* Top Executive Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Fuel & Idle Waste */}
        <div className="hud-panel-active rounded-xl p-5 border border-cat-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase flex items-center gap-1.5">
              <Fuel className="w-4 h-4 text-cat-yellow" /> Total Diesel Consumed
            </span>
            <span className="text-[10px] font-mono text-emerald-400">LOGGED</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mb-1">
            {fleetSummary.totalFuel} LITERS
          </div>
          <div className="text-xs font-mono text-slate-400">
            Across {telemetryLogs.length} logged shift intervals
          </div>
        </div>

        {/* Idling Fuel Drain Penalty */}
        <div className="hud-panel-active rounded-xl p-5 border border-amber-500/40 bg-amber-950/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase flex items-center gap-1.5 text-amber-300">
              <Clock className="w-4 h-4 text-amber-400" /> Idling Loss Waste
            </span>
            <span className="text-[10px] font-mono text-rose-400 font-bold">COST PENALTY</span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-300 mb-1">
            ${fleetSummary.estimatedWastedCostUsd} USD
          </div>
          <div className="text-xs font-mono text-slate-300">
            {fleetSummary.totalIdleMinutes} min idle ({fleetSummary.estimatedWastedFuelLiters} L wasted)
          </div>
        </div>

        {/* Safety Alert Violations */}
        <div className="hud-panel-active rounded-xl p-5 border border-rose-500/40 bg-rose-950/20">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase flex items-center gap-1.5 text-rose-300">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Safety Alerts Triggered
            </span>
            <span className="text-[10px] font-mono text-rose-400 font-bold">{fleetSummary.alertCount} ALERTS</span>
          </div>
          <div className="text-2xl font-black font-mono text-white mb-1">
            {fleetSummary.unfastenedCount} SEATBELT VIOLATIONS
          </div>
          <div className="text-xs font-mono text-slate-300">
            2 critical idle &gt;50m spikes logged
          </div>
        </div>

        {/* Telematics Fleet Safety Score */}
        <div className="hud-panel-active rounded-xl p-5 border border-cat-border">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono font-semibold uppercase flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-cat-yellow" /> Operator Safety Index
            </span>
            <span className="text-[10px] font-mono text-cat-yellow font-bold">CAT TELEMATICS</span>
          </div>
          <div className="text-2xl font-black font-mono text-cat-yellow mb-1">
            {fleetSummary.safetyScore} / 100
          </div>
          <div className="w-full bg-cat-surface h-1.5 rounded-full overflow-hidden border border-cat-border mt-2">
            <div 
              className="h-full bg-cat-yellow transition-all duration-500"
              style={{ width: `${fleetSummary.safetyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Interactive Anomaly Trigger Testing Controls */}
      <div className="hud-panel rounded-xl p-4 border border-cat-border flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
            <Zap className="w-4 h-4 text-cat-yellow" /> Telematics Simulation & Anomaly Test Suite
          </h4>
          <p className="text-[11px] text-slate-400">
            Inject synthetic machinery behavior events to test CAT Sentinel's automatic pattern recognition engine.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSimulateExcessiveIdle}
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 text-xs font-mono font-bold rounded-lg transition-all"
          >
            + Simulate 58m Idle Spike
          </button>
          <button
            onClick={handleSimulateHydraulicSurge}
            className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/50 text-xs font-mono font-bold rounded-lg transition-all"
          >
            + Simulate 342 Bar Surge
          </button>
        </div>
      </div>

      {/* Detected Anomalies List */}
      <div className="hud-panel rounded-xl p-6 border border-cat-border space-y-4">
        <div className="flex items-center justify-between border-b border-cat-border pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-cat-yellow" /> Active Behavioral Anomaly Triage ({allAnomalies.length})
            </h3>
            <p className="text-xs text-slate-400">
              Automatic identification of excessive idling, aggressive joystick actuation, and safety protocol breaches.
            </p>
          </div>
          <span className="text-xs font-mono text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded border border-rose-500/40 font-bold">
            ACTION REQUIRED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allAnomalies.map((anom) => (
            <div
              key={anom.id}
              className={`p-4 rounded-xl border text-xs font-mono space-y-2.5 transition-all ${
                anom.severity === 'CRITICAL'
                  ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-950/30'
                  : 'bg-amber-950/30 border-amber-500/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    anom.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-black'
                  }`}>
                    {anom.severity}
                  </span>
                  <span className="font-bold text-white text-sm">{anom.title}</span>
                </div>
                <span className="text-slate-400 text-[10px]">{anom.timestamp}</span>
              </div>

              <p className="text-slate-300 font-sans text-xs">{anom.description}</p>

              <div className="grid grid-cols-2 gap-2 bg-cat-black/60 p-2 rounded-lg border border-cat-border/40 text-[11px]">
                <div>
                  <span className="text-slate-400">Recorded Metric:</span>
                  <div className="text-rose-400 font-bold">{anom.metricValue}</div>
                </div>
                <div>
                  <span className="text-slate-400">Allowable Target:</span>
                  <div className="text-emerald-400 font-bold">{anom.threshold}</div>
                </div>
              </div>

              {anom.financialImpact && (
                <div className="text-[11px] text-amber-300 font-sans">
                  💰 <span className="font-semibold">Financial & Carbon Impact:</span> {anom.financialImpact}
                </div>
              )}

              <div className="p-2 bg-cat-surface/80 rounded border border-cat-border text-[11px] text-slate-300 font-sans flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-cat-yellow">Recommendation:</strong> {anom.recommendation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Raw Telemetry Log Table (Exact Table 1 from Problem Spec) */}
      <div className="hud-panel rounded-xl p-6 border border-cat-border space-y-4">
        <div className="flex items-center justify-between border-b border-cat-border pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cat-yellow" /> Machine Telemetry Log Stream (Assignment Table 1)
            </h3>
            <p className="text-xs text-slate-400">
              Live CAN-bus telematics stream from CAT 336 on-board ECM.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">MACHINE: EXC001</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-cat-black text-slate-400 border-b border-cat-border uppercase text-[10px]">
                <th className="p-3">Timestamp</th>
                <th className="p-3">Machine ID</th>
                <th className="p-3">Operator ID</th>
                <th className="p-3">Engine Hours</th>
                <th className="p-3">Fuel Used (L)</th>
                <th className="p-3">Load Cycles</th>
                <th className="p-3">Idling Time (min)</th>
                <th className="p-3">Seatbelt Status</th>
                <th className="p-3">Safety Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cat-border/40">
              {telemetryLogs.map((log) => {
                const isAlert = log.safetyAlertTriggered === 'Yes';
                const isExcessiveIdle = log.idlingTimeMin >= 50;

                return (
                  <tr 
                    key={log.id} 
                    className={`transition-colors ${
                      isAlert ? 'bg-rose-950/20 hover:bg-rose-950/40' : 'hover:bg-cat-surface/60'
                    }`}
                  >
                    <td className="p-3 text-slate-300 font-bold">{log.timestamp}</td>
                    <td className="p-3 text-cat-yellow font-bold">{log.machineId}</td>
                    <td className="p-3 text-slate-300">{log.operatorId}</td>
                    <td className="p-3 text-white font-bold">{log.engineHours} hrs</td>
                    <td className="p-3 text-slate-200">{log.fuelUsedLiters} L</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-cat-surface text-slate-100 font-bold border border-cat-border">
                        {log.loadCycles}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded font-bold ${
                        isExcessiveIdle ? 'bg-amber-950 text-amber-300 border border-amber-500 animate-pulse' : 'text-slate-300'
                      }`}>
                        {log.idlingTimeMin} min
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.seatbeltStatus === 'Fastened' ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-500/40' :
                        'text-rose-400 bg-rose-950/60 border border-rose-500/50 animate-pulse'
                      }`}>
                        {log.seatbeltStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isAlert ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {log.safetyAlertTriggered}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
