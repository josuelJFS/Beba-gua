export const APP_CONFIG = {
  DEFAULT_DAILY_GOAL: 2000, // ml
  DEFAULT_CUP_SIZE: 250, // ml
  DEFAULT_REMINDER_INTERVAL: 2, // hours
  MIN_WEIGHT: 30, // kg
  MAX_WEIGHT: 200, // kg
  WATER_PER_KG: 35, // ml per kg of body weight
} as const;

export const STORAGE_KEYS = {
  USER_WEIGHT: "user_weight",
  CUP_SIZE: "cup_size",
  DAILY_GOAL: "daily_goal",
  WATER_INTAKE: "water_intake",
  REMINDERS_ENABLED: "reminders_enabled",
  REMINDER_INTERVAL: "reminder_interval",
  LAST_RESET_DATE: "last_reset_date",
} as const;

export const ADMOB_CONFIG = {
  BANNER_ID: __DEV__
    ? "ca-app-pub-3940256099942544/6300978111"
    : "YOUR_PRODUCTION_BANNER_ID",
  INTERSTITIAL_ID: __DEV__
    ? "ca-app-pub-3940256099942544/1033173712"
    : "YOUR_PRODUCTION_INTERSTITIAL_ID",
} as const;
