import { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  type LayoutChangeEvent,
  type GestureResponderEvent,
} from 'react-native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Bookmark, Plus, Play, Pause, RotateCcw, RotateCw } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

import { FloatingActionButton } from '../components/FloatingActionButton';
import { RadialMenu } from '../components/RadialMenu';
import type { Chapter } from '../components/ChapterSelector';
import type { Book } from '../components/BookCard';

import { tokenizeRsvp, type RsvpMode } from '../utils/rsvp-tokenizer';

type R = RouteProp<RootStackParamList, 'Reader'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Reader'>;

const MOCK_CHAPTERS: Chapter[] = [
  { id: 'ch1', title: 'The Garden at Dusk', startWordIndex: 0 },
  { id: 'ch2', title: 'Shadows and Light', startWordIndex: 50 },
  { id: 'ch3', title: 'The Brush and Ink', startWordIndex: 100 },
  { id: 'ch4', title: 'A Moment of Potential', startWordIndex: 150 },
];

const RAW_CONTENT = `The light from the garden was beginning to fade. Shadows stretched long across the tatami mats, creeping slowly toward the alcove where a single camellia stood in a bamboo vase. He sat perfectly still, listening to the sound of the wind moving through the pine trees outside. It was a sound that seemed to carry the weight of centuries, a whisper of old ghosts and forgotten promises. In the dim light, the ink on the page before him seemed to shimmer, as if the words were still wet, still forming themselves from the void. "Beauty," he thought, "is not in the object itself, but in the patterns of shadows, the light and the darkness, that one thing against another creates." He picked up his brush. The tip was fine, delicate. He dipped it into the inkstone, watching the black liquid pool and swirl. There is a moment before the brush touches the paper when everything is possible. A moment of pure potential. Then, contact. The ink bleeds into the fibers, irrevocable and true.`;

