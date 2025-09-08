import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  gradient?: boolean;
  colors?: string[];
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  gradient = false,
  colors = ['#00A86B', '#00C851'],
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      // Add haptic feedback
      scale.value = withSpring(0.9, { damping: 15 }, () => {
        scale.value = withSpring(1, { damping: 15 });
        runOnJS(onPress)();
      });
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`${size}Button`],
      ...(fullWidth && styles.fullWidth),
    };

    if (disabled) {
      return { ...baseStyle, ...styles.disabled };
    }

    switch (variant) {
      case 'primary':
        return { ...baseStyle, ...styles.primary };
      case 'secondary':
        return { ...baseStyle, ...styles.secondary };
      case 'outline':
        return { ...baseStyle, ...styles.outline };
      case 'ghost':
        return { ...baseStyle, ...styles.ghost };
      default:
        return { ...baseStyle, ...styles.primary };
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`${size}Text`],
    };

    if (disabled) {
      return { ...baseStyle, ...styles.disabledText };
    }

    switch (variant) {
      case 'primary':
        return { ...baseStyle, color: '#FFFFFF' };
      case 'secondary':
        return { ...baseStyle, color: '#00A86B' };
      case 'outline':
        return { ...baseStyle, color: '#00A86B' };
      case 'ghost':
        return { ...baseStyle, color: '#00A86B' };
      default:
        return { ...baseStyle, color: '#FFFFFF' };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          color={variant === 'primary' ? '#FFFFFF' : '#00A86B'} 
          size="small" 
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <Icon 
            name={icon} 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color={getTextStyle().color} 
            style={styles.iconLeft}
          />
        )}
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
        {icon && iconPosition === 'right' && (
          <Icon 
            name={icon} 
            size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
            color={getTextStyle().color} 
            style={styles.iconRight}
          />
        )}
      </>
    );
  };

  if (gradient && variant === 'primary' && !disabled) {
    return (
      <AnimatedLinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[animatedStyle, getButtonStyle(), style]}
      >
        <TouchableOpacity
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          style={styles.gradientButton}
        >
          {renderContent()}
        </TouchableOpacity>
      </AnimatedLinearGradient>
    );
  }

  return (
    <AnimatedTouchableOpacity
      style={[animatedStyle, getButtonStyle(), style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </AnimatedTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  smallButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 36,
  },
  mediumButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    minHeight: 48,
  },
  largeButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    minHeight: 56,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: '#00A86B',
  },
  secondary: {
    backgroundColor: '#E8F5E8',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#00A86B',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: '#E0E0E0',
    elevation: 0,
    shadowOpacity: 0,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 14,
  },
  mediumText: {
    fontSize: 16,
  },
  largeText: {
    fontSize: 18,
  },
  disabledText: {
    color: '#9E9E9E',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
  gradientButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
});

export default Button;