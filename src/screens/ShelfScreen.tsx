import {useCallback, useMemo, useRef, useState} from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft, Upload } from 'lucide-react-native';

import type { RootStackParamList } from '../navigation/types';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

import { Book, BookCard } from '../components/BookCard';
import { Shelf } from '../components/ShelfCard';
import { ThemeToggle } from '../components/ThemeToggle';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { ImportBookModal } from '../components/ImportBookModal';
import {useFocusEffect} from "@react-navigation/core";

type R = RouteProp<RootStackParamList, 'Shelf'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'Shelf'>;

export function ShelfScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<R>();
  const { colors } = useTheme();

  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
      useCallback(() => {
        requestAnimationFrame(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        });
        return () => {};
      }, [])
  );

  const [isImportOpen, setIsImportOpen] = useState(false);

  const [books, setBooks] = useState<Book[]>(() => [
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
  ]);

  const shelf = useMemo(
    () => shelves.find(s => s.id === route.params.shelfId),
    [shelves, route.params.shelfId],
  );

  const shelfBooks = useMemo(() => books.filter(b => b.shelfId === shelf?.id), [books, shelf?.id]);

  const handleSelectBook = (book: Book) => nav.navigate('Reader', { bookId: book.id });

  const handleImportBook = (data: {
    title: string;
    author: string;
    shelfId: string;
    file: any;
  }) => {
    const id = `b${Date.now()}`;
    const newBook: Book = {
      id,
      title: data.title,
      author: data.author || 'Unknown',
      coverColor: '#3A6073',
      progress: 0,
      shelfId: data.shelfId,
    };
    setBooks(prev => [newBook, ...prev]);
    setShelves(prev =>
      prev.map(s => (s.id === data.shelfId ? { ...s, bookIds: [id, ...s.bookIds] } : s)),
    );
    setIsImportOpen(false);
  };

  if (!shelf) {
    return (
      <View
        style={[
          styles.screen,
          { backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
        ]}
      >
        <Text style={{ color: colors.text.primary }}>Shelf not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      {/* Nav bar */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => nav.goBack()}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}
        >
          <ArrowLeft size={20} color={colors.text.secondary} />
          <Text style={[styles.backText, { color: colors.text.secondary }]}>Library</Text>
        </Pressable>

        <ThemeToggle />
      </View>

      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text.primary }]}>{shelf.name}</Text>
        <Text style={[styles.sub, { color: colors.text.secondary }]}>{shelf.description}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        data={shelfBooks}
        keyExtractor={b => b.id}
        renderItem={({ item, index }) => (
          <View style={{ marginBottom: 18 }}>
            <BookCard book={item} index={index} onClick={handleSelectBook} />
          </View>
        )}
        ListEmptyComponent={
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Text style={[styles.empty, { color: colors.text.secondary }]}>
              This shelf is empty. Import a book to get started.
            </Text>
          </View>
        }
      />

      <FloatingActionButton
        onClick={() => setIsImportOpen(true)}
        ariaLabel="Import book"
        icon={<Upload size={20} color="#fff" />}
      />

      <ImportBookModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onConfirm={handleImportBook}
        shelves={shelves}
        initialShelfId={shelf.id}
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

  header: { paddingHorizontal: 24, paddingBottom: 12, alignItems: 'center' },
  kicker: {
    fontSize: 16,
    letterSpacing: 4.8,
    textTransform: 'uppercase',
    opacity: 0.8,
    fontWeight: '600',
  },
  title: {
    fontSize: 40,
    fontFamily: tokens.typography.fontFamily.serif,
    letterSpacing: -0.3,
    marginTop: 8,
  },
  sub: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 6,
    fontStyle: 'italic',
    textAlign: 'center',
    maxWidth: 520,
    fontFamily: tokens.typography.fontFamily.serif,
  },

  list: { paddingHorizontal: 24, paddingBottom: 120 },

  empty: {
    fontFamily: tokens.typography.fontFamily.serif,
    fontStyle: 'italic',
    opacity: 0.6,
    textAlign: 'center',
  },
});
