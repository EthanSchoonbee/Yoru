import { Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Moon, Sun } from 'lucide-react-native';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

export function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  const sunStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(theme === 'light' ? '0deg' : '180deg', { duration: 250 }) }],
    opacity: withTiming(theme === 'light' ? 1 : 0, { duration: 180 }),
  }));

  const moonStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: withTiming(theme === 'dark' ? '0deg' : '-180deg', { duration: 250 }) }],
    opacity: withTiming(theme === 'dark' ? 1 : 0, { duration: 180 }),
  }));

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityLabel={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}
    >
      <Animated.View style={[styles.iconWrap, sunStyle]}>
        <Sun size={20} color={colors.text.primary} />
      </Animated.View>
      <Animated.View style={[styles.iconWrap, moonStyle]}>
        <Moon size={20} color={colors.text.primary} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 40,
    height: 40,
    borderRadius: tokens.radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  iconWrap: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
