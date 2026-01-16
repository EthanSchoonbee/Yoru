import {ReactNode, useEffect, useRef, useState} from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Plus } from 'lucide-react-native';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  ariaLabel: string;
  isOpen?: boolean;
}

const SIZE = 56;

export function FloatingActionButton({
  onClick,
  icon,
  ariaLabel,
  isOpen = false,
}: FloatingActionButtonProps) {
  const [pressed, setPressed] = useState(false);

  const rotate = useSharedValue(isOpen ? 45 : 0);

  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      rotate.value = isOpen ? 45 : 0; // no animation on mount
      return;
    }

    rotate.value = withSpring(isOpen ? 45 : 0, { stiffness: 300, damping: 20 });
  }, [isOpen, rotate]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value}deg` }, { scale: pressed ? 0.95 : 1 }],
  }));

  return (
    <Animated.View style={[styles.wrap, animStyle]} pointerEvents="box-none">
      <Pressable
        onPress={onClick}
        accessibilityLabel={ariaLabel}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={({ pressed: p }) => [styles.button, (pressed || p) && styles.buttonPressed]}
        hitSlop={10}
      >
        <View style={styles.iconWrap}>{icon ?? <Plus size={24} color="#fff" />}</View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 24, bottom: 24, zIndex: 50 },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: 999,
    backgroundColor: '#C41E3A',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#C41E3A',
        shadowOpacity: 0.28,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 10 },
      default: {},
    }),
  },
  buttonPressed: Platform.select({
    ios: { shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
    android: { elevation: 12 },
    default: {},
  }) as any,
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
