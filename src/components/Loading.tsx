import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from 'react-native-linear-gradient';

interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  secondaryColor?: string;
  type?: 'spinner' | 'dots' | 'pulse' | 'wave' | 'gradient';
  style?: ViewStyle;
}

const { width } = Dimensions.get('window');

const Loading: React.FC<LoadingProps> = ({
  size = 'medium',
  color = '#00A86B',
  secondaryColor = '#00C851',
  type = 'spinner',
  style,
}) => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 24;
      case 'large':
        return 64;
      default:
        return 40;
    }
  };

  useEffect(() => {
    if (type === 'spinner') {
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 1000,
          easing: Easing.linear,
        }),
        -1
      );
    } else if (type === 'pulse') {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1
      );
    }
  }, [type]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const renderSpinner = () => {
    const sizeValue = getSizeValue();
    return (
      <Animated.View style={[animatedStyle]}>
        <View
          style={[
            styles.spinner,
            {
              width: sizeValue,
              height: sizeValue,
              borderWidth: sizeValue / 8,
              borderTopColor: color,
              borderRightColor: 'transparent',
              borderBottomColor: 'transparent',
              borderLeftColor: 'transparent',
            },
          ]}
        />
      </Animated.View>
    );
  };

  const renderDots = () => {
    const dots = [0, 1, 2];
    const sizeValue = getSizeValue() / 4;

    return (
      <View style={styles.dotsContainer}>
        {dots.map((index) => {
          const DotComponent = () => {
            const dotScale = useSharedValue(1);
            const dotOpacity = useSharedValue(1);

            const dotAnimatedStyle = useAnimatedStyle(() => {
              return {
                transform: [{ scale: dotScale.value }],
                opacity: dotOpacity.value,
              };
            });

            useEffect(() => {
              dotScale.value = withRepeat(
                withDelay(
                  index * 200,
                  withSequence(
                    withTiming(1.5, { duration: 400 }),
                    withTiming(1, { duration: 400 })
                  )
                ),
                -1
              );
              dotOpacity.value = withRepeat(
                withDelay(
                  index * 200,
                  withSequence(
                    withTiming(0.3, { duration: 400 }),
                    withTiming(1, { duration: 400 })
                  )
                ),
                -1
              );
            }, []);

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: sizeValue,
                    height: sizeValue,
                    backgroundColor: color,
                  },
                  dotAnimatedStyle,
                ]}
              />
            );
          };

          return <DotComponent key={index} />;
        })}
      </View>
    );
  };

  const renderPulse = () => {
    const sizeValue = getSizeValue();
    return (
      <Animated.View
        style={[
          styles.pulse,
          {
            width: sizeValue,
            height: sizeValue,
            backgroundColor: color,
          },
          animatedStyle,
        ]}
      />
    );
  };

  const renderWave = () => {
    const bars = [0, 1, 2, 3, 4];
    const sizeValue = getSizeValue();

    return (
      <View style={styles.waveContainer}>
        {bars.map((index) => {
          const BarComponent = () => {
            const barHeight = useSharedValue(sizeValue / 4);

            const barAnimatedStyle = useAnimatedStyle(() => {
              return {
                height: barHeight.value,
              };
            });

            useEffect(() => {
              barHeight.value = withRepeat(
                withDelay(
                  index * 100,
                  withSequence(
                    withTiming(sizeValue, { duration: 400 }),
                    withTiming(sizeValue / 4, { duration: 400 })
                  )
                ),
                -1
              );
            }, []);

            return (
              <Animated.View
                key={index}
                style={[
                  styles.bar,
                  {
                    width: sizeValue / 8,
                    backgroundColor: color,
                  },
                  barAnimatedStyle,
                ]}
              />
            );
          };

          return <BarComponent key={index} />;
        })}
      </View>
    );
  };

  const renderGradient = () => {
    const sizeValue = getSizeValue();
    return (
      <Animated.View style={[animatedStyle]}>
        <LinearGradient
          colors={[color, secondaryColor, color]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              width: sizeValue,
              height: sizeValue,
            },
          ]}
        >
          <View
            style={[
              styles.gradientInner,
              {
                width: sizeValue - 4,
                height: sizeValue - 4,
              },
            ]}
          />
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderLoading = () => {
    switch (type) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'wave':
        return renderWave();
      case 'gradient':
        return renderGradient();
      default:
        return renderSpinner();
    }
  };

  return (
    <View style={[styles.container, style]}>
      {renderLoading()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    borderRadius: 50,
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    borderRadius: 50,
    marginHorizontal: 2,
  },
  pulse: {
    borderRadius: 50,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  bar: {
    marginHorizontal: 1,
    borderRadius: 2,
  },
  gradient: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientInner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
  },
});

export default Loading;