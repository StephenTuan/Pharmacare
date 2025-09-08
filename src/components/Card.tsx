import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: number;
  margin?: number;
  borderRadius?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  elevation?: number;
  gradient?: boolean;
  gradientColors?: string[];
  animated?: boolean;
  pressable?: boolean;
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 16,
  margin = 8,
  borderRadius = 12,
  shadowColor = '#000',
  shadowOpacity = 0.1,
  elevation = 3,
  gradient = false,
  gradientColors = ['#FFFFFF', '#F8F9FA'],
  animated = true,
  pressable = true,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const rotateX = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    
    return {
      transform: [
        { scale: scale.value },
        { translateY: translateY.value },
        { rotateX: `${rotateX.value}deg` },
      ],
      opacity: opacity.value,
    };
  });

  const shadowStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    
    const shadowElevation = interpolate(
      scale.value,
      [0.95, 1],
      [elevation * 0.5, elevation],
      Extrapolate.CLAMP
    );
    
    return {
      elevation: shadowElevation,
      shadowOpacity: shadowOpacity * scale.value,
    };
  });

  const handlePressIn = () => {
    if (!animated || !pressable) return;
    
    scale.value = withSpring(0.98, { damping: 15 });
    opacity.value = withTiming(0.9, { duration: 100 });
    translateY.value = withSpring(2, { damping: 15 });
  };

  const handlePressOut = () => {
    if (!animated || !pressable) return;
    
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
    translateY.value = withSpring(0, { damping: 15 });
  };

  const handlePress = () => {
    if (!onPress) return;
    
    if (animated && pressable) {
      scale.value = withSpring(0.95, { damping: 15 }, () => {
        scale.value = withSpring(1, { damping: 15 });
      });
      rotateX.value = withSpring(5, { damping: 15 }, () => {
        rotateX.value = withSpring(0, { damping: 15 });
      });
    }
    
    onPress();
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      padding,
      margin,
      borderRadius,
      backgroundColor: '#FFFFFF',
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyle,
          elevation: elevation * 1.5,
          shadowColor,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: shadowOpacity * 1.5,
          shadowRadius: 8,
        };
      case 'outlined':
        return {
          ...baseStyle,
          borderWidth: 1,
          borderColor: '#E0E0E0',
          elevation: 1,
          shadowColor,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: shadowOpacity * 0.5,
          shadowRadius: 2,
        };
      case 'gradient':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          elevation,
          shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity,
          shadowRadius: 4,
        };
      default:
        return {
          ...baseStyle,
          elevation,
          shadowColor,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity,
          shadowRadius: 4,
        };
    }
  };

  const CardContent = () => (
    <View style={styles.content}>
      {children}
    </View>
  );

  if (gradient || variant === 'gradient') {
    const Component = onPress && pressable ? AnimatedTouchableOpacity : AnimatedLinearGradient;
    
    if (onPress && pressable) {
      return (
        <AnimatedTouchableOpacity
          style={[animatedStyle, shadowStyle, getCardStyle(), style]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.gradientContainer, { borderRadius }]}
          >
            <CardContent />
          </LinearGradient>
        </AnimatedTouchableOpacity>
      );
    }
    
    return (
      <AnimatedLinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[animatedStyle, shadowStyle, getCardStyle(), style]}
      >
        <CardContent />
      </AnimatedLinearGradient>
    );
  }

  if (onPress && pressable) {
    return (
      <AnimatedTouchableOpacity
        style={[animatedStyle, shadowStyle, getCardStyle(), style]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <CardContent />
      </AnimatedTouchableOpacity>
    );
  }

  return (
    <AnimatedView style={[animatedStyle, shadowStyle, getCardStyle(), style]}>
      <CardContent />
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
  },
  gradientContainer: {
    flex: 1,
    padding: 0,
  },
});

export default Card;