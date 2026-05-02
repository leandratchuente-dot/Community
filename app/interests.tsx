import { useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const INTERESTS = [
  { id: '1',  emoji: '🏀', label: 'Basketball' },
  { id: '2',  emoji: '⚽', label: 'Football' },
  { id: '3',  emoji: '🎮', label: 'Gaming' },
  { id: '4',  emoji: '🎷', label: 'Jazz' },
  { id: '5',  emoji: '🏐', label: 'Volleyball' },
  { id: '6',  emoji: '📸', label: 'Photography' },
  { id: '7',  emoji: '🥾', label: 'Hiking' },
  { id: '8',  emoji: '🍳', label: 'Cooking' },
  { id: '9',  emoji: '🎵', label: 'Music' },
  { id: '10', emoji: '🎨', label: 'Art' },
];

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
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, selected.size === 0 && styles.buttonDisabled]}
          onPress={() => router.replace('/map')}
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
