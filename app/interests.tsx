import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SEED_INTERESTS, savePendingInterestNames } from '@/lib/interests';

const INTERESTS = SEED_INTERESTS.map((item, index) => ({
  id: String(index + 1),
  ...item,
}));

export default function InterestSelectionScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleContinue() {
    const names = [...selected]
      .map((localId) => INTERESTS.find((i) => i.id === localId)?.name)
      .filter((n): n is string => Boolean(n));

    console.log('[interests] selected names to save:', names);
    await savePendingInterestNames(names);
    console.log('[interests] AsyncStorage write complete — navigating to profile-create');

    router.replace('/profile-create');
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <FlatList
        data={INTERESTS}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={<Text style={styles.heading}>Pick your interests</Text>}
        renderItem={({ item }) => {
          const isSelected = selected.has(item.id);
          return (
            <TouchableOpacity
              style={[styles.tag, isSelected && styles.tagSelected]}
              onPress={() => toggle(item.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.tagEmoji}>{item.emoji}</Text>
              <Text style={[styles.tagLabel, isSelected && styles.tagLabelSelected]}>
                {item.label ?? item.name}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selected.size === 0 && styles.buttonDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={selected.size === 0}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6C47FF',
    paddingTop: 64,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  /* ── grid ── */
  grid: {
    paddingBottom: 16,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  tag: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingVertical: 18,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tagSelected: {
    borderColor: '#7C3AED',
    backgroundColor: '#EDE9FE',
  },
  tagEmoji: {
    fontSize: 26,
  },
  tagLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E1E2E',
    textAlign: 'center',
  },
  tagLabelSelected: {
    color: '#5B21B6',
  },
  /* ── footer ── */
  footer: {
    paddingTop: 8,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3D1F8C',
    letterSpacing: 0.3,
  },
});
