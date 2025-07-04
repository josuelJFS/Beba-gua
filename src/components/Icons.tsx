import React from "react";
import { View } from "react-native";

interface WaterIconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const WaterIcon: React.FC<WaterIconProps> = ({
  size = 24,
  color = "#00C2CB",
  className = "",
}) => {
  return (
    <View
      className={`rounded-full opacity-80 ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
      }}
    />
  );
};

WaterIcon.displayName = "WaterIcon";

export const CupIcon: React.FC<WaterIconProps> = ({
  size = 24,
  color = "#6B7280",
  className = "",
}) => {
  return (
    <View
      className={`rounded-lg ${className}`}
      style={{
        width: size,
        height: size,
        borderWidth: 2,
        borderColor: color,
        backgroundColor: "transparent",
      }}
    />
  );
};

CupIcon.displayName = "CupIcon";
