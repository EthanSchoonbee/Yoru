import { ReactNode, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Type, Gauge, BookOpen } from 'lucide-react-native';
import { WPMControl } from './WPMControl';
import { FontPicker } from './FontPicker';
import { ChapterSelector, Chapter } from './ChapterSelector';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';
import { ThemeToggleIcon } from './ToggleThemeIcon';

interface RadialMenuProps {
  isOpen: boolean;
  onClose: () => void;
  wpm: number;
  onWpmChange: (wpm: number) => void;
  font: string;
  onFontChange: (font: string) => void;
  chapters?: Chapter[];
  currentChapter?: number;
  onChapterSelect?: (chapterIndex: number) => void;
}

type Panel = 'wpm' | 'font' | 'chapter' | null;

const BTN = 50;
const RADIUS = 140;
const START_DEG = 190;
const END_DEG = 260;

export function RadialMenu({
  isOpen,
  onClose,
  wpm,
  onWpmChange,
  font,
  onFontChange,
  chapters = [],
  currentChapter = 0,
  onChapterSelect,
}: RadialMenuProps) {
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const { theme, toggleTheme} = useTheme();

  const togglePanel = (panel: Exclude<Panel, null>) =>
    setActivePanel(p => (p === panel ? null : panel));

  const handleBackdropPress = () => {
    if (activePanel) setActivePanel(null);
    else onClose();
  };

  const inactiveBg = theme === 'light' ? tokens.colors.dark.surface : tokens.colors.light.surface;
  const inactiveIcon =
    theme === 'light' ? tokens.colors.dark.text.primary : tokens.colors.light.text.primary;

  const activeBg = tokens.colors.accent;
  const activeIcon = '#fff';

  const backdropColor = theme === 'dark' ? tokens.colors.dark.overlay : tokens.colors.light.overlay;

  const items = useMemo(
    () => [
      {
        key: 'wpm',
        active: activePanel === 'wpm',
        onPress: () => togglePanel('wpm'),
        icon: <Gauge size={24} color={activePanel === 'wpm' ? activeIcon : inactiveIcon} />,
      },
      {
        key: 'font',
        active: activePanel === 'font',
        onPress: () => togglePanel('font'),
        icon: <Type size={24} color={activePanel === 'font' ? activeIcon : inactiveIcon} />,
      },
      {
        key: 'chapter',
        active: activePanel === 'chapter',
        onPress: () => togglePanel('chapter'),
        icon: <BookOpen size={24} color={activePanel === 'chapter' ? activeIcon : inactiveIcon} />,
      },
      {
        key: 'theme',
        active: false,
        onPress: toggleTheme,
        icon: <ThemeToggleIcon size={24} color={inactiveIcon} />,
      },
    ],
    [activePanel, inactiveIcon, toggleTheme],
  );

  const positions = useMemo(() => {
    const n = items.length;
    const start = (START_DEG * Math.PI) / 180;
    const end = (END_DEG * Math.PI) / 180;
    const step = n === 1 ? 0 : (end - start) / (n - 1);

    return items.map((_, i) => {
      const a = start + step * i;
      const x = Math.cos(a) * RADIUS;
      const y = Math.sin(a) * RADIUS;

      return {
        right: -x - BTN / 2,
        bottom: -y - BTN / 2,
      };
    });
  }, [items]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop (semi-transparent) */}
      <Animated.View
        entering={FadeIn.duration(140)}
        exiting={FadeOut.duration(140)}
        style={[StyleSheet.absoluteFill, { backgroundColor: backdropColor, zIndex: 40 }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={handleBackdropPress} />
      </Animated.View>

      {/* Buttons cluster */}
      <View style={styles.cluster} pointerEvents="box-none">
        {items.map((item, idx) => (
          <MenuButton
            key={item.key}
            active={item.active}
            onPress={item.onPress}
            style={positions[idx]}
            inactiveBg={inactiveBg}
            activeBg={activeBg}
          >
            {item.icon}
          </MenuButton>
        ))}

        {/* Panels */}
        <View style={styles.panelAnchor} pointerEvents="box-none">
          {activePanel === 'wpm' && (
            <WPMControl wpm={wpm} onChange={onWpmChange} onClose={() => setActivePanel(null)} />
          )}
          {activePanel === 'font' && (
            <FontPicker
              currentFont={font}
              onChange={onFontChange}
              onClose={() => setActivePanel(null)}
            />
          )}
          {activePanel === 'chapter' && onChapterSelect && (
            <ChapterSelector
              chapters={chapters}
              currentChapter={currentChapter}
              onSelectChapter={onChapterSelect}
              onClose={() => setActivePanel(null)}
            />
          )}
        </View>
      </View>
    </>
  );
}

function MenuButton({
  children,
  onPress,
  active,
  style,
  inactiveBg,
  activeBg,
}: {
  children: ReactNode;
  onPress: () => void;
  active: boolean;
  style: any;
  inactiveBg: string;
  activeBg: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuBtn,
        style,
        { backgroundColor: active ? activeBg : inactiveBg },
        pressed && { opacity: 0.85 },
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cluster: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: BTN,
    height: BTN,
    zIndex: 40,
  },
  menuBtn: {
    position: 'absolute',
    width: BTN,
    height: BTN,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  panelAnchor: { position: 'absolute', right: 0, bottom: 0 },
});
