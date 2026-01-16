import { useEffect, useMemo, useRef, useState } from 'react';
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
} from 'react-native';
import Animated, {FadeIn, FadeInUp, FadeOut, FadeOutDown} from 'react-native-reanimated';
import { useTheme } from '../providers/ThemeProviders';
import { theme as tokens } from '../theme/theme';

interface AddShelfModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string, description: string) => void;
}

export function AddShelfModal({ isOpen, onClose, onConfirm }: AddShelfModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const canSubmit = useMemo(() => name.trim().length > 0, [name]);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onConfirm(name.trim(), description.trim());
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal visible={isOpen} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View
        entering={FadeInUp.duration(140)}
        exiting={FadeOutDown.duration(140)}
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
          ]}
        >
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text.primary }]}>New Shelf</Text>
            <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
              Create a collection for your books
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                Shelf Name <Text style={{ color: tokens.colors.accent }}>*</Text>
              </Text>

              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Japanese Classics"
                placeholderTextColor="rgba(90,90,90,0.35)"
                style={[styles.input, { color: colors.text.primary }]}
                returnKeyType="next"
              />
              <View style={[styles.underline, { backgroundColor: 'rgba(90,90,90,0.20)' }]} />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text.secondary }]}>
                Description <Text style={styles.optional}>(Optional)</Text>
              </Text>

              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="A curated selection of timeless works..."
                placeholderTextColor="rgba(90,90,90,0.35)"
                style={[styles.input, styles.textArea, { color: colors.text.primary }]}
                multiline
                textAlignVertical="top"
              />
              <View style={[styles.underline, { backgroundColor: 'rgba(90,90,90,0.20)' }]} />
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
                <Text style={[styles.submitText, { color: colors.background }]}>Create</Text>
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
  field: { gap: 10 },

  label: { fontSize: 11, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: '600' },
  optional: {
    fontSize: 10,
    opacity: 0.6,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },

  input: {
    paddingVertical: 10,
    paddingHorizontal: 0,
    fontSize: 18,
    backgroundColor: 'transparent',
    fontFamily: tokens.typography.fontFamily.serif,
  },
  textArea: {
    fontSize: 14,
    minHeight: 84,
    fontWeight: '300',
    fontFamily: tokens.typography.fontFamily.sans,
  },

  underline: { height: 1 },

  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 16, paddingTop: 8 },
  cancelBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  cancelText: { fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: '600' },

  submitBtn: { paddingHorizontal: 22, paddingVertical: 10 },
  submitText: { fontSize: 12, letterSpacing: 2.2, textTransform: 'uppercase', fontWeight: '700' },

  // keep these as styles to avoid “style union” weirdness
  pressed075: { opacity: 0.75 },
  pressed092: { opacity: 0.92 },
  disabled: { opacity: 0.3 },
});
