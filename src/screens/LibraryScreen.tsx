import {useCallback, useMemo, useRef, useState} from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

import { Shelf, ShelfCard } from '../components/ShelfCard';
import { Book } from '../components/BookCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { ThemeToggle } from '../components/ThemeToggle';
import { AddShelfModal } from '../components/AddShelfModal';
import {useFocusEffect} from "@react-navigation/core";

type Nav = NativeStackNavigationProp<RootStackParamList, 'Library'>;

export function LibraryScreen() {
  const nav = useNavigation<Nav>();
  const { colors } = useTheme();

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [books] = useState<Book[]>(() => [
    {
      id: 'b1',
      title: 'The Garden at Dusk',
      author: 'Jun Arai',
      coverColor: 'linear-gradient(135deg, #2C3E50, #4CA1AF)',
      progress: 18,
      isReading: true,
      japaneseTitle: '夕暮れの庭',
      shelfId: 's1',
    },
    {
      id: 'b2',
      title: 'Shadows and Light',
      author: 'Mika Sato',
      coverColor: '#8E2DE2',
      progress: 0,
      shelfId: 's1',
    },
    {
      id: 'b3',
      title: 'The Brush and Ink',
      author: 'K. Tanaka',
      coverColor: '#1F4037',
      progress: 72,
      shelfId: 's2',
    },
  ]);

  const [shelves, setShelves] = useState<Shelf[]>(() => [
    {
      id: 's1',
      name: 'Classics',
      japaneseName: '古典',
      description: 'Timeless works',
      bookIds: ['b1', 'b2'],
    },
    {
      id: 's2',
      name: 'Modern',
      japaneseName: '現代',
      description: 'Contemporary reads',
      bookIds: ['b3'],
    },
    { id: 's3', name: 'New Shelf', japaneseName: '新', description: 'Empty', bookIds: [] },
  ]);

  const handleSelectShelf = (shelf: Shelf) => nav.navigate('Shelf', { shelfId: shelf.id });

  const handleCreateShelf = (name: string, description: string) => {
    const id = `s${Date.now()}`;
    setShelves(prev => [{ id, name, description, bookIds: [] }, ...prev]);
    setIsAddOpen(false);
  };

  const data = useMemo(() => shelves, [shelves]);

  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
      useCallback(() => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        });
        return () => {};
      }, [])
  );

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.topRight}>
        <ThemeToggle />
      </View>

      <View style={styles.header}>
        <Text style={[styles.kicker, { color: tokens.colors.accent }]}>Library Overview</Text>
        <Text style={[styles.sub, { color: colors.text.secondary }]}>Your Shelves:</Text>
      </View>

      <FlatList
        ref={flatListRef}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        data={data}
        keyExtractor={s => s.id}
        numColumns={1}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 18 }}>
            <ShelfCard shelf={item} books={books} index={index} onClick={handleSelectShelf} />
          </View>
        )}
      />

      <FloatingActionButton onClick={() => setIsAddOpen(true)} ariaLabel="Add new shelf" />

      <AddShelfModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onConfirm={handleCreateShelf}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  topRight: { position: 'absolute', top: 18, right: 18, zIndex: 10 },

  header: { paddingTop: 72, paddingHorizontal: 24, paddingBottom: 18, alignItems: 'center' },
  kicker: {
    fontSize: 16,
    letterSpacing: 4.8,
    textTransform: 'uppercase',
    opacity: 0.8,
    fontWeight: '600',
  },
  title: {
    fontSize: 52,
    fontFamily: tokens.typography.fontFamily.serif,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  sub: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 6,
    fontStyle: 'italic',
    fontFamily: tokens.typography.fontFamily.serif,
  },

  list: { paddingHorizontal: 24, paddingBottom: 120 },
});
