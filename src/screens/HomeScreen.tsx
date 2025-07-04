import React from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { Button } from "../components/Button";
import { CupIcon, WaterIcon } from "../components/Icons";
import { ProgressBar } from "../components/ProgressBar";
import { WaterStatsCard } from "../components/WaterStatsCard";
import { useWater } from "../context/WaterContext";
import { formatVolume, getMotivationalMessage } from "../utils/waterUtils";

export default function HomeScreen() {
  const { state, addWater, getProgressPercentage } = useWater();

  const progressPercentage = getProgressPercentage();
  const motivationalMessage = getMotivationalMessage(progressPercentage);

  const handleAddWater = async () => {
    try {
      await addWater();
    } catch {
      Alert.alert("Erro", "Não foi possível adicionar água. Tente novamente.");
    }
  };

  if (state.loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Text className="text-lg text-gray-500">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center pt-16 pb-8">
          <Text className="text-3xl font-bold text-text mb-2">💧 Beba Água</Text>
          <Text className="text-base text-gray-500">Mantenha-se hidratado!</Text>
        </View>

        {/* Main Progress Card */}
        <View className="bg-white rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="text-lg font-semibold text-text text-center mb-4">
            Progresso de Hoje
          </Text>

          <View className="flex-row items-baseline justify-center mb-4">
            <Text className="text-5xl font-bold text-primary">
              {formatVolume(state.waterIntake)}
            </Text>
            <Text className="text-2xl text-gray-500 ml-2">
              / {formatVolume(state.dailyGoal)}
            </Text>
          </View>

          <View className="mb-4">
            <ProgressBar progress={progressPercentage} height={12} />
          </View>

          <Text className="text-base font-medium text-secondary text-center mb-2">
            {motivationalMessage}
          </Text>

          <Text className="text-sm text-gray-500 text-center">
            {progressPercentage.toFixed(0)}% da meta
          </Text>
        </View>
        {/* Action Button */}
        <Button
          title={`Bebi um copo (${formatVolume(state.userSettings.cupSize)})`}
          onPress={handleAddWater}
          size="lg"
          className="mb-8"
        />

        {/* Stats Cards */}
        <View className="gap-4 mb-8">
          <WaterStatsCard
            title="Meta Diária"
            value={formatVolume(state.dailyGoal)}
            subtitle="Baseada no seu peso"
            icon={<WaterIcon size={32} />}
            className="flex-1"
          />

          <WaterStatsCard
            title="Tamanho do Copo"
            value={formatVolume(state.userSettings.cupSize)}
            subtitle="Volume por porção"
            icon={<CupIcon size={32} />}
            className="flex-1"
          />
        </View>

        {/* Goal Achievement */}
        {state.goalAchieved && (
          <View className="bg-success rounded-2xl p-5 items-center mb-8">
            <Text className="text-2xl font-bold text-white mb-2">🎉 Parabéns!</Text>
            <Text className="text-base text-white text-center">
              Você atingiu sua meta diária de hidratação!
            </Text>
          </View>
        )}

        <View className="h-5" />
      </ScrollView>
    </View>
  );
}
