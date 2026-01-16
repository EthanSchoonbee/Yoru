import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Book } from './BookCard';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

export interface Shelf {
  id: string;
  name: string;
  japaneseName?: string;
  description: string;
  bookIds: string[];
}

interface ShelfCardProps {
  shelf: Shelf;
  books: Book[];
  onClick: (shelf: Shelf) => void;
  index: number;
}

export function ShelfCard({ shelf, books, onClick, index }: ShelfCardProps) {
  const { colors } = useTheme();
  const previewBooks = books.filter(b => shelf.bookIds.includes(b.id)).slice(0, 3);

  return (
    <View
      style={[styles.cardWrap, { aspectRatio: 4 / 3 }]}
    >
      <Pressable
        onPress={() => onClick(shelf)}
        style={({ pressed }) => [
          styles.card,
          { backgroundColor: colors.surface },
          pressed && styles.cardPressed,
        ]}
      >
        {/* Preview */}
        <View style={[styles.preview, { backgroundColor: colors.mantel }]}>
          <View style={styles.previewInner}>
            {previewBooks.length > 0 ? (
              previewBooks.map((book, i) => (
                <View
                  key={book.id}
                  style={[
                    styles.previewBook,
                    {
                      backgroundColor: book.coverColor.startsWith('linear-gradient')
                        ? '#777'
                        : book.coverColor,
                      left: 0,
                      top: 0,
                      transform: [
                        { rotate: `${(i - 1) * 5}deg` },
                        { translateX: (i - (previewBooks.length - 1) / 2) * 20 },
                        { translateY: -i * 2 },
                      ],
                    },
                  ]}
                />
              ))
            ) : (
              <View style={styles.empty}>
                <Text style={[styles.emptyText, { color: colors.text.secondary }]}>Empty</Text>
              </View>
            )}
          </View>
        </View>

        {/* Info */}
        <View style={[styles.info, { borderTopColor: colors.border }]}>
          <View>
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: colors.text.primary }]} numberOfLines={1}>
                {shelf.name}
              </Text>
              {!!shelf.japaneseName && (
                <Text style={[styles.jp, { color: colors.text.secondary }]} numberOfLines={1}>
                  {shelf.japaneseName}
                </Text>
              )}
            </View>
            <Text style={[styles.count, { color: colors.text.secondary }]}>
              {shelf.bookIds.length} {shelf.bookIds.length === 1 ? 'book' : 'books'}
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: { width: '100%' },
  card: {
    flex: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  cardPressed: {
    transform: [{ translateY: -2 }],
  },

  preview: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  previewInner: { width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' },

  previewBook: {
    position: 'absolute',
    width: 80,
    height: 112,
    borderRadius: 6,
  },

  empty: {
    width: 80,
    height: 112,
    borderRadius: 6,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(90,90,90,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: { fontSize: 12, opacity: 0.5 },

  info: {
    height: 80,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    justifyContent: 'center',
  },

  titleRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },

  title: { fontSize: 18, fontFamily: tokens.typography.fontFamily.serif },
  jp: { fontSize: 12, opacity: 0.7, fontFamily: tokens.typography.fontFamily.serif },
  count: { fontSize: 12, opacity: 0.7, marginTop: 4 },
});
