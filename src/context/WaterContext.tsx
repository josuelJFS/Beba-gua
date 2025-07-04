import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";
import { databaseService } from "../services/databaseService";
import { notificationService } from "../services/notificationService";
import { storageService, UserSettings } from "../services/storageService";
import {
  calculateDailyGoal,
  getProgressPercentage as calculateProgressPercentage,
} from "../utils/waterUtils";

interface WaterState {
  waterIntake: number;
  dailyGoal: number;
  userSettings: UserSettings;
  loading: boolean;
  goalAchieved: boolean;
}

type WaterAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_WATER_INTAKE"; payload: number }
  | { type: "SET_USER_SETTINGS"; payload: UserSettings }
  | { type: "ADD_WATER"; payload: number }
  | { type: "SET_GOAL_ACHIEVED"; payload: boolean }
  | { type: "RESET_DAILY_INTAKE" };

const initialState: WaterState = {
  waterIntake: 0,
  dailyGoal: 2000,
  userSettings: {
    weight: 70,
    cupSize: 250,
    dailyGoal: 2000,
    remindersEnabled: true,
    reminderInterval: 2,
  },
  loading: true,
  goalAchieved: false,
};

const waterReducer = (state: WaterState, action: WaterAction): WaterState => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_WATER_INTAKE":
      return { ...state, waterIntake: action.payload };
    case "SET_USER_SETTINGS":
      return {
        ...state,
        userSettings: action.payload,
        dailyGoal: action.payload.dailyGoal,
      };
    case "ADD_WATER":
      return { ...state, waterIntake: state.waterIntake + action.payload };
    case "SET_GOAL_ACHIEVED":
      return { ...state, goalAchieved: action.payload };
    case "RESET_DAILY_INTAKE":
      return { ...state, waterIntake: 0, goalAchieved: false };
    default:
      return state;
  }
};

interface WaterContextType {
  state: WaterState;
  addWater: (amount?: number) => Promise<void>;
  updateUserSettings: (settings: UserSettings) => Promise<void>;
  resetDailyIntake: () => Promise<void>;
  getProgressPercentage: () => number;
}

const WaterContext = createContext<WaterContextType | undefined>(undefined);

interface WaterProviderProps {
  children: ReactNode;
}

export const WaterProvider: React.FC<WaterProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(waterReducer, initialState);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    // Check if goal is achieved
    const progressPercentage = calculateProgressPercentage(
      state.waterIntake,
      state.dailyGoal
    );
    if (progressPercentage >= 100 && !state.goalAchieved && state.waterIntake > 0) {
      dispatch({ type: "SET_GOAL_ACHIEVED", payload: true });
      handleGoalAchieved();
    }
  }, [state.waterIntake, state.dailyGoal, state.goalAchieved]);

  const loadInitialData = async () => {
    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Inicializa o banco de dados
      await databaseService.initialize();

      const [userSettings, waterIntake] = await Promise.all([
        storageService.getUserSettings(),
        storageService.getWaterIntake(),
      ]);

      dispatch({ type: "SET_USER_SETTINGS", payload: userSettings });
      dispatch({ type: "SET_WATER_INTAKE", payload: waterIntake });

      // Setup notifications if enabled
      if (userSettings.remindersEnabled) {
        await notificationService.scheduleWaterReminders(userSettings.reminderInterval);
      }
    } catch (error) {
      console.error("Error loading initial data:", error);
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const addWater = async (amount?: number): Promise<void> => {
    try {
      const waterAmount = amount || state.userSettings.cupSize;
      const newIntake = await storageService.addWaterIntake(waterAmount);
      dispatch({ type: "SET_WATER_INTAKE", payload: newIntake });

      // Salva no banco SQLite
      await databaseService.addWaterRecord(
        waterAmount,
        state.dailyGoal,
        state.userSettings.weight
      );
    } catch (error) {
      console.error("Error adding water:", error);
    }
  };

  const updateUserSettings = async (settings: UserSettings): Promise<void> => {
    try {
      const updatedSettings = {
        ...settings,
        dailyGoal: calculateDailyGoal(settings.weight),
      };

      await storageService.saveUserSettings(updatedSettings);
      dispatch({ type: "SET_USER_SETTINGS", payload: updatedSettings });

      // Update notifications
      if (updatedSettings.remindersEnabled) {
        await notificationService.scheduleWaterReminders(
          updatedSettings.reminderInterval
        );
      } else {
        await notificationService.cancelAllReminders();
      }
    } catch (error) {
      console.error("Error updating user settings:", error);
    }
  };

  const resetDailyIntake = async (): Promise<void> => {
    try {
      await storageService.resetDailyIntake();
      dispatch({ type: "RESET_DAILY_INTAKE" });
    } catch (error) {
      console.error("Error resetting daily intake:", error);
    }
  };

  const handleGoalAchieved = async (): Promise<void> => {
    try {
      await notificationService.sendGoalAchievedNotification();
      // AdMob removido temporariamente
    } catch (error) {
      console.error("Error handling goal achieved:", error);
    }
  };

  const getProgressPercentage = (): number => {
    return calculateProgressPercentage(state.waterIntake, state.dailyGoal);
  };

  const contextValue: WaterContextType = {
    state,
    addWater,
    updateUserSettings,
    resetDailyIntake,
    getProgressPercentage,
  };

  return <WaterContext.Provider value={contextValue}>{children}</WaterContext.Provider>;
};

export const useWater = (): WaterContextType => {
  const context = useContext(WaterContext);
  if (context === undefined) {
    throw new Error("useWater must be used within a WaterProvider");
  }
  return context;
};
