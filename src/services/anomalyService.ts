import { TelemetryRecord } from '../types';

export interface TelemetryAnomaly {
  id: string;
  timestamp: string;
  type: 'EXCESSIVE_IDLING' | 'SEATBELT_VIOLATION' | 'HYDRAULIC_SPIKE' | 'HIGH_ROLLOVER_ANGLE' | 'RAPID_SWING_OVERLOAD' | 'LOW_EFFICIENCY';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  metricValue: string;
  threshold: string;
  recommendation: string;
  financialImpact?: string;
  resolved: boolean;
}

export function detectTelemetryAnomalies(record: TelemetryRecord): TelemetryAnomaly[] {
  const anomalies: TelemetryAnomaly[] = [];

  // 1. Excessive Idling Check (> 40 minutes is warning, > 50 minutes is critical)
  if (record.idlingTimeMin >= 50) {
    const wastedLiters = (record.idlingTimeMin / 60) * 2.8;
    const wastedCost = (wastedLiters * 1.65).toFixed(2);
    anomalies.push({
      id: `ANOM-IDLE-${record.id}`,
      timestamp: record.timestamp,
      type: 'EXCESSIVE_IDLING',
      severity: 'CRITICAL',
      title: 'Severe Excessive Engine Idling',
      description: `Engine idled for ${record.idlingTimeMin} mins with minimal load cycles (${record.loadCycles}).`,
      metricValue: `${record.idlingTimeMin} min`,
      threshold: '< 30 min',
      recommendation: 'Enable CAT Auto-Idle Stop (AIS) after 5 minutes of non-activity.',
      financialImpact: `~$${wastedCost} wasted fuel (~${(wastedLiters * 2.68).toFixed(1)}kg CO2)`,
      resolved: false,
    });
  } else if (record.idlingTimeMin >= 35) {
    anomalies.push({
      id: `ANOM-IDLE-WARN-${record.id}`,
      timestamp: record.timestamp,
      type: 'EXCESSIVE_IDLING',
      severity: 'WARNING',
      title: 'Elevated Idling Detected',
      description: `Engine idled for ${record.idlingTimeMin} minutes.`,
      metricValue: `${record.idlingTimeMin} min`,
      threshold: '< 30 min',
      recommendation: 'Switch to Eco-Idle standby when waiting for transport trucks.',
      financialImpact: `~$${((record.idlingTimeMin / 60) * 2.8 * 1.65).toFixed(2)} fuel waste`,
      resolved: false,
    });
  }

  // 2. Seatbelt Compliance Check
  if (record.seatbeltStatus === 'Unfastened') {
    anomalies.push({
      id: `ANOM-BELT-${record.id}`,
      timestamp: record.timestamp,
      type: 'SEATBELT_VIOLATION',
      severity: 'CRITICAL',
      title: 'Operator Seatbelt Unfastened in Operating Cab',
      description: 'Seat switch indicates operator unbuckled while engine ignition is active.',
      metricValue: 'Unfastened',
      threshold: 'Fastened (Mandatory)',
      recommendation: 'Mandatory seatbelt latch required before hydraulic joystick interlock unlocks.',
      financialImpact: 'OSHA / ISO 3471 compliance violation penalty risk',
      resolved: false,
    });
  }

  // 3. Hydraulic Pressure Overpressure Spike
  if (record.hydraulicPressureBar && record.hydraulicPressureBar > 330) {
    anomalies.push({
      id: `ANOM-HYD-${record.id}`,
      timestamp: record.timestamp,
      type: 'HYDRAULIC_SPIKE',
      severity: 'WARNING',
      title: 'Hydraulic Main Relief Pressure Spike',
      description: `Peak pressure hit ${record.hydraulicPressureBar} bar (relief valve active).`,
      metricValue: `${record.hydraulicPressureBar} bar`,
      threshold: '< 320 bar',
      recommendation: 'Avoid stalling bucket in immovable rock formations; ease curl stroke.',
      financialImpact: 'Accelerated hydraulic pump seal degradation',
      resolved: false,
    });
  }

  // 4. Rollover / Slope Angle
  if (record.tiltAngleDeg && record.tiltAngleDeg > 18) {
    anomalies.push({
      id: `ANOM-TILT-${record.id}`,
      timestamp: record.timestamp,
      type: 'HIGH_ROLLOVER_ANGLE',
      severity: 'CRITICAL',
      title: 'Hazardous Lateral Slope Angle',
      description: `Machine lateral tilt reached ${record.tiltAngleDeg}°. High rollover tip hazard.`,
      metricValue: `${record.tiltAngleDeg}°`,
      threshold: '< 15° Safe Limit',
      recommendation: 'Reposition tracks perpendicular to slope grade immediately.',
      resolved: false,
    });
  }

  return anomalies;
}

export function analyzeFleetTelematics(records: TelemetryRecord[]) {
  const totalFuel = records.reduce((acc, r) => acc + r.fuelUsedLiters, 0);
  const totalIdleMinutes = records.reduce((acc, r) => acc + r.idlingTimeMin, 0);
  const totalCycles = records.reduce((acc, r) => acc + r.loadCycles, 0);
  const unfastenedCount = records.filter(r => r.seatbeltStatus === 'Unfastened').length;
  const alertCount = records.filter(r => r.safetyAlertTriggered === 'Yes').length;

  const avgIdleRatePercent = Math.round((totalIdleMinutes / (records.length * 60)) * 100);
  const estimatedWastedFuelLiters = Number(((totalIdleMinutes / 60) * 2.8).toFixed(1));
  const estimatedWastedCostUsd = Number((estimatedWastedFuelLiters * 1.65).toFixed(2));

  return {
    totalFuel: Number(totalFuel.toFixed(1)),
    totalIdleMinutes,
    totalCycles,
    unfastenedCount,
    alertCount,
    avgIdleRatePercent,
    estimatedWastedFuelLiters,
    estimatedWastedCostUsd,
    safetyScore: Math.max(50, 100 - (unfastenedCount * 20) - (alertCount * 10)),
  };
}
