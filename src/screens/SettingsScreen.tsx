import React, { useState } from "react";
import { Alert, ScrollView, Switch, Text, View } from "react-native";
import { Button } from "../components/Button";
import { InputField } from "../components/InputField";
import { APP_CONFIG } from "../config/constants";
import { useWater } from "../context/WaterContext";
import { calculateDailyGoal, formatVolume } from "../utils/waterUtils";

export default function SettingsScreen() {
  const { state, updateUserSettings } = useWater();

  const [weight, setWeight] = useState(state.userSettings.weight.toString());
  const [cupSize, setCupSize] = useState(state.userSettings.cupSize.toString());
  const [remindersEnabled, setRemindersEnabled] = useState(
    state.userSettings.remindersEnabled
  );
  const [reminderInterval, setReminderInterval] = useState(
    state.userSettings.reminderInterval.toString()
  );
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{
    weight?: string;
    cupSize?: string;
    reminderInterval?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};

    const weightNum = parseFloat(weight);
    if (
      !weight ||
      isNaN(weightNum) ||
      weightNum < APP_CONFIG.MIN_WEIGHT ||
      weightNum > APP_CONFIG.MAX_WEIGHT
    ) {
      newErrors.weight = `Peso deve estar entre ${APP_CONFIG.MIN_WEIGHT}kg e ${APP_CONFIG.MAX_WEIGHT}kg`;
    }

    const cupSizeNum = parseInt(cupSize);
    if (!cupSize || isNaN(cupSizeNum) || cupSizeNum < 50 || cupSizeNum > 1000) {
      newErrors.cupSize = "Tamanho do copo deve estar entre 50ml e 1000ml";
    }

    const intervalNum = parseFloat(reminderInterval);
    if (
      !reminderInterval ||
      isNaN(intervalNum) ||
      intervalNum < 0.5 ||
      intervalNum > 12
    ) {
      newErrors.reminderInterval = "Intervalo deve estar entre 0.5 e 12 horas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const weightNum = parseFloat(weight);
      const cupSizeNum = parseInt(cupSize);
      const intervalNum = parseFloat(reminderInterval);
      const dailyGoal = calculateDailyGoal(weightNum);

      await updateUserSettings({
        weight: weightNum,
        cupSize: cupSizeNum,
        dailyGoal,
        remindersEnabled,
        reminderInterval: intervalNum,
      });

      Alert.alert("Sucesso", "Configurações salvas com sucesso!");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar as configurações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      "Restaurar Padrões",
      "Tem certeza que deseja restaurar as configurações padrão?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          onPress: () => {
            setWeight("70");
            setCupSize(APP_CONFIG.DEFAULT_CUP_SIZE.toString());
            setRemindersEnabled(true);
            setReminderInterval(APP_CONFIG.DEFAULT_REMINDER_INTERVAL.toString());
            setErrors({});
          },
        },
      ]
    );
  };

  const calculatedGoal = weight ? calculateDailyGoal(parseFloat(weight)) : 0;

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="items-center pt-16 pb-8">
          <Text className="text-3xl font-bold text-text mb-2">⚙️ Configurações</Text>
          <Text className="text-base text-gray-500">Personalize seu app</Text>
        </View>

        {/* Personal Settings */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-text mb-4">
            Informações Pessoais
          </Text>

          <InputField
            label="Seu peso (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="Ex: 70"
            error={errors.weight}
          />

          {weight && !errors.weight && (
            <View className="bg-blue-50 rounded-xl p-4 mt-2">
              <Text className="text-sm text-blue-700 text-center">
                Meta diária calculada: {formatVolume(calculatedGoal)}
              </Text>
            </View>
          )}
        </View>

        {/* Cup Settings */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-text mb-4">
            Configuração do Copo
          </Text>

          <InputField
            label="Tamanho do copo (ml)"
            value={cupSize}
            onChangeText={setCupSize}
            keyboardType="numeric"
            placeholder="Ex: 250"
            error={errors.cupSize}
          />
        </View>

        {/* Reminder Settings */}
        <View className="mb-8">
          <Text className="text-xl font-semibold text-text mb-4">Lembretes</Text>

          <View className="flex-row items-center justify-between bg-white rounded-xl p-4 mb-4">
            <View className="flex-1 mr-4">
              <Text className="text-base font-semibold text-text mb-1">
                Ativar lembretes
              </Text>
              <Text className="text-sm text-gray-500">
                Receba notificações para beber água
              </Text>
            </View>
            <Switch
              value={remindersEnabled}
              onValueChange={setRemindersEnabled}
              trackColor={{ false: "#E5E7EB", true: "#00C2CB" }}
              thumbColor={remindersEnabled ? "#FFFFFF" : "#9CA3AF"}
            />
          </View>

          {remindersEnabled && (
            <InputField
              label="Intervalo entre lembretes (horas)"
              value={reminderInterval}
              onChangeText={setReminderInterval}
              keyboardType="numeric"
              placeholder="Ex: 2"
              error={errors.reminderInterval}
            />
          )}
        </View>

        {/* Action Buttons */}
        <View className="gap-4">
          <Button
            title="Salvar Configurações"
            onPress={handleSave}
            loading={loading}
            size="lg"
            className="mb-2"
          />

          <Button
            title="Restaurar Padrões"
            onPress={resetToDefaults}
            variant="outline"
            size="md"
            className="mb-2"
          />
        </View>

        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