export function ReaderScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<R>();
  const { colors } = useTheme();

  const book = useMemo<Book>(
      () => ({
        id: route.params.bookId,
        title: 'The Garden at Dusk',
        author: 'Jun Arai',
        coverColor: '#3A6073',
        progress: 18,
        isReading: true,
      }),
      [route.params.bookId],
  );

  // ready for your toggle later:
  // - 'clean' = cleaned display + punctuation-based pauses
  // - 'pure'  = stripped + no extra pauses
  const [mode, setMode] = useState<RsvpMode>('clean');

  const TOKENS = useMemo(() => tokenizeRsvp(RAW_CONTENT, mode), [mode]);

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [font, setFont] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Timer should be setTimeout (not setInterval) so we can vary delay per token
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [trackWidth, setTrackWidth] = useState(1);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const wasPlayingRef = useRef(false);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearThumbTimers();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Ensure currentWordIndex never goes out of bounds if mode changes token count
  useEffect(() => {
    setCurrentWordIndex(prev => Math.min(prev, Math.max(0, TOKENS.length - 1)));
    // If tokens change while playing, stop (optional; prevents weird jumps)
    setIsPlaying(false);
  }, [TOKENS.length]);

  const currentChapter = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < MOCK_CHAPTERS.length; i++) {
      if (currentWordIndex >= MOCK_CHAPTERS[i].startWordIndex) idx = i;
    }
    return idx;
  }, [currentWordIndex]);

  const baseDelay = 60000 / wpm;

  // RSVP playback with per-token pause in clean mode
  useEffect(() => {
    const clear = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const scheduleNext = () => {
      const token = TOKENS[currentWordIndex];
      const extra = token?.extraPauseMs ?? 0;
      const wait = baseDelay + extra;

      timeoutRef.current = setTimeout(() => {
        setCurrentWordIndex(prev => {
          if (prev >= TOKENS.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, wait);
    };

    if (isPlaying && !isScrubbing && TOKENS.length > 0) {
      clear();
      scheduleNext();
    } else {
      clear();
    }

    return clear;
  }, [isPlaying, isScrubbing, baseDelay, currentWordIndex, TOKENS]);

  const handlePlayPause = () => {
    if (currentWordIndex >= TOKENS.length - 1) setCurrentWordIndex(0);
    setIsPlaying(p => !p);
  };

  const handleRewind = () => setCurrentWordIndex(p => Math.max(0, p - 10));
  const handleForward = () => setCurrentWordIndex(p => Math.min(TOKENS.length - 1, p + 10));

  const handleChapterSelect = (chapterIndex: number) => {
    const ch = MOCK_CHAPTERS[chapterIndex];
    if (!ch) return;
    setCurrentWordIndex(Math.min(ch.startWordIndex, Math.max(0, TOKENS.length - 1)));
    setIsPlaying(false);
  };

  const fontFamily = useMemo(() => {
    if (font === 'sans') return tokens.typography.fontFamily.sans;
    if (font === 'mono') return tokens.typography.fontFamily.mono;
    return tokens.typography.fontFamily.serif;
  }, [font]);

  const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

  const seekFromX = (x: number) => {
    const ratio = clamp(x / trackWidth, 0, 1);
    const idx = Math.round(ratio * Math.max(0, TOKENS.length - 1));
    setCurrentWordIndex(idx);
  };

  const onTrackLayout = (e: LayoutChangeEvent) => {
    setTrackWidth(Math.max(1, e.nativeEvent.layout.width));
  };

  const onScrubStart = (e: GestureResponderEvent) => {
    wasPlayingRef.current = isPlaying;
    setIsScrubbing(true);
    setIsPlaying(false);

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
    if (wasPlayingRef.current) setIsPlaying(true);

    hideThumbIn(1500);
  };

  useEffect(() => {
    if (isMenuOpen && isPlaying) {
      setIsPlaying(false);
    }
  }, [isMenuOpen, isPlaying]);

  const progressPct =
      TOKENS.length <= 1 ? 0 : (currentWordIndex / (TOKENS.length - 1)) * 100;

  const currentText = TOKENS[currentWordIndex]?.text ?? '';

  // Calculate ORP index based on word length
  const getOrpIndex = (word: string): number => {
    const len = word.length;
    if (len <= 2) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
  };

  // Split word into before, highlight, and after parts
  const wordParts = useMemo(() => {
    if (!currentText) return { before: '', highlight: '', after: '' };

    const orpIndex = getOrpIndex(currentText);
    const before = currentText.slice(0, orpIndex);
    const highlight = currentText[orpIndex] || '';
    const after = currentText.slice(orpIndex + 1);

    return { before, highlight, after };
  }, [currentText]);

  return (
      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {/* Nav */}
        <View style={styles.nav}>
          <Pressable
              onPress={() => nav.goBack()}
              style={({ pressed }) => [styles.backBtn, pressed ? { opacity: 0.8 } : null]}
          >
            <ArrowLeft size={20} color={colors.text.secondary} />
            <Text style={[styles.backText, { color: colors.text.secondary }]}>Return</Text>
          </Pressable>

          <View style={styles.navRight}>
            <Text style={[styles.bookTitle, { color: colors.text.secondary }]} numberOfLines={1}>
              {book.title}
            </Text>
            <Pressable style={({ pressed }) => [styles.bookmarkBtn, pressed ? { opacity: 0.8 } : null]}>
              <Bookmark size={20} color={tokens.colors.accent} />
            </Pressable>
          </View>
        </View>

        {/* Guides */}
        <View pointerEvents="none" style={styles.guidesH}>
          <View style={[styles.guideTickH, { backgroundColor: colors.text.primary }]} />
          <View style={[styles.guideTickH, { backgroundColor: colors.text.primary }]} />
        </View>
        <View pointerEvents="none" style={styles.guidesV}>
          <View style={[styles.guideTickV, { backgroundColor: colors.text.primary }]} />
          <View style={[styles.guideTickV, { backgroundColor: colors.text.primary }]} />
        </View>

        {/* Chapter indicator */}
        <View style={styles.chapter}>
          <Text style={[styles.chapterText, { color: colors.text.secondary }]} numberOfLines={1}>
            {MOCK_CHAPTERS[currentChapter]?.title}
          </Text>
        </View>

        {/* Word with ORP highlighting */}
        <View style={styles.wordArea}>
          <View style={styles.wordContainer}>
            <Text style={[styles.word, { color: colors.text.primary, fontFamily }]}>
              <Text>{wordParts.before}</Text>
              <Text style={{ color: tokens.colors.accent }}>{wordParts.highlight}</Text>
              <Text>{wordParts.after}</Text>
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View
              onLayout={onTrackLayout}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={onScrubStart}
              onResponderMove={onScrubMove}
              onResponderRelease={onScrubEnd}
              onResponderTerminate={onScrubEnd}
              style={[styles.progressHit, { backgroundColor: 'transparent' }]}
          >
            <View style={[styles.progressTrack, { backgroundColor: 'rgba(90,90,90,0.20)' }]}>
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

          <View style={styles.buttons}>
            <Pressable
                onPress={handleRewind}
                style={({ pressed }) => [
                  styles.smallBtn,
                  pressed ? { backgroundColor: 'rgba(18,18,18,0.06)' } : null,
                ]}
            >
              <RotateCcw size={22} color={colors.text.secondary} />
            </Pressable>

            <Pressable
                onPress={handlePlayPause}
                style={({ pressed }) => [
                  styles.playBtn,
                  { backgroundColor: colors.text.primary },
                  pressed ? { opacity: 0.9 } : null,
                ]}
            >
              {isPlaying ? (
                  <Pause size={22} color={colors.background} />
              ) : (
                  <Play size={22} color={colors.background} style={{ marginLeft: 2 }} />
              )}
            </Pressable>

            <Pressable
                onPress={handleForward}
                style={({ pressed }) => [
                  styles.smallBtn,
                  pressed ? { backgroundColor: 'rgba(18,18,18,0.06)' } : null,
                ]}
            >
              <RotateCw size={22} color={colors.text.secondary} />
            </Pressable>
          </View>
        </View>

        <FloatingActionButton
            onClick={() => setIsMenuOpen(p => !p)}
            isOpen={isMenuOpen}
            ariaLabel="Reading options"
            icon={<Plus size={24} color="#fff" />}
        />

        <RadialMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            wpm={wpm}
            onWpmChange={setWpm}
            font={font}
            onFontChange={f => setFont(f as any)}
            chapters={MOCK_CHAPTERS}
            currentChapter={currentChapter}
            onChapterSelect={handleChapterSelect}
        />
      </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  nav: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 12,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontFamily: tokens.typography.fontFamily.serif,
    opacity: 0.8,
  },

  navRight: { flexDirection: 'row', alignItems: 'center', gap: 12, maxWidth: '60%' },
  bookTitle: { fontSize: 12, opacity: 0.6, fontFamily: tokens.typography.fontFamily.serif },
  bookmarkBtn: { padding: 6 },

  guidesH: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.08,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  guideTickH: { width: 16, height: 2 },
  guidesV: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    width: 2,
    opacity: 0.08,
    justifyContent: 'space-between',
    paddingVertical: 32,
  },
  guideTickV: { width: 2, height: 16 },

  chapter: { position: 'absolute', top: 120, left: 0, right: 0, alignItems: 'center' },
  chapterText: {
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    opacity: 0.4,
    fontFamily: tokens.typography.fontFamily.serif,
  },

  wordArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24
  },
  wordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  word: {
    fontSize: 56,
    lineHeight: 64,
    textAlign: 'center',
  },

  controls: { position: 'absolute', left: 24, right: 24, bottom: 140, gap: 18 },

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

  buttons: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  smallBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});