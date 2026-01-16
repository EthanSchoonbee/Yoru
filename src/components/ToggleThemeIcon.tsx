import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../providers/ThemeProviders';

export function ThemeToggleIcon({ size = 24, color }: { size?: number; color?: string }) {
  const { theme, colors } = useTheme();

  const iconColor = color ?? colors.text.primary;

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(theme === 'light' ? '0deg' : '180deg', { duration: 250 }) }],
    opacity: withTiming(theme === 'light' ? 1 : 0, { duration: 180 }),
  }));

  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(theme === 'dark' ? '0deg' : '-180deg', { duration: 250 }) }],
    opacity: withTiming(theme === 'dark' ? 1 : 0, { duration: 180 }),
  }));

  return (
    <>
      <Animated.View style={[styles.iconWrap, sunStyle]}>
        <Sun size={size} color={iconColor} />
      </Animated.View>
      <Animated.View style={[styles.iconWrap, moonStyle]}>
        <Moon size={size} color={iconColor} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
