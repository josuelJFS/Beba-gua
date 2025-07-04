import React from "react";
import { Text, View, ViewStyle } from "react-native";

interface WaterStatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
  className?: string;
}

export const WaterStatsCard: React.FC<WaterStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  style,
  className = "",
}) => {
  return (
    <View style={style} className={`bg-white rounded-2xl p-4 shadow-lg ${className}`}>
      {icon && <View className="mb-3">{icon}</View>}
      <View className="flex-1">
        <Text className="text-sm font-medium text-gray-500 mb-1">{title}</Text>
        <Text className="text-2xl font-bold text-primary mb-1">{value}</Text>
        {subtitle && <Text className="text-xs text-gray-400">{subtitle}</Text>}
      </View>
    </View>
  );
};

WaterStatsCard.displayName = "WaterStatsCard";
