import React, { useState, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  required?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  animated?: boolean;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  variant = 'outlined',
  size = 'medium',
  disabled = false,
  required = false,
  style,
  inputStyle,
  labelStyle,
  animated = true,
  value,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!value);
  const inputRef = useRef<TextInput>(null);

  const focusAnimation = useSharedValue(0);
  const labelAnimation = useSharedValue(hasValue || isFocused ? 1 : 0);
  const borderAnimation = useSharedValue(0);
  const shakeAnimation = useSharedValue(0);

  const animatedContainerStyle = useAnimatedStyle(() => {
    if (!animated) return {};
    
    const borderColor = interpolateColor(
      borderAnimation.value,
      [0, 1],
      [error ? '#FF5252' : '#E0E0E0', error ? '#FF5252' : '#00A86B']
    );

    return {
      borderColor,
      transform: [
        {
          translateX: withSpring(shakeAnimation.value * 10, { damping: 15 }),
        },
      ],
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    if (!animated || !label) return {};
    
    const translateY = withTiming(
      labelAnimation.value === 1 ? -12 : 0,
      { duration: 200 }
    );
    
    const scale = withTiming(
      labelAnimation.value === 1 ? 0.85 : 1,
      { duration: 200 }
    );
    
    const color = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [error ? '#FF5252' : '#757575', error ? '#FF5252' : '#00A86B']
    );

    return {
      transform: [{ translateY }, { scale }],
      color,
    };
  });

  const handleFocus = (e: any) => {
    setIsFocused(true);
    if (animated) {
      focusAnimation.value = withTiming(1, { duration: 200 });
      borderAnimation.value = withTiming(1, { duration: 200 });
      if (label) {
        labelAnimation.value = withTiming(1, { duration: 200 });
      }
    }
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (animated) {
      focusAnimation.value = withTiming(0, { duration: 200 });
      borderAnimation.value = withTiming(0, { duration: 200 });
      if (label && !hasValue) {
        labelAnimation.value = withTiming(0, { duration: 200 });
      }
    }
    onBlur?.(e);
  };

  const handleChangeText = (text: string) => {
    setHasValue(!!text);
    if (animated && label) {
      labelAnimation.value = withTiming(text ? 1 : (isFocused ? 1 : 0), { duration: 200 });
    }
    props.onChangeText?.(text);
  };

  const triggerShake = () => {
    if (!animated) return;
    shakeAnimation.value = withSpring(1, { damping: 8 }, () => {
      shakeAnimation.value = withSpring(0, { damping: 8 });
    });
  };

  React.useEffect(() => {
    if (error && animated) {
      triggerShake();
    }
  }, [error]);

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.container,
      ...styles[`${size}Container`],
    };

    if (disabled) {
      return { ...baseStyle, ...styles.disabled };
    }

    switch (variant) {
      case 'filled':
        return { ...baseStyle, ...styles.filled };
      case 'underlined':
        return { ...baseStyle, ...styles.underlined };
      default:
        return { ...baseStyle, ...styles.outlined };
    }
  };

  const getInputStyle = (): TextStyle => {
    return {
      ...styles.input,
      ...styles[`${size}Input`],
      ...(leftIcon && styles.inputWithLeftIcon),
      ...(rightIcon && styles.inputWithRightIcon),
    };
  };

  return (
    <View style={[styles.wrapper, style]}>
      {label && variant !== 'underlined' && (
        <Animated.Text
          style={[
            styles.label,
            styles[`${size}Label`],
            animatedLabelStyle,
            labelStyle,
          ]}
        >
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Animated.Text>
      )}
      
      <Animated.View style={[getContainerStyle(), animatedContainerStyle]}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
            color={isFocused ? '#00A86B' : '#757575'}
            style={styles.leftIcon}
          />
        )}
        
        <AnimatedTextInput
          ref={inputRef}
          style={[getInputStyle(), inputStyle]}
          value={value}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChangeText={handleChangeText}
          editable={!disabled}
          placeholderTextColor={disabled ? '#BDBDBD' : '#9E9E9E'}
          {...props}
        />
        
        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={disabled}
          >
            <Icon
              name={rightIcon}
              size={size === 'small' ? 18 : size === 'large' ? 24 : 20}
              color={isFocused ? '#00A86B' : '#757575'}
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {(error || helperText) && (
        <Text style={[styles.helperText, error && styles.errorText]}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  smallContainer: {
    minHeight: 40,
    paddingHorizontal: 12,
  },
  mediumContainer: {
    minHeight: 48,
    paddingHorizontal: 16,
  },
  largeContainer: {
    minHeight: 56,
    paddingHorizontal: 20,
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
  },
  filled: {
    backgroundColor: '#F5F5F5',
    borderWidth: 0,
  },
  underlined: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 0,
  },
  disabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  input: {
    flex: 1,
    color: '#212121',
    fontWeight: '400',
  },
  smallInput: {
    fontSize: 14,
  },
  mediumInput: {
    fontSize: 16,
  },
  largeInput: {
    fontSize: 18,
  },
  inputWithLeftIcon: {
    marginLeft: 8,
  },
  inputWithRightIcon: {
    marginRight: 8,
  },
  label: {
    position: 'absolute',
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 4,
    fontWeight: '500',
    zIndex: 1,
  },
  smallLabel: {
    fontSize: 12,
  },
  mediumLabel: {
    fontSize: 14,
  },
  largeLabel: {
    fontSize: 16,
  },
  required: {
    color: '#FF5252',
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIconContainer: {
    padding: 4,
  },
  helperText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    marginLeft: 16,
  },
  errorText: {
    color: '#FF5252',
  },
});

export default Input;