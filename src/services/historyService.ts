import AsyncStorage from "@react-native-async-storage/async-storage";
import { calculateDailyGoal } from "../utils/waterUtils";

const HISTORY_KEY = "@bebaagua:history";
const STREAK_KEY = "@bebaagua:streak";

export interface DayHistory {
  date: string;
  amount: number;
  goal: number;
  completed: boolean;
}

export interface WeeklyStats {
  totalWeek: number;
  averageDaily: number;
  daysCompleted: number;
  bestDay: number;
}

// Salva o consumo de hoje
export async function logTodayWater(amount: number, userWeight: number): Promise<void> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const goal = calculateDailyGoal(userWeight);

    // Busca histórico atual
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    const history: Record<string, DayHistory> = historyJson
      ? JSON.parse(historyJson)
      : {};

    // Atualiza ou cria registro de hoje
    const currentAmount = history[today]?.amount || 0;
    const newAmount = currentAmount + amount;

    history[today] = {
      date: today,
      amount: newAmount,
      goal,
      completed: newAmount >= goal,
    };

    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));

    // Atualiza streak se completou a meta
    if (history[today].completed) {
      await updateStreak();
    }
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
  }
}

// Busca histórico dos últimos 7 dias
export async function getWeeklyHistory(): Promise<DayHistory[]> {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    const history: Record<string, DayHistory> = historyJson
      ? JSON.parse(historyJson)
      : {};

    const result: DayHistory[] = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().slice(0, 10);

      result.push(
        history[dateStr] || {
          date: dateStr,
          amount: 0,
          goal: 2000, // valor padrão
          completed: false,
        }
      );
    }

    return result;
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return [];
  }
}

// Calcula estatísticas da semana
export async function getWeeklyStats(): Promise<WeeklyStats> {
  try {
    const weekHistory = await getWeeklyHistory();

    const totalWeek = weekHistory.reduce((sum, day) => sum + day.amount, 0);
    const averageDaily = totalWeek / 7;
    const daysCompleted = weekHistory.filter((day) => day.completed).length;
    const bestDay = Math.max(...weekHistory.map((day) => day.amount));

    return {
      totalWeek,
      averageDaily,
      daysCompleted,
      bestDay,
    };
  } catch (error) {
    console.error("Erro ao calcular estatísticas:", error);
    return {
      totalWeek: 0,
      averageDaily: 0,
      daysCompleted: 0,
      bestDay: 0,
    };
  }
}

// Busca streak atual
export async function getCurrentStreak(): Promise<number> {
  try {
    const streakStr = await AsyncStorage.getItem(STREAK_KEY);
    return streakStr ? parseInt(streakStr) : 0;
  } catch (error) {
    console.error("Erro ao buscar streak:", error);
    return 0;
  }
}

// Atualiza streak
async function updateStreak(): Promise<void> {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    const history: Record<string, DayHistory> = historyJson
      ? JSON.parse(historyJson)
      : {};

    // Ordena datas em ordem decrescente (mais recente primeiro)
    const sortedDates = Object.keys(history).sort((a, b) => b.localeCompare(a));

    let streak = 0;
    const today = new Date().toISOString().slice(0, 10);

    // Conta dias consecutivos de meta batida
    for (const date of sortedDates) {
      if (date > today) continue; // Ignora datas futuras

      if (history[date].completed) {
        streak++;
      } else {
        break; // Quebra a sequência
      }
    }

    await AsyncStorage.setItem(STREAK_KEY, streak.toString());
  } catch (error) {
    console.error("Erro ao atualizar streak:", error);
  }
}

// Busca histórico do mês atual
export async function getMonthlyHistory(): Promise<DayHistory[]> {
  try {
    const historyJson = await AsyncStorage.getItem(HISTORY_KEY);
    const history: Record<string, DayHistory> = historyJson
      ? JSON.parse(historyJson)
      : {};

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const result: DayHistory[] = [];

    for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().slice(0, 10);
      result.push(
        history[dateStr] || {
          date: dateStr,
          amount: 0,
          goal: 2000,
          completed: false,
        }
      );
    }

    return result;
  } catch (error) {
    console.error("Erro ao buscar histórico mensal:", error);
    return [];
  }
}
