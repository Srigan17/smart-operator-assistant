import { TaskType, WeatherType, OperatorSkill } from '../types';

export interface EstimationResult {
  predictedMinutes: number;
  confidenceScore: number; // 0-100%
  baseMinutes: number;
  weatherFactor: number;
  skillFactor: number;
  machineAgeFactor: number;
  estimatedFuelLiters: number;
  recommendedMode: 'Eco Mode' | 'Standard Power' | 'High Power Plus';
  breakdown: {
    baseTimeMin: number;
    weatherDeltaMin: number;
    skillDeltaMin: number;
    machineWearDeltaMin: number;
  };
  safetyRecommendations: string[];
  co2FootprintKg: number;
}

const BASE_TASK_TIMES: Record<TaskType, number> = {
  'Earth Excavation': 60,
  'Trenching': 45,
  'Material Loading': 30,
  'Grading': 35,
  'Demolition': 90,
  'Quarry Hauling': 75,
  'Foundation Digging': 110,
};

const WEATHER_MULTIPLIERS: Record<WeatherType, number> = {
  'Sunny': 1.0,
  'Cloudy': 1.05,
  'Rainy': 1.18, // Mud, slick trench edges, reduced visibility
  'Windy': 1.15, // Dust storms, boom sway stabilization
  'Stormy': 1.35, // Severe hazard conditions, slow swing
};

const SKILL_MULTIPLIERS: Record<OperatorSkill, number> = {
  'Expert': 0.96, // Highly fluid hydraulic control
  'Intermediate': 1.12,
  'Beginner': 1.38, // Hesitant cycle movements, repeated adjustments
};

export function calculateTaskEstimation(
  taskType: TaskType,
  weather: WeatherType,
  skill: OperatorSkill,
  machineAgeYears: number,
  soilHardness: 'Soft Soil' | 'Medium Clay' | 'Hard Rock / Shale' = 'Medium Clay'
): EstimationResult {
  const baseTime = BASE_TASK_TIMES[taskType] || 50;
  
  // Soil adjustment
  let soilMultiplier = 1.0;
  if (soilHardness === 'Soft Soil') soilMultiplier = 0.9;
  if (soilHardness === 'Hard Rock / Shale') soilMultiplier = 1.25;

  const weatherMult = WEATHER_MULTIPLIERS[weather];
  const skillMult = SKILL_MULTIPLIERS[skill];
  
  // Machine age degradation: +2.2% per year of age
  const ageMult = 1 + (Math.max(0, machineAgeYears - 1) * 0.022);

  // Compute calculated duration
  const adjustedTime = baseTime * soilMultiplier * weatherMult * skillMult * ageMult;
  const roundedPredicted = Math.round(adjustedTime);

  // Breakdown calculations
  const weatherDelta = Math.round((weatherMult - 1.0) * baseTime);
  const skillDelta = Math.round((skillMult - 1.0) * baseTime);
  const machineWearDelta = Math.round((ageMult - 1.0) * baseTime);

  // Confidence scoring
  let confidence = 95;
  if (weather === 'Rainy' || weather === 'Windy') confidence -= 8;
  if (weather === 'Stormy') confidence -= 16;
  if (skill === 'Beginner') confidence -= 9;
  if (machineAgeYears > 6) confidence -= 6;
  confidence = Math.max(65, Math.min(99, confidence));

  // Fuel calculation (average CAT 336 consumes 12-16 L/h depending on task and age)
  const hours = roundedPredicted / 60;
  const baseBurnRate = taskType === 'Demolition' ? 16.5 : taskType === 'Grading' ? 9.5 : 13.0;
  const estimatedFuel = Number((hours * baseBurnRate * (1 + (machineAgeYears * 0.015))).toFixed(1));
  const co2Footprint = Number((estimatedFuel * 2.68).toFixed(1)); // 2.68 kg CO2 per liter diesel

  // Mode recommendation
  let recommendedMode: 'Eco Mode' | 'Standard Power' | 'High Power Plus' = 'Standard Power';
  if (taskType === 'Grading' || skill === 'Beginner') {
    recommendedMode = 'Eco Mode';
  } else if (taskType === 'Demolition' || soilHardness === 'Hard Rock / Shale') {
    recommendedMode = 'High Power Plus';
  }

  // Safety & efficiency tips
  const safetyRecommendations: string[] = [];
  if (weather === 'Rainy') {
    safetyRecommendations.push('Rain advisory: Maintain minimum 3.5m clearance from trench collapse zones.');
  }
  if (weather === 'Windy') {
    safetyRecommendations.push('High wind gust warning: Reduce high-reach boom slewing speed by 25%.');
  }
  if (skill === 'Beginner') {
    safetyRecommendations.push('Beginner profile active: Keep CAT Grade Assist in Semi-Autonomous auto-leveling.');
  }
  if (machineAgeYears >= 5) {
    safetyRecommendations.push('Machine age 5+ yrs: Verify hydraulic oil filter differential pressure before heavy breakout.');
  }

  return {
    predictedMinutes: roundedPredicted,
    confidenceScore: confidence,
    baseMinutes: baseTime,
    weatherFactor: weatherMult,
    skillFactor: skillMult,
    machineAgeFactor: Number(ageMult.toFixed(2)),
    estimatedFuelLiters: estimatedFuel,
    recommendedMode,
    breakdown: {
      baseTimeMin: baseTime,
      weatherDeltaMin: weatherDelta,
      skillDeltaMin: skillDelta,
      machineWearDeltaMin: machineWearDelta,
    },
    safetyRecommendations,
    co2FootprintKg: co2Footprint,
  };
}
