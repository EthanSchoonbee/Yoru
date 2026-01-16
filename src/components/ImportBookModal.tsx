import { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  type ViewStyle,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as DocumentPicker from 'expo-document-picker';
import { Upload, FileText } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';
import type { Shelf } from './ShelfCard';

type PickedFile = {
  name: string;
  uri: string;
  mimeType?: string;
};

interface ImportBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: {
    title: string;
    author: string;
    shelfId: string;
    file: PickedFile | null;
  }) => void;
  shelves: Shelf[];
  initialShelfId?: string;
}

function getPaper2Shadow(): ViewStyle | undefined {
  const raw: unknown = (tokens as any)?.shadows?.paper2;
  if (!raw || typeof raw !== 'object') return undefined;

  const obj = raw as Record<string, unknown>;

  // platform-specific case
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

export function ImportBookModal({
  isOpen,
  onClose,
  onConfirm,
  shelves,
  initialShelfId,
}: ImportBookModalProps) {
  const { colors } = useTheme();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [shelfId, setShelfId] = useState(initialShelfId || shelves[0]?.id || '');
  const [file, setFile] = useState<PickedFile | null>(null);

  const canSubmit = useMemo(() => title.trim().length > 0 && !!shelfId, [title, shelfId]);

  const paper2Shadow = useMemo(() => getPaper2Shadow(), []);

  const pickFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'application/epub+zip', 'application/octet-stream'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (res.canceled) return;

    const f = res.assets?.[0];
    if (!f) return;

    const name = f.name ?? 'book';
    setFile({ name, uri: f.uri, mimeType: f.mimeType ?? undefined });

    if (!title.trim()) {
      setTitle(name.replace(/\.(pdf|epub)$/i, ''));
    }
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    onConfirm({ title: title.trim(), author: author.trim(), shelfId, file });
    setTitle('');
    setAuthor('');
    setFile(null);
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeIn.duration(140)}
        exiting={FadeOut.duration(140)}
        style={[styles.backdrop, { backgroundColor: colors.overlay }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <KeyboardAvoidingView
        style={styles.centerWrap}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: colors.background, borderColor: colors.border },
            paper2Shadow, // ✅ never a string
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Import Book</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
              Add a new book to your library
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            {/* File Picker */}
            <Pressable
              onPress={pickFile}
              style={({ pressed }) => [
                styles.drop,
                { borderColor: 'rgba(90,90,90,0.20)', backgroundColor: 'transparent' },
                pressed ? styles.pressed085 : null,
              ]}
            >
              {file ? (
                <View style={styles.dropInner}>
                  <FileText size={40} color={tokens.colors.accent} />
                  <Text style={[styles.fileName, { color: colors.text.primary }]} numberOfLines={1}>
                    {file.name}
                  </Text>
                  <Text style={[styles.fileHint, { color: colors.text.secondary }]}>
                    Tap to change
                  </Text>
                </View>
              ) : (
                <View style={styles.dropInner}>
                  <Upload size={40} color={colors.text.secondary} />
                  <Text style={[styles.dropTitle, { color: colors.text.secondary }]}>
                    Pick EPUB or PDF
                  </Text>
                  <Text style={[styles.fileHint, { color: colors.text.secondary }]}>
                    Tap to browse
                  </Text>
                </View>
              )}
            </Pressable>

            {/* Title */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                Title <Text style={{ color: tokens.colors.accent }}>*</Text>
              </Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Book Title"
                placeholderTextColor="rgba(90,90,90,0.35)"
                style={[styles.input, { color: colors.text.primary }]}
              />
              <View style={[styles.underline, { backgroundColor: 'rgba(90,90,90,0.20)' }]} />
            </View>

            {/* Author */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Author</Text>
              <TextInput
                value={author}
                onChangeText={setAuthor}
                placeholder="Author Name"
                placeholderTextColor="rgba(90,90,90,0.35)"
                style={[
                  styles.input,
                  { color: colors.text.primary, fontFamily: tokens.typography.fontFamily.sans },
                ]}
              />
              <View style={[styles.underline, { backgroundColor: 'rgba(90,90,90,0.20)' }]} />
            </View>

            {/* Shelf Picker */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>Shelf</Text>
              <View style={[styles.pickerWrap, { borderBottomColor: 'rgba(90,90,90,0.20)' }]}>
                <Picker
                  selectedValue={shelfId}
                  onValueChange={v => setShelfId(String(v))}
                  style={{ color: colors.text.primary }}
                >
                  {shelves.map(s => (
                    <Picker.Item key={s.id} label={s.name} value={s.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.cancelBtn, pressed ? styles.pressed075 : null]}
              >
                <Text style={[styles.cancelText, { color: colors.text.secondary }]}>Cancel</Text>
              </Pressable>

              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  styles.submitBtn,
                  { backgroundColor: colors.text.primary },
                  pressed ? styles.pressed092 : null,
                  !canSubmit ? styles.disabled : null,
                ]}
              >
                <Text style={[styles.submitText, { color: colors.background }]}>Import</Text>
              </Pressable>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, zIndex: 50 },
  centerWrap: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', zIndex: 51 },
  card: { width: '100%', maxWidth: 520, borderWidth: 1, overflow: 'hidden' },

  header: { paddingHorizontal: 32, paddingTop: 32, paddingBottom: 24, borderBottomWidth: 1 },
  headerTitle: {
    fontSize: 24,
    letterSpacing: -0.2,
    fontFamily: tokens.typography.fontFamily.serif,
  },
  headerSubtitle: { marginTop: 8, fontSize: 13, fontWeight: '300' },

  body: { padding: 32, gap: 28 },

  drop: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 22,
  },
  dropInner: { alignItems: 'center', gap: 10 },
  dropTitle: { fontSize: 16, fontFamily: tokens.typography.fontFamily.serif, opacity: 0.9 },
  fileName: { fontSize: 16, fontFamily: tokens.typography.fontFamily.serif, maxWidth: '100%' },
  fileHint: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', opacity: 0.6 },

  field: { gap: 10 },
  label: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: '600' },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 18,
    backgroundColor: 'transparent',
    fontFamily: tokens.typography.fontFamily.serif,
  },
  underline: { height: 1 },

  pickerWrap: { borderBottomWidth: 1 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, paddingTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: '600' },
  submitBtn: { paddingHorizontal: 22, paddingVertical: 10 },
  submitText: { fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: '700' },

  pressed085: { opacity: 0.85 },
  pressed075: { opacity: 0.75 },
  pressed092: { opacity: 0.92 },
  disabled: { opacity: 0.3 },
});
