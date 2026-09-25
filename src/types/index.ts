export type TaskType = 
  | 'Earth Excavation' 
  | 'Trenching' 
  | 'Material Loading' 
  | 'Grading' 
  | 'Demolition'
  | 'Quarry Hauling'
  | 'Foundation Digging';

export type WeatherType = 'Sunny' | 'Rainy' | 'Cloudy' | 'Windy' | 'Stormy';

export type OperatorSkill = 'Beginner' | 'Intermediate' | 'Expert';

export type TaskStatus = 'Scheduled' | 'In Progress' | 'Completed' | 'Delayed';

export interface TaskItem {
  id: string;
  taskType: TaskType;
  description: string;
  weather: WeatherType;
  operatorSkill: OperatorSkill;
  machineAgeYears: number;
  estimatedTimeMin: number;
  actualTimeMin?: number;
  status: TaskStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedOperator: string;
  machineId: string;
  startTime?: string;
  progressPercent: number;
  targetDepthMeters?: number;
  targetVolumeM3?: number;
  location: string;
}

export interface TelemetryRecord {
  id: string;
  timestamp: string;
  machineId: string;
  operatorId: string;
  engineHours: number;
  fuelUsedLiters: number;
  loadCycles: number;
  idlingTimeMin: number;
  seatbeltStatus: 'Fastened' | 'Unfastened';
  safetyAlertTriggered: 'Yes' | 'No';
  alertReason?: string;
  hydraulicPressureBar?: number;
  engineRpm?: number;
  coolantTempC?: number;
  tiltAngleDeg?: number;
  fuelRateLph?: number;
}

export interface HazardObject {
  id: string;
  name: string;
  type: 'pedestrian' | 'vehicle' | 'powerline' | 'trench_edge' | 'underground_pipe';
  x: number; // relative to machine (-100 to 100 meters)
  y: number;
  distance: number;
  angle: number; // 0 - 360
  dangerLevel: 'safe' | 'warning' | 'critical';
  speed?: number; // m/s
  direction?: number;
}

export interface IncidentReport {
  id: string;
  timestamp: string;
  category: 'Near Miss Proximity' | 'Unfastened Seatbelt' | 'Excessive Idling' | 'Extreme Slope / Tilt' | 'Hydraulic Surge' | 'Ground Collision';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  operatorId: string;
  machineId: string;
  locationCoords: string;
  weather: WeatherType;
  status: 'Open' | 'Under Review' | 'Resolved';
  supervisorNotified: boolean;
  actionTaken?: string;
}

export interface TrainingCourse {
  id: string;
  title: string;
  category: 'Safety' | 'Efficiency' | 'Machinery Handling' | 'Advanced Operations';
  durationMin: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Expert';
  completed: boolean;
  score?: number;
  thumbnail: string;
  description: string;
  steps: string[];
  keyTakeaways: string[];
  hasSimulation: boolean;
}

export interface InstructorBooking {
  id: string;
  instructorName: string;
  role: string;
  topic: string;
  date: string;
  timeSlot: string;
  mode: 'On-Site Cab Coaching' | 'Remote VR Simulator' | 'Telemetry Review';
  status: 'Confirmed' | 'Pending' | 'Completed';
}
