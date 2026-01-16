import {useEffect, useMemo, useState} from 'react';
import { View, Text, StyleSheet, Pressable, type ColorValue } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverColor: string;
  progress: number;
  isReading?: boolean;
  japaneseTitle?: string;
  shelfId?: string;
}

interface BookCardProps {
  book: Book;
  onClick: (book: Book) => void;
  index: number;
}

// expo-linear-gradient wants at least 2 colors
type GradientColors = readonly [ColorValue, ColorValue, ...ColorValue[]];

// ✅ accept readonly input, so narrowing to readonly tuple is legal
function isGradientColors(arr: readonly ColorValue[]): arr is GradientColors {
  return arr.length >= 2;
}

function parseLinearGradient(input: string): { colors: GradientColors; angleDeg?: number } | null {
  const s = input.trim();
  if (!s.startsWith('linear-gradient')) return null;

  const inside = s.slice(s.indexOf('(') + 1, s.lastIndexOf(')'));
  const parts = inside.split(',').map(p => p.trim());

  let angleDeg: number | undefined;
  let colorParts = parts;

  if (parts[0]?.endsWith('deg')) {
    const n = Number(parts[0].replace('deg', '').trim());
    if (!Number.isNaN(n)) angleDeg = n;
    colorParts = parts.slice(1);
  }

  const colorsRaw = colorParts.map(p => p.split(' ').filter(Boolean)[0]).filter(Boolean);

  // ✅ make it readonly so the predicate matches
  const colors = colorsRaw as readonly ColorValue[];

  if (!isGradientColors(colors)) return null;

  // ✅ after the guard, TS knows it's the tuple type
  return { colors, angleDeg };
}

function gradientPoints(angleDeg = 90) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const x = Math.cos(rad);
  const y = Math.sin(rad);
  return {
    start: { x: 0.5 - x / 2, y: 0.5 - y / 2 },
    end: { x: 0.5 + x / 2, y: 0.5 + y / 2 },
  };
}

export function BookCard({ book, onClick, index }: BookCardProps) {
  const { colors } = useTheme();
  const [pressed, setPressed] = useState(false);

  const grad = useMemo(() => parseLinearGradient(book.coverColor), [book.coverColor]);
  const progressClamped = Math.max(0, Math.min(100, book.progress));

  const w = useSharedValue(0);
  useEffect(() => {
    const delayMs = 400 + index * 100;
    const t = setTimeout(() => {
      w.value = withTiming(progressClamped, { duration: 500 });
    }, delayMs);
    return () => clearTimeout(t);
  }, [progressClamped, index, w]);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${w.value}%`,
    opacity: progressClamped > 0 ? 0.6 : 0,
  }));

  return (
    <Animated.View
      style={[
        styles.card,
        { backgroundColor: colors.surface, aspectRatio: 3 / 4 },
        pressed ? styles.cardPressed : null,
      ]}
    >
      <Pressable
        onPress={() => onClick(book)}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        style={styles.pressArea}
      >
        <View style={styles.coverWrap}>
          {grad ? (
            <LinearGradient
              colors={grad.colors}
              {...gradientPoints(grad.angleDeg ?? 90)}
              style={styles.cover}
            >
              <CoverContent book={book} />
            </LinearGradient>
          ) : (
            <View style={[styles.cover, { backgroundColor: book.coverColor || '#999' }]}>
              <CoverContent book={book} />
            </View>
          )}
        </View>

        <View style={[styles.info, { backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={2}>
              {book.title}
            </Text>
            <Text style={[styles.author, { color: colors.text.secondary }]} numberOfLines={1}>
              {book.author}
            </Text>
          </View>

          <View style={styles.progressWrap}>
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(90,90,90,0.20)' }]}>
              <Animated.View
                style={[
                  styles.progressFill,
                  book.isReading
                    ? { backgroundColor: tokens.colors.accent }
                    : { backgroundColor: colors.text.primary },
                  progressStyle,
                ]}
              />
            </View>

            {progressClamped > 0 ? (
              <Text style={[styles.progressText, { color: colors.text.secondary }]}>
                {progressClamped}%
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function CoverContent({ book }: { book: Book }) {
  return (
    <>
      {!!book.japaneseTitle ? (
        <Text style={styles.jpTitle} numberOfLines={6}>
          {book.japaneseTitle}
        </Text>
      ) : null}

      {!!book.isReading ? (
        <View style={styles.hanko}>
          <Text style={styles.hankoText}>読中</Text>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ translateY: -2 }],
  },
  pressArea: { flex: 1 },

  coverWrap: { flex: 2 },
  cover: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },

  jpTitle: {
    position: 'absolute',
    right: 12,
    top: 18,
    color: 'rgba(255,255,255,0.8)',
    opacity: 0.6,
    fontSize: 16,
    letterSpacing: 3,
    transform: [{ rotate: '90deg' }],
    fontFamily: tokens.typography.fontFamily.serif,
  },

  hanko: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 40,
    height: 40,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: tokens.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '20deg' }],
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  hankoText: {
    color: tokens.colors.accent,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: tokens.typography.fontFamily.serif,
  },

  info: { flex: 1, paddingHorizontal: 20, paddingVertical: 18, justifyContent: 'space-between' },

  title: {
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4,
    fontFamily: tokens.typography.fontFamily.serif,
  },
  author: { fontSize: 14, fontWeight: '300' },

  progressWrap: { marginTop: 12 },
  progressTrack: { width: '100%', height: 2, borderRadius: 999, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 999 },
  progressText: { marginTop: 6, fontSize: 10, textAlign: 'right', opacity: 0.6 },
});
