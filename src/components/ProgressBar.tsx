import React from "react";
import { Animated, View } from "react-native";

interface ProgressBarProps {
  progress: number; // 0 to 100
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 8,
  backgroundColor = "#E5E7EB",
  progressColor = "#00C2CB",
  animated = true,
  className = "",
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: Math.min(progress, 100),
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      animatedValue.setValue(Math.min(progress, 100));
    }
  }, [progress, animated, animatedValue]);

  return (
    <View
      className={`rounded-full overflow-hidden ${className}`}
      style={{
        height,
        backgroundColor,
      }}
    >
      <Animated.View
        className="rounded-full"
        style={{
          height,
          backgroundColor: progressColor,
          width: animatedValue.interpolate({
            inputRange: [0, 100],
            outputRange: ["0%", "100%"],
            extrapolate: "clamp",
          }),
        }}
      />
    </View>
  );
};

ProgressBar.displayName = "ProgressBar";
