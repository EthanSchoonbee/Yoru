import { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, type ViewStyle } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

interface FontPickerProps {
  currentFont: string;
  onChange: (font: string) => void;
  onClose: () => void;
}

const FONTS = [
  { id: 'serif', name: 'Serif' },
  { id: 'sans', name: 'Sans' },
  { id: 'mono', name: 'Mono' },
] as const;

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

  // single style object case
  return raw as ViewStyle;
}

export function FontPicker({ currentFont, onChange }: FontPickerProps) {
  const { colors } = useTheme();

  const paper3Shadow = useMemo(() => getPaper3Shadow(), []);

  const fontFamilyFor = useMemo(() => {
    return (id: (typeof FONTS)[number]['id']) => {
      if (id === 'sans') return tokens.typography.fontFamily.sans;
      if (id === 'mono') return tokens.typography.fontFamily.mono;
      return tokens.typography.fontFamily.serif;
    };
  }, []);

  return (
    <Animated.View
      entering={FadeInDown.duration(180)}
      exiting={FadeOutDown.duration(160)}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
        paper3Shadow, // ✅ never a string
      ]}
    >
      <Text style={[styles.heading, { color: colors.text.primary }]}>Typography</Text>

      <View style={styles.list}>
        {FONTS.map(f => {
          const selected = currentFont === f.id;

          return (
            <Pressable
              key={f.id}
              onPress={() => onChange(f.id)}
              style={({ pressed }) => [
                styles.row,
                selected ? styles.rowSelected : null,
                pressed ? styles.rowPressed : null,
              ]}
            >
              <Text
                style={[
                  styles.rowText,
                  { fontFamily: fontFamilyFor(f.id) },
                  selected ? { color: tokens.colors.accent } : null,
                ]}
              >
                {f.name}
              </Text>

              {selected ? <Check size={16} color={tokens.colors.accent} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 0,
    bottom: 96,
    width: 256,
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
    zIndex: 60,
    elevation: 12,
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
  rowText: { fontSize: 16 },
});
