import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Minus, Plus } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

interface WPMControlProps {
  wpm: number;
  onChange: (wpm: number) => void;
  onClose: () => void;
}

const MIN_WPM = 100;
const MAX_WPM = 600;

export function WPMControl({ wpm, onChange }: WPMControlProps) {
  const { colors } = useTheme();

  const [trackWidth, setTrackWidth] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);

  const [thumbMounted, setThumbMounted] = useState(false);
  const thumbHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const thumbUnmountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const thumbScale = useSharedValue(0);
  const thumbOpacity = useSharedValue(0);

  const thumbAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -5 }, { scale: thumbScale.value }],
    opacity: thumbOpacity.value,
  }));

  const clearThumbTimers = () => {
    if (thumbHideTimerRef.current) {
      clearTimeout(thumbHideTimerRef.current);
      thumbHideTimerRef.current = null;
    }
    if (thumbUnmountTimerRef.current) {
      clearTimeout(thumbUnmountTimerRef.current);
      thumbUnmountTimerRef.current = null;
    }
  };

  const showThumbNow = () => {
    clearThumbTimers();

    setThumbMounted(true);

    thumbScale.value = withTiming(1, { duration: 140, easing: Easing.out(Easing.cubic) });
    thumbOpacity.value = withTiming(1, { duration: 120, easing: Easing.out(Easing.cubic) });
  };

  const hideThumbIn = (ms: number) => {
    clearThumbTimers();

    thumbHideTimerRef.current = setTimeout(() => {
      thumbScale.value = withTiming(0, { duration: 160, easing: Easing.in(Easing.cubic) });
      thumbOpacity.value = withTiming(0, { duration: 140, easing: Easing.in(Easing.cubic) });

      thumbUnmountTimerRef.current = setTimeout(() => {
        setThumbMounted(false);
        thumbUnmountTimerRef.current = null;
      }, 170);
      thumbHideTimerRef.current = null;
    }, ms);
  };

  useEffect(() => {
    return () => {
      clearThumbTimers();
    };
  }, []);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const seekFromX = (x: number) => {
    const ratio = clamp(x / trackWidth, 0, 1);
    const value = Math.round(MIN_WPM + ratio * (MAX_WPM - MIN_WPM));
    const snapped = Math.round(value / 10) * 10; // Snap to 10s
    onChange(snapped);
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(Math.max(1, e.nativeEvent.layout.width));
  };

  const onScrubStart = (e: GestureResponderEvent) => {
    setIsScrubbing(true);
    showThumbNow();
    seekFromX(e.nativeEvent.locationX);
  };

  const onScrubMove = (e: GestureResponderEvent) => {
    if (!isScrubbing) return;
    showThumbNow();
    seekFromX(e.nativeEvent.locationX);
  };

  const onScrubEnd = () => {
    setIsScrubbing(false);
    hideThumbIn(1500);
  };

  const progressPct = ((wpm - MIN_WPM) / (MAX_WPM - MIN_WPM)) * 100;

  return (
      <Animated.View
          entering={FadeInDown.duration(180)}
          exiting={FadeOutDown.duration(160)}
          style={[
            styles.container,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text.primary }]}>Reading Speed</Text>
          <Text style={[styles.value, { color: tokens.colors.accent }]}>{wpm} WPM</Text>
        </View>

        <View style={styles.row}>
          <Pressable
              onPress={() => onChange(Math.max(MIN_WPM, wpm - 10))}
              style={({ pressed }) => [
                styles.circleBtn,
                { borderColor: colors.border },
                pressed ? styles.pressed : null,
              ]}
          >
            <Minus size={16} color={colors.text.secondary} />
          </Pressable>

          <View style={styles.sliderWrap}>
            <View
                onLayout={onTrackLayout}
                onStartShouldSetResponder={() => true}
                onMoveShouldSetResponder={() => true}
                onResponderGrant={onScrubStart}
                onResponderMove={onScrubMove}
                onResponderRelease={onScrubEnd}
                onResponderTerminate={onScrubEnd}
                style={styles.progressHit}
            >
              <View style={[styles.progressTrack, { backgroundColor: 'rgba(90,90,90,0.25)' }]}>
                <View
                    style={[
                      styles.progressFill,
                      { width: `${progressPct}%`, backgroundColor: tokens.colors.accent },
                    ]}
                />
              </View>

              {thumbMounted ? (
                  <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.progressThumb,
                        {
                          left: `${progressPct}%`,
                          backgroundColor: tokens.colors.accent,
                        },
                        thumbAnimStyle,
                      ]}
                  />
              ) : null}
            </View>
          </View>

          <Pressable
              onPress={() => onChange(Math.min(MAX_WPM, wpm + 10))}
              style={({ pressed }) => [
                styles.circleBtn,
                { borderColor: colors.border },
                pressed ? styles.pressed : null,
              ]}
          >
            <Plus size={16} color={colors.text.secondary} />
          </Pressable>
        </View>
      </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 96,
    width: 288,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontFamily: tokens.typography.fontFamily.serif,
  },
  value: { fontSize: 12, fontWeight: '600' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.8 },

  sliderWrap: { flex: 1 },

  progressHit: { paddingVertical: 10 },
  progressTrack: { height: 4, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%' },

  progressThumb: {
    position: 'absolute',
    top: 8,
    width: 10,
    height: 10,
    borderRadius: 999,
  },
});