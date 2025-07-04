import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_CONFIG, STORAGE_KEYS } from "../config/constants";
import { calculateDailyGoal, getTodayDateString, isNewDay } from "../utils/waterUtils";

export interface UserSettings {
  weight: number;
  cupSize: number;
  dailyGoal: number;
  remindersEnabled: boolean;
  reminderInterval: number;
}

export interface WaterIntake {
  amount: number;
  date: string;
}

class StorageService {
  async getUserSettings(): Promise<UserSettings> {
    try {
      const [weight, cupSize, dailyGoal, remindersEnabled, reminderInterval] =
        await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.USER_WEIGHT),
          AsyncStorage.getItem(STORAGE_KEYS.CUP_SIZE),
          AsyncStorage.getItem(STORAGE_KEYS.DAILY_GOAL),
          AsyncStorage.getItem(STORAGE_KEYS.REMINDERS_ENABLED),
          AsyncStorage.getItem(STORAGE_KEYS.REMINDER_INTERVAL),
        ]);

      const userWeight = weight ? parseFloat(weight) : 70;
      const userCupSize = cupSize ? parseInt(cupSize) : APP_CONFIG.DEFAULT_CUP_SIZE;
      const userDailyGoal = dailyGoal
        ? parseInt(dailyGoal)
        : calculateDailyGoal(userWeight);

      return {
        weight: userWeight,
        cupSize: userCupSize,
        dailyGoal: userDailyGoal,
        remindersEnabled: remindersEnabled ? JSON.parse(remindersEnabled) : true,
        reminderInterval: reminderInterval
          ? parseInt(reminderInterval)
          : APP_CONFIG.DEFAULT_REMINDER_INTERVAL,
      };
    } catch (error) {
      console.error("Error getting user settings:", error);
      return {
        weight: 70,
        cupSize: APP_CONFIG.DEFAULT_CUP_SIZE,
        dailyGoal: APP_CONFIG.DEFAULT_DAILY_GOAL,
        remindersEnabled: true,
        reminderInterval: APP_CONFIG.DEFAULT_REMINDER_INTERVAL,
      };
    }
  }

  async saveUserSettings(settings: UserSettings): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER_WEIGHT, settings.weight.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.CUP_SIZE, settings.cupSize.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.DAILY_GOAL, settings.dailyGoal.toString()),
        AsyncStorage.setItem(
          STORAGE_KEYS.REMINDERS_ENABLED,
          JSON.stringify(settings.remindersEnabled)
        ),
        AsyncStorage.setItem(
          STORAGE_KEYS.REMINDER_INTERVAL,
          settings.reminderInterval.toString()
        ),
      ]);
    } catch (error) {
      console.error("Error saving user settings:", error);
      throw error;
    }
  }

  async getWaterIntake(): Promise<number> {
    try {
      const lastResetDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_DATE);

      // Check if it's a new day and reset if needed
      if (!lastResetDate || isNewDay(lastResetDate)) {
        await this.resetDailyIntake();
        return 0;
      }

      const waterIntake = await AsyncStorage.getItem(STORAGE_KEYS.WATER_INTAKE);
      return waterIntake ? parseInt(waterIntake) : 0;
    } catch (error) {
      console.error("Error getting water intake:", error);
      return 0;
    }
  }

  async addWaterIntake(amount: number): Promise<number> {
    try {
      const currentIntake = await this.getWaterIntake();
      const newIntake = currentIntake + amount;

      await AsyncStorage.setItem(STORAGE_KEYS.WATER_INTAKE, newIntake.toString());
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, getTodayDateString());

      return newIntake;
    } catch (error) {
      console.error("Error adding water intake:", error);
      throw error;
    }
  }

  async resetDailyIntake(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WATER_INTAKE, "0");
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_DATE, getTodayDateString());
    } catch (error) {
      console.error("Error resetting daily intake:", error);
      throw error;
    }
  }

  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing all data:", error);
      throw error;
    }
  }
}

export const storageService = new StorageService();
