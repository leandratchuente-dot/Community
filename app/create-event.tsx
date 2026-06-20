import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';

const BLUE = '#0284C7';
const BLUE_LIGHT = '#E0F2FE';

const CATEGORIES = [
  'Basketball', 'Football', 'Gaming', 'Jazz', 'Volleyball',
  'Photography', 'Hiking', 'Cooking', 'Music', 'Art',
];

const CATEGORY_EMOJI: Record<string, string> = {
  Basketball: '🏀',
  Football: '⚽',
  Gaming: '🎮',
  Jazz: '🎷',
  Volleyball: '🏐',
  Photography: '📷',
  Hiking: '🥾',
  Cooking: '🍳',
  Music: '🎵',
  Art: '🎨',
};

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function daysInMonth(month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
}

export default function CreateEventScreen() {
  const router = useRouter();
  const now = new Date();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geocoding, setGeocoding] = useState(false);
  const [maxAttendees, setMaxAttendees] = useState('20');
  const [loading, setLoading] = useState(false);

  const [selDay, setSelDay] = useState(now.getDate());
  const [selMonth, setSelMonth] = useState(now.getMonth());
  const [selYear, setSelYear] = useState(now.getFullYear());
  const [selHour, setSelHour] = useState(12);
  const [selMinute, setSelMinute] = useState(0);

  const [showCatModal, setShowCatModal] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  const dateLabel = `${selDay} ${MONTHS_SHORT[selMonth]} ${selYear}`;
  const timeLabel = `${String(selHour).padStart(2, '0')}:${String(selMinute).padStart(2, '0')}`;

  async function geocodeLocation() {
    if (!location.trim()) return;
    setGeocoding(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(location)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'CommunityApp/1.0' } });
      const data = await res.json();
      if (data?.length > 0) {
        setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
      } else {
        Alert.alert('Location not found', 'Try a more specific address.');
      }
    } catch {
      Alert.alert('Error', 'Could not reach geocoding service.');
    } finally {
      setGeocoding(false);
    }
  }

  async function handleCreate() {
    if (!title.trim()) { Alert.alert('Missing title', 'Please enter a title.'); return; }
    if (!category) { Alert.alert('Missing category', 'Please select a category.'); return; }
    if (!location.trim()) { Alert.alert('Missing location', 'Please enter a location.'); return; }
    if (!coords) { Alert.alert('Location not confirmed', 'Tap "Look up" to confirm your location.'); return; }

    const max = parseInt(maxAttendees, 10);
    if (isNaN(max) || max < 1) { Alert.alert('Invalid max attendees', 'Must be at least 1.'); return; }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/profile-create'); return; }

    setLoading(true);
    const { error } = await supabase.from('events').insert({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      latitude: coords.lat,
      longitude: coords.lng,
      date: dateLabel,
      time: timeLabel,
      max_attendees: max,
      created_by: session.user.id,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Could not create event', error.message);
      return;
    }
    router.replace('/map');
  }

  const dayCount = daysInMonth(selMonth, selYear);
  const days = Array.from({ length: dayCount }, (_, i) => i + 1);
  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() + i);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>New Event</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.input}
              placeholder="Event name…"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="What's happening?"
              placeholderTextColor="#9CA3AF"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>
            <TouchableOpacity style={styles.pickerRow} onPress={() => setShowCatModal(true)} activeOpacity={0.7}>
              <Text style={category ? styles.pickerValue : styles.pickerPlaceholder}>
                {category ? `${CATEGORY_EMOJI[category]}  ${category}` : 'Select category…'}
              </Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <View style={styles.locationRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Address or place name…"
                placeholderTextColor="#9CA3AF"
                value={location}
                onChangeText={(t) => { setLocation(t); setCoords(null); }}
                returnKeyType="search"
                onSubmitEditing={geocodeLocation}
              />
              <TouchableOpacity
                style={[styles.lookupBtn, coords ? styles.lookupBtnSuccess : null]}
                onPress={geocodeLocation}
                disabled={geocoding || !location.trim()}
                activeOpacity={0.8}
              >
                <Text style={styles.lookupBtnText}>
                  {geocoding ? '…' : coords ? '✓' : 'Look up'}
                </Text>
              </TouchableOpacity>
            </View>
            {coords && (
              <Text style={styles.coordHint}>
                📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </Text>
            )}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity style={styles.pickerRow} onPress={() => setShowDateModal(true)} activeOpacity={0.7}>
              <Text style={styles.pickerValue}>📅  {dateLabel}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity style={styles.pickerRow} onPress={() => setShowTimeModal(true)} activeOpacity={0.7}>
              <Text style={styles.pickerValue}>🕐  {timeLabel}</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Max Attendees</Text>
            <TextInput
              style={[styles.input, { width: 120 }]}
              placeholder="20"
              placeholderTextColor="#9CA3AF"
              value={maxAttendees}
              onChangeText={setMaxAttendees}
              keyboardType="number-pad"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.createBtn, loading && { opacity: 0.55 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnText}>{loading ? 'Creating…' : 'Create Event'}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Category Modal */}
      <Modal visible={showCatModal} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowCatModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Category</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.catRow, category === cat && styles.catRowActive]}
                  onPress={() => { setCategory(cat); setShowCatModal(false); }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.catEmoji}>{CATEGORY_EMOJI[cat]}</Text>
                  <Text style={[styles.catName, category === cat && styles.catNameActive]}>{cat}</Text>
                  {category === cat && <Text style={styles.catCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Date Modal */}
      <Modal visible={showDateModal} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowDateModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Date</Text>
            <View style={styles.drumRow}>
              <View style={styles.drumCol}>
                <Text style={styles.drumHeader}>Day</Text>
                <ScrollView style={styles.drum} showsVerticalScrollIndicator={false}>
                  {days.map((d) => (
                    <TouchableOpacity key={d} style={[styles.drumItem, selDay === d && styles.drumItemActive]} onPress={() => setSelDay(d)}>
                      <Text style={[styles.drumText, selDay === d && styles.drumTextActive]}>{d}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.drumCol}>
                <Text style={styles.drumHeader}>Month</Text>
                <ScrollView style={styles.drum} showsVerticalScrollIndicator={false}>
                  {MONTHS_SHORT.map((m, i) => (
                    <TouchableOpacity key={m} style={[styles.drumItem, selMonth === i && styles.drumItemActive]} onPress={() => setSelMonth(i)}>
                      <Text style={[styles.drumText, selMonth === i && styles.drumTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.drumCol}>
                <Text style={styles.drumHeader}>Year</Text>
                <ScrollView style={styles.drum} showsVerticalScrollIndicator={false}>
                  {years.map((y) => (
                    <TouchableOpacity key={y} style={[styles.drumItem, selYear === y && styles.drumItemActive]} onPress={() => setSelYear(y)}>
                      <Text style={[styles.drumText, selYear === y && styles.drumTextActive]}>{y}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowDateModal(false)}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Time Modal */}
      <Modal visible={showTimeModal} transparent animationType="fade">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowTimeModal(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Time</Text>
            <View style={styles.drumRow}>
              <View style={styles.drumCol}>
                <Text style={styles.drumHeader}>Hour</Text>
                <ScrollView style={styles.drum} showsVerticalScrollIndicator={false}>
                  {hours.map((h) => (
                    <TouchableOpacity key={h} style={[styles.drumItem, selHour === h && styles.drumItemActive]} onPress={() => setSelHour(h)}>
                      <Text style={[styles.drumText, selHour === h && styles.drumTextActive]}>{String(h).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.drumCol}>
                <Text style={styles.drumHeader}>Minute</Text>
                <ScrollView style={styles.drum} showsVerticalScrollIndicator={false}>
                  {minutes.map((m) => (
                    <TouchableOpacity key={m} style={[styles.drumItem, selMinute === m && styles.drumItemActive]} onPress={() => setSelMinute(m)}>
                      <Text style={[styles.drumText, selMinute === m && styles.drumTextActive]}>{String(m).padStart(2, '0')}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={() => setShowTimeModal(false)}>
              <Text style={styles.confirmBtnText}>Confirm</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    paddingBottom: 60,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 20,
    color: '#374151',
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#111827',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  multiline: {
    minHeight: 90,
    paddingTop: 14,
  },
  pickerRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  pickerPlaceholder: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  chevron: {
    fontSize: 20,
    color: '#9CA3AF',
  },
  locationRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  lookupBtn: {
    backgroundColor: BLUE,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 76,
  },
  lookupBtnSuccess: {
    backgroundColor: '#10B981',
  },
  lookupBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  coordHint: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
    marginTop: 4,
  },
  createBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: BLUE,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  createBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 2,
  },
  catRowActive: {
    backgroundColor: BLUE_LIGHT,
  },
  catEmoji: {
    fontSize: 22,
  },
  catName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },
  catNameActive: {
    color: BLUE,
  },
  catCheck: {
    fontSize: 16,
    color: BLUE,
    fontWeight: '700',
  },
  drumRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  drumCol: {
    flex: 1,
    alignItems: 'center',
  },
  drumHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  drum: {
    height: 180,
    width: '100%',
  },
  drumItem: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    marginVertical: 1,
  },
  drumItemActive: {
    backgroundColor: BLUE_LIGHT,
  },
  drumText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  drumTextActive: {
    color: BLUE,
    fontWeight: '800',
    fontSize: 17,
  },
  confirmBtn: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    borderRadius: 50,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
