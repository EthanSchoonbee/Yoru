import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

export interface Chapter {
  id: string;
  title: string;
  startWordIndex: number;
}

interface ChapterSelectorProps {
  chapters: Chapter[];
  currentChapter: number;
  onSelectChapter: (chapterIndex: number) => void;
  onClose: () => void;
}

function getPaper3Shadow(): ViewStyle | undefined {
  const raw: unknown = (tokens as any)?.shadows?.paper3;
  if (!raw || typeof raw !== 'object') return undefined;

  const obj = raw as Record<string, unknown>;

  if ('ios' in obj || 'android' in obj || 'web' in obj || 'default' in obj) {
    return Platform.select<ViewStyle>({
      ios: (obj.ios as ViewStyle) ?? undefined,
      android: (obj.android as ViewStyle) ?? undefined,
      web: (obj.web as ViewStyle) ?? undefined,
      default: (obj.default as ViewStyle) ?? undefined,
    });
  }

  return raw as ViewStyle;
}

export function ChapterSelector({
  chapters,
  currentChapter,
  onSelectChapter,
  onClose,
}: ChapterSelectorProps) {
  const { colors } = useTheme();
  const paper3Shadow = useMemo(() => getPaper3Shadow(), []);

  const handlePick = (index: number) => {
    onSelectChapter(index);
    onClose();
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(160)}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        paper3Shadow,
      ]}
    >
      <Text style={[styles.heading, { color: colors.text.primary }]}>Contents</Text>

      <View style={styles.list}>
        {chapters.map((ch, index) => {
          const selected = currentChapter === index;
          const num = String(index + 1).padStart(2, '0');

          return (
            <Pressable
              key={ch.id}
              onPress={() => handlePick(index)}
              style={({ pressed }) => [
                styles.row,
                selected ? styles.rowSelected : null,
                pressed ? styles.rowPressed : null,
              ]}
            >
              <View style={styles.left}>
                <Text
                  style={[
                    styles.rowNumber,
                    { color: selected ? tokens.colors.accent : colors.text.secondary },
                  ]}
                >
                  {num}
                </Text>

                <Text
                  style={[
                    styles.rowText,
                    { color: selected ? tokens.colors.accent : colors.text.primary },
                  ]}
                  numberOfLines={1}
                >
                  {ch.title}
                </Text>
              </View>

              {selected ? <Check size={16} color={tokens.colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // EXACTLY like FontPicker
  container: {
    position: 'absolute',
    right: 0,
    bottom: 96,
    width: 256,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  heading: {
    fontSize: 12,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 14,
    fontFamily: tokens.typography.fontFamily.serif,
  },

  list: { gap: 8 },
  row: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowSelected: { backgroundColor: 'rgba(18,18,18,0.05)' },
  rowPressed: { backgroundColor: 'rgba(18,18,18,0.06)' },

  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    paddingRight: 10,
  },
  rowNumber: {
    width: 26,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  rowText: {
    flex: 1,
    fontSize: 14,
    fontFamily: tokens.typography.fontFamily.serif,
  },
});
