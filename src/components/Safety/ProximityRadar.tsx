import React, { useState, useEffect, useRef } from 'react';
import { 
  Compass, 
  AlertTriangle, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  User, 
  Truck, 
  Zap, 
  Radio,
  Plus,
  RefreshCw
} from 'lucide-react';
import { HazardObject } from '../../types';
import { audioService } from '../../services/audioService';

interface ProximityRadarProps {
  hazards: HazardObject[];
  onAddHazard: (hazard: HazardObject) => void;
  onRemoveHazard: (id: string) => void;
}

export const ProximityRadar: React.FC<ProximityRadarProps> = ({
  hazards,
  onAddHazard,
  onRemoveHazard
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeHazards, setActiveHazards] = useState<HazardObject[]>(hazards);
  const [selectedHazard, setSelectedHazard] = useState<HazardObject | null>(null);
  const [cabAngle, setCabAngle] = useState(0); // 0 - 360 degrees
  const [isAutoScanning, setIsAutoScanning] = useState(true);

  // Sync external hazards
  useEffect(() => {
    setActiveHazards(hazards);
  }, [hazards]);

  // Radar Animation & Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let sweepAngle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 20;

      // Clear canvas
      ctx.fillStyle = '#0f1115';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid / Radar rings
      const rings = [0.25, 0.5, 0.75, 1.0];
      rings.forEach((rRatio, idx) => {
        const r = radius * rRatio;
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
        ctx.strokeStyle = idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#334155';
        ctx.lineWidth = idx === 0 ? 1.5 : 1;
        ctx.setLineDash(idx < 2 ? [4, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Ring distance text (e.g. 5m, 10m, 20m, 30m)
        ctx.fillStyle = '#64748b';
        ctx.font = '10px JetBrains Mono, monospace';
        const distLabel = `${Math.round(rRatio * 30)}m`;
        ctx.fillText(distLabel, centerX + 5, centerY - r + 12);
      });

      // Draw Crosshairs
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - radius);
      ctx.lineTo(centerX, centerY + radius);
      ctx.moveTo(centerX - radius, centerY);
      ctx.lineTo(centerX + radius, centerY);
      ctx.stroke();

      // Blind Spot Cone (Excavator Right-Rear Blind Quadrant: ~120° to 170°)
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, (110 * Math.PI) / 180, (170 * Math.PI) / 180);
      ctx.closePath();
      ctx.fillStyle = 'rgba(239, 68, 68, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.stroke();

      // Radar Sweep Cone
      if (isAutoScanning) {
        sweepAngle = (sweepAngle + 0.035) % (2 * Math.PI);
        const grad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        grad.addColorStop(0, 'rgba(255, 205, 17, 0.25)');
        grad.addColorStop(1, 'rgba(255, 205, 17, 0.0)');

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, sweepAngle - 0.3, sweepAngle);
        ctx.closePath();
        ctx.fillStyle = grad;
        ctx.fill();

        // Sweep line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + radius * Math.cos(sweepAngle),
          centerY + radius * Math.sin(sweepAngle)
        );
        ctx.strokeStyle = '#ffcd11';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Draw Center Machine (CAT 336 Excavator Top-Down representation)
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate((cabAngle * Math.PI) / 180);

      // Tracks
      ctx.fillStyle = '#27272a';
      ctx.fillRect(-18, -26, 8, 52); // Left track
      ctx.fillRect(10, -26, 8, 52);  // Right track
      ctx.strokeStyle = '#52525b';
      ctx.strokeRect(-18, -26, 8, 52);
      ctx.strokeRect(10, -26, 8, 52);

      // Main Cab Body (CAT Yellow)
      ctx.fillStyle = '#ffcd11';
      ctx.fillRect(-11, -18, 22, 36);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-11, -18, 22, 36);

      // Glass Cockpit Window (Cyan tint)
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-8, -15, 16, 12);

      // Excavator Boom sticking forward
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-3, -40, 6, 25);
      ctx.fillStyle = '#475569';
      ctx.fillRect(-4, -46, 8, 7); // Bucket tip

      ctx.restore();

      // Draw Hazard Objects
      let criticalFound = false;

      activeHazards.forEach((h) => {
        // Map x, y (-30m to +30m) to canvas coordinates
        const scale = radius / 30;
        const hCanvasX = centerX + h.x * scale;
        const hCanvasY = centerY - h.y * scale; // invert Y for screen coords

        // Calculate dynamic distance
        const dist = Math.sqrt(h.x * h.x + h.y * h.y);
        const isCritical = dist < 8;
        const isWarning = dist >= 8 && dist < 16;

        if (isCritical) criticalFound = true;

        // Pulse ring around hazard
        ctx.beginPath();
        ctx.arc(hCanvasX, hCanvasY, isCritical ? 14 : isWarning ? 10 : 7, 0, 2 * Math.PI);
        ctx.fillStyle = isCritical ? 'rgba(239, 68, 68, 0.35)' : isWarning ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.2)';
        ctx.fill();
        ctx.strokeStyle = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#3b82f6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Icon marker
        ctx.fillStyle = isCritical ? '#ef4444' : isWarning ? '#f59e0b' : '#38bdf8';
        ctx.beginPath();
        ctx.arc(hCanvasX, hCanvasY, 4, 0, 2 * Math.PI);
        ctx.fill();

        // Label text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText(`${h.name.split(' ')[0]} (${dist.toFixed(1)}m)`, hCanvasX + 8, hCanvasY + 3);
      });

      // Sound trigger on critical proximity
      if (criticalFound && Math.random() < 0.05) {
        audioService.playProximityBlip(true);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [activeHazards, cabAngle, isAutoScanning]);

  // Click on radar to position or add worker
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    // Convert to meters
    const scale = radius / 30;
    const meterX = Number(((clickX - centerX) / scale).toFixed(1));
    const meterY = Number(((centerY - clickY) / scale).toFixed(1));
    const dist = Number(Math.sqrt(meterX * meterX + meterY * meterY).toFixed(1));

    if (dist > 32) return; // outside radar ring

    const newWorker: HazardObject = {
      id: `HZ-${Date.now()}`,
      name: `Ground Worker #${activeHazards.length + 1}`,
      type: 'pedestrian',
      x: meterX,
      y: meterY,
      distance: dist,
      angle: Math.round((Math.atan2(meterY, meterX) * 180) / Math.PI),
      dangerLevel: dist < 8 ? 'critical' : dist < 16 ? 'warning' : 'safe',
      speed: 1.0,
    };

    onAddHazard(newWorker);
    audioService.playProximityBlip(dist < 8);
    if (dist < 8) {
      audioService.speakVoice(`Proximity Alert! Hazard detected within ${dist} meters.`);
    }
  };

  const criticalHazards = activeHazards.filter(h => Math.sqrt(h.x * h.x + h.y * h.y) < 8);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Interactive Radar Canvas */}
      <div className="lg:col-span-2 hud-panel-active rounded-xl p-6 border border-cat-border space-y-4">
        {/* Radar Controls Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cat-border pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-5 h-5 text-cat-yellow animate-spin-slow" /> 360° Ultrasonic Sentinel Radar
            </h3>
            <p className="text-xs text-slate-400">
              Interactive 30-meter proximity perimeter. Click anywhere on the radar to deploy ground obstacle / worker.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCabAngle(a => (a + 45) % 360)}
              className="px-2.5 py-1 bg-cat-surface hover:bg-cat-card text-cat-yellow border border-cat-border text-xs font-mono rounded flex items-center gap-1"
              title="Swing Excavator Cab by 45°"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Swing Cab ({cabAngle}°)
            </button>
            <button
              onClick={() => setIsAutoScanning(!isAutoScanning)}
              className="px-2.5 py-1 bg-cat-surface hover:bg-cat-card text-slate-300 border border-cat-border text-xs font-mono rounded"
            >
              {isAutoScanning ? 'Sweep: ON' : 'Sweep: OFF'}
            </button>
          </div>
        </div>

        {/* Critical Alarm Banner if Hazard within 8m */}
        {criticalHazards.length > 0 && (
          <div className="bg-rose-950 border-2 border-rose-500 rounded-xl p-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-3">
              <ShieldAlert className="w-6 h-6 text-rose-400 animate-bounce" />
              <div>
                <span className="text-xs font-black text-white tracking-wider">
                  COLLISION PROXIMITY HAZARD (&lt; 8M)
                </span>
                <p className="text-[11px] text-rose-200">
                  {criticalHazards.length} object(s) in swing radius! Automatic swing interlock brake active.
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 bg-rose-600 text-white font-mono text-[10px] font-bold rounded">
              AUTO-LOCK
            </span>
          </div>
        )}

        {/* Radar Canvas Container */}
        <div className="relative flex items-center justify-center bg-[#0d0e12] rounded-xl p-4 border border-cat-border/80">
          <canvas
            ref={canvasRef}
            width={440}
            height={440}
            onClick={handleCanvasClick}
            className="rounded-full border-2 border-cat-border cursor-crosshair shadow-2xl max-w-full"
          />

          {/* Overlay Legend */}
          <div className="absolute bottom-6 left-6 bg-cat-black/90 p-2.5 rounded-lg border border-cat-border text-[10px] font-mono space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-slate-300">&lt; 8m Critical Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="text-slate-300">8-15m Warning Zone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-slate-300">&gt; 15m Safe Zone</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Col: Active Hazard Objects & Blind Spot Analysis */}
      <div className="hud-panel rounded-xl p-5 border border-cat-border space-y-4 flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-cat-border pb-2">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cat-yellow" /> Detected Objects ({activeHazards.length})
            </h4>
            <span className="text-[10px] font-mono text-slate-400">RANGE 30M</span>
          </div>

          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {activeHazards.map((h) => {
              const dist = Math.sqrt(h.x * h.x + h.y * h.y);
              const isCrit = dist < 8;
              const isWarn = dist >= 8 && dist < 16;

              return (
                <div
                  key={h.id}
                  onClick={() => setSelectedHazard(h)}
                  className={`p-2.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                    isCrit
                      ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                      : isWarn
                      ? 'bg-amber-950/50 border-amber-500 text-amber-200'
                      : 'bg-cat-surface border-cat-border text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {h.type === 'pedestrian' ? <User className="w-4 h-4 text-cat-yellow" /> :
                     h.type === 'vehicle' ? <Truck className="w-4 h-4 text-cyan-400" /> :
                     <Zap className="w-4 h-4 text-amber-400" />}
                    <div>
                      <div className="font-bold text-white text-[11px] truncate max-w-[130px]">{h.name}</div>
                      <div className="text-[10px] text-slate-400">
                        Pos: ({h.x}m, {h.y}m)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`font-black text-xs px-2 py-0.5 rounded ${
                      isCrit ? 'bg-rose-600 text-white' : isWarn ? 'bg-amber-500 text-black' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {dist.toFixed(1)}m
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveHazard(h.id);
                      }}
                      className="text-slate-500 hover:text-rose-400 text-xs px-1"
                      title="Clear hazard"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Blind Spot Safety Status Card */}
        <div className="bg-cat-black p-3.5 rounded-xl border border-cat-border space-y-2 text-xs">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>RIGHT REAR BLIND SPOT CAMERA</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> LIVE
            </span>
          </div>
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[11px] text-slate-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-cat-yellow shrink-0" />
            <span>AI Computer Vision: Trench edge stable, no personnel in blind cone.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
