import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
}) => {
  // Base classes
  let buttonClasses = "rounded-xl flex-row items-center justify-center ";
  let textClasses = "font-semibold text-center ";

  // Variant classes
  switch (variant) {
    case "secondary":
      buttonClasses += "bg-secondary ";
      textClasses += "text-white ";
      break;
    case "outline":
      buttonClasses += "border-2 border-primary bg-transparent ";
      textClasses += "text-primary ";
      break;
    default: // primary
      buttonClasses += "bg-primary ";
      textClasses += "text-white ";
  }

  // Size classes
  switch (size) {
    case "sm":
      buttonClasses += "px-4 py-2 min-h-[40px] ";
      textClasses += "text-sm ";
      break;
    case "lg":
      buttonClasses += "px-8 py-4 min-h-[56px] ";
      textClasses += "text-lg ";
      break;
    default: // md
      buttonClasses += "px-6 py-3 min-h-[48px] ";
      textClasses += "text-base ";
  }

  // Disabled state
  if (disabled || loading) {
    buttonClasses += "opacity-50 ";
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${buttonClasses}${className}`}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "outline" ? "#00C2CB" : "#FFFFFF"}
          size="small"
        />
      ) : (
        <Text className={textClasses}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

Button.displayName = "Button";
