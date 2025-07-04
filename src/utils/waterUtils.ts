import { APP_CONFIG } from "../config/constants";

export const calculateDailyGoal = (weight: number): number => {
  if (weight < APP_CONFIG.MIN_WEIGHT || weight > APP_CONFIG.MAX_WEIGHT) {
    return APP_CONFIG.DEFAULT_DAILY_GOAL;
  }
  return Math.round(weight * APP_CONFIG.WATER_PER_KG);
};

export const formatVolume = (volume: number): string => {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}L`;
  }
  return `${volume}ml`;
};

export const getProgressPercentage = (current: number, goal: number): number => {
  if (goal === 0) return 0;
  return Math.min((current / goal) * 100, 100);
};

export const isNewDay = (lastDate: string): boolean => {
  const today = new Date().toDateString();
  return today !== lastDate;
};

export const getTodayDateString = (): string => {
  return new Date().toDateString();
};

export const getMotivationalMessage = (percentage: number): string => {
  if (percentage >= 100) {
    return "🎉 Parabéns! Meta atingida!";
  } else if (percentage >= 75) {
    return "💪 Quase lá! Continue bebendo!";
  } else if (percentage >= 50) {
    return "👍 Você está no meio do caminho!";
  } else if (percentage >= 25) {
    return "🚀 Bom começo! Continue assim!";
  } else {
    return "💧 Hora de começar a se hidratar!";
  }
};
