import React, { useEffect } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from 'react-native-reanimated';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  type?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale' | 'bounce' | 'flip';
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
  trigger?: boolean;
}

const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  type = 'fadeIn',
  duration = 300,
  delay = 0,
  style,
  onAnimationComplete,
  trigger = true,
}) => {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(0);
  const rotateY = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value },
        { rotateY: `${rotateY.value}deg` },
      ],
    };
  });

  const startAnimation = () => {
    const animationConfig = {
      duration,
      easing: Easing.out(Easing.cubic),
    };

    const springConfig = {
      damping: 15,
      stiffness: 150,
    };

    switch (type) {
      case 'fadeIn':
        opacity.value = withDelay(
          delay,
          withTiming(1, animationConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        scale.value = 1;
        break;

      case 'slideUp':
        translateY.value = 50;
        opacity.value = withDelay(delay, withTiming(1, animationConfig));
        translateY.value = withDelay(
          delay,
          withSpring(0, springConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        scale.value = 1;
        break;

      case 'slideDown':
        translateY.value = -50;
        opacity.value = withDelay(delay, withTiming(1, animationConfig));
        translateY.value = withDelay(
          delay,
          withSpring(0, springConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        scale.value = 1;
        break;

      case 'slideLeft':
        translateX.value = 50;
        opacity.value = withDelay(delay, withTiming(1, animationConfig));
        translateX.value = withDelay(
          delay,
          withSpring(0, springConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        scale.value = 1;
        break;

      case 'slideRight':
        translateX.value = -50;
        opacity.value = withDelay(delay, withTiming(1, animationConfig));
        translateX.value = withDelay(
          delay,
          withSpring(0, springConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        scale.value = 1;
        break;

      case 'scale':
        scale.value = 0.5;
        opacity.value = withDelay(delay, withTiming(1, animationConfig));
        scale.value = withDelay(
          delay,
          withSpring(1, springConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        break;

      case 'bounce':
        scale.value = 0;
        opacity.value = withDelay(delay, withTiming(1, animationConfig));
        scale.value = withDelay(
          delay,
          withSequence(
            withSpring(1.2, { damping: 8, stiffness: 200 }),
            withSpring(0.9, { damping: 8, stiffness: 200 }),
            withSpring(1, springConfig, (finished) => {
              if (finished && onAnimationComplete) {
                runOnJS(onAnimationComplete)();
              }
            })
          )
        );
        break;

      case 'flip':
        rotateY.value = -90;
        opacity.value = withDelay(delay, withTiming(1, animationConfig));
        rotateY.value = withDelay(
          delay,
          withSpring(0, springConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        scale.value = 1;
        break;

      default:
        opacity.value = withDelay(
          delay,
          withTiming(1, animationConfig, (finished) => {
            if (finished && onAnimationComplete) {
              runOnJS(onAnimationComplete)();
            }
          })
        );
        scale.value = 1;
        break;
    }
  };

  const resetAnimation = () => {
    opacity.value = 0;
    translateX.value = 0;
    translateY.value = 0;
    scale.value = type === 'scale' || type === 'bounce' ? 0 : 1;
    rotateY.value = type === 'flip' ? -90 : 0;
  };

  useEffect(() => {
    if (trigger) {
      startAnimation();
    } else {
      resetAnimation();
    }
  }, [trigger, type]);

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedTransition;