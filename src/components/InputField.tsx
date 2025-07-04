import React from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  className?: string;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  containerStyle,
  inputStyle,
  className = "",
  ...props
}) => {
  return (
    <View style={containerStyle} className={`mb-4 ${className}`}>
      {label && <Text className="text-base font-semibold text-text mb-2">{label}</Text>}
      <TextInput
        style={inputStyle}
        className={`bg-background border rounded-xl px-4 py-3 text-base text-text ${
          error ? "border-error" : "border-gray-200"
        }`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {error && <Text className="text-sm text-error mt-1">{error}</Text>}
    </View>
  );
};

InputField.displayName = "InputField";
