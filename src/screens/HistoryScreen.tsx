import { Picker } from "@react-native-picker/picker";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, ScrollView, Text, View } from "react-native";
import { WaterStatsCard } from "../components/WaterStatsCard";
import { DailyStats, databaseService, FilterOptions } from "../services/databaseService";
import { formatVolume } from "../utils/waterUtils";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function HistoryScreen() {
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filtros
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("week");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);

  const loadAvailableOptions = useCallback(async () => {
    try {
      const years = await databaseService.getAvailableYears();
      setAvailableYears(years.length > 0 ? years : [new Date().getFullYear()]);

      if (selectedPeriod === "month") {
        const months = await databaseService.getAvailableMonths(selectedYear);
        setAvailableMonths(months.length > 0 ? months : [new Date().getMonth() + 1]);
      }
    } catch (error) {
      console.error("Erro ao carregar opções:", error);
    }
  }, [selectedPeriod, selectedYear]);

  const loadData = useCallback(async () => {
    try {
      const filter: FilterOptions = {
        period: selectedPeriod,
        year: selectedYear,
        month: selectedPeriod === "month" ? selectedMonth : undefined,
        date:
          selectedPeriod === "week" ? new Date().toISOString().slice(0, 10) : undefined,
      };

      const [statsData, streakData] = await Promise.all([
        databaseService.getDailyStats(filter),
        databaseService.getCurrentStreak(),
      ]);

      setDailyStats(statsData);
      setStreak(streakData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      Alert.alert("Erro", "Não foi possível carregar o histórico");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod, selectedYear, selectedMonth]);

  useEffect(() => {
    loadAvailableOptions();
  }, [loadAvailableOptions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPeriodTitle = () => {
    switch (selectedPeriod) {
      case "week":
        return "Esta Semana";
      case "month":
        return `${MONTHS[selectedMonth - 1]} ${selectedYear}`;
      case "year":
        return `Ano ${selectedYear}`;
      default:
        return "Histórico";
    }
  };

  const getStatsForPeriod = () => {
    const totalAmount = dailyStats.reduce((sum, day) => sum + day.total_amount, 0);
    const daysCompleted = dailyStats.filter((day) => day.completed).length;
    const averageDaily = dailyStats.length > 0 ? totalAmount / dailyStats.length : 0;
    const bestDay =
      dailyStats.length > 0 ? Math.max(...dailyStats.map((day) => day.total_amount)) : 0;

    return {
      totalAmount,
      daysCompleted,
      averageDaily,
      bestDay,
      totalDays: dailyStats.length,
    };
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-lg text-gray-500">Carregando histórico...</Text>
      </View>
    );
  }

  const stats = getStatsForPeriod();

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="items-center pt-16 pb-6">
          <Text className="text-3xl font-bold text-text mb-2">📊 Histórico</Text>
          <Text className="text-base text-gray-500">Acompanhe seu progresso</Text>
        </View>

        {/* Filtros */}
        <View className="bg-white rounded-2xl p-4 mb-6 shadow-lg">
          <Text className="text-lg font-semibold text-text mb-4">Filtros</Text>

          {/* Seletor de Período */}
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-600 mb-2">Período</Text>
            <View className="border border-gray-200 rounded-xl">
              <Picker
                selectedValue={selectedPeriod}
                onValueChange={(value: "week" | "month" | "year") =>
                  setSelectedPeriod(value)
                }
                style={{ height: 50 }}
              >
                <Picker.Item label="Esta Semana" value="week" />
                <Picker.Item label="Mês" value="month" />
                <Picker.Item label="Ano" value="year" />
              </Picker>
            </View>
          </View>

          {/* Seletor de Ano */}
          {(selectedPeriod === "month" || selectedPeriod === "year") && (
            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-600 mb-2">Ano</Text>
              <View className="border border-gray-200 rounded-xl">
                <Picker
                  selectedValue={selectedYear}
                  onValueChange={(value: number) => setSelectedYear(value)}
                  style={{ height: 50 }}
                >
                  {availableYears.map((year) => (
                    <Picker.Item key={year} label={year.toString()} value={year} />
                  ))}
                </Picker>
              </View>
            </View>
          )}

          {/* Seletor de Mês */}
          {selectedPeriod === "month" && (
            <View className="mb-2">
              <Text className="text-sm font-medium text-gray-600 mb-2">Mês</Text>
              <View className="border border-gray-200 rounded-xl">
                <Picker
                  selectedValue={selectedMonth}
                  onValueChange={(value: number) => setSelectedMonth(value)}
                  style={{ height: 50 }}
                >
                  {availableMonths.map((month) => (
                    <Picker.Item key={month} label={MONTHS[month - 1]} value={month} />
                  ))}
                </Picker>
              </View>
            </View>
          )}
        </View>

        {/* Streak Card */}
        <View className="bg-primary rounded-2xl p-6 mb-6 items-center shadow-lg">
          <Text className="text-lg font-semibold text-white mb-2">
            🔥 Sequência Atual
          </Text>
          <Text className="text-4xl font-bold text-white mb-1">
            {streak} {streak === 1 ? "dia" : "dias"}
          </Text>
          <Text className="text-sm text-white opacity-90">
            {streak > 0 ? "Continue assim!" : "Comece sua sequência hoje!"}
          </Text>
        </View>

        {/* Título do Período */}
        <View className="mb-4">
          <Text className="text-xl font-semibold text-text">{getPeriodTitle()}</Text>
          {dailyStats.length === 0 && selectedPeriod === "week" && (
            <Text className="text-sm text-gray-500 mt-1">
              💡 Comece bebendo água na tela principal para ver suas estatísticas!
            </Text>
          )}
        </View>

        {/* Stats Cards */}
        <View className="mb-6">
          <View className="flex-row flex-wrap gap-3">
            <View className="flex-1 min-w-[45%]">
              <WaterStatsCard
                title={`Total do ${selectedPeriod === "week" ? "Período" : selectedPeriod === "month" ? "Mês" : "Ano"}`}
                value={formatVolume(stats.totalAmount)}
                icon={<Text className="text-2xl">🌊</Text>}
              />
            </View>

            <View className="flex-1 min-w-[45%]">
              <WaterStatsCard
                title="Média Diária"
                value={formatVolume(stats.averageDaily)}
                icon={<Text className="text-2xl">📈</Text>}
              />
            </View>

            <View className="flex-1 min-w-[45%]">
              <WaterStatsCard
                title="Dias Completos"
                value={`${stats.daysCompleted}/${stats.totalDays}`}
                subtitle="metas batidas"
                icon={<Text className="text-2xl">🎯</Text>}
              />
            </View>

            <View className="flex-1 min-w-[45%]">
              <WaterStatsCard
                title="Melhor Dia"
                value={stats.bestDay > 0 ? formatVolume(stats.bestDay) : "Sem dados"}
                subtitle={stats.bestDay === 0 ? "Adicione água para ver" : undefined}
                icon={<Text className="text-2xl">🏆</Text>}
              />
            </View>
          </View>
        </View>

        {/* Lista de Dias */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-text mb-4">
            Histórico Detalhado
          </Text>

          {dailyStats.length === 0 ? (
            <View className="bg-white rounded-xl p-8 items-center shadow-lg">
              <Text className="text-gray-500 text-center">
                Nenhum registro encontrado para este período
              </Text>
            </View>
          ) : (
            dailyStats.map((day) => {
              const date = new Date(day.date);
              const isToday = date.toDateString() === new Date().toDateString();
              const percentage = (day.total_amount / day.goal) * 100;

              return (
                <View
                  key={day.date}
                  className={`bg-white rounded-xl p-4 mb-3 shadow-lg ${
                    isToday ? "border-2 border-primary" : ""
                  }`}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <View>
                      <Text className="text-base font-semibold text-text">
                        {date.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "short",
                        })}
                        {isToday && " (Hoje)"}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Meta: {formatVolume(day.goal)} • {day.records_count} registros
                      </Text>
                    </View>

                    <View className="items-end">
                      <Text
                        className={`text-lg font-bold ${
                          day.completed ? "text-success" : "text-gray-600"
                        }`}
                      >
                        {formatVolume(day.total_amount)}
                      </Text>
                      <Text
                        className={`text-sm ${
                          day.completed ? "text-success" : "text-gray-500"
                        }`}
                      >
                        {Math.round(percentage)}%{day.completed && " ✅"}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View className="bg-gray-200 rounded-full h-2">
                    <View
                      className={`h-2 rounded-full ${
                        day.completed ? "bg-success" : "bg-primary"
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
