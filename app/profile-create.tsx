import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
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
import { flushPendingInterests } from '@/lib/interests';

const AVATAR_COLORS = ['#0284C7', '#FF6B6B', '#4D96FF', '#6BCB77', '#FFD93D', '#FF922B', '#E879F9'];

export default function ProfileCreateScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!fullName.trim() || !username.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields to create your profile.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    console.log('[signUp] EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);
    console.log('[signUp] attempting signup for:', email.trim().toLowerCase());
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          avatar_color: avatarColor,
        },
      },
    });
    if (error) {
      console.log('[signUp] error.message:', error.message);
      console.log('[signUp] error.status:', error.status);
      console.log('[signUp] error (full):', JSON.stringify(error, null, 2));
      setLoading(false);
      Alert.alert('Could not create account', error.message);
      return;
    }
    console.log('[signUp] success, user id:', data.user?.id);
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName.trim(),
        username: username.trim().toLowerCase(),
        avatar_color: avatarColor,
      });
      if (profileError) {
        console.log('[profiles] insert error:', profileError.message, profileError.code);
      } else {
        console.log('[profiles] row inserted for user:', data.user.id);
      }
      await flushPendingInterests(data.user.id);
    }
    setLoading(false);
    router.replace('/join-communities');
  }

  const initial = fullName.trim().charAt(0).toUpperCase() || '?';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create your profile</Text>
          <Text style={styles.sub}>Tell us who you are</Text>
        </View>

        {/* avatar preview */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarInitial}>{initial}</Text>
          </View>
          <View style={styles.swatchRow}>
            {AVATAR_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.swatch,
                  { backgroundColor: c },
                  avatarColor === c && styles.swatchSelected,
                ]}
                onPress={() => setAvatarColor(c)}
                activeOpacity={0.8}
              />
            ))}
          </View>
        </View>

        {/* form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Alex Johnson"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. alexj"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Min. 6 characters"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
        </View>

        {/* actions */}
        <TouchableOpacity
          style={[styles.createBtn, loading && styles.createBtnDisabled]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.createBtnText}>{loading ? 'Creating…' : 'Create Profile'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipBtn}
          onPress={() => router.replace('/map')}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>Skip for now</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0284C7',
  },
  scroll: {
    paddingTop: 72,
    paddingHorizontal: 28,
    paddingBottom: 60,
  },
  /* header */
  header: {
    marginBottom: 32,
    gap: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  /* avatar */
  avatarSection: {
    alignItems: 'center',
    gap: 16,
    marginBottom: 36,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarInitial: {
    fontSize: 38,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  swatchRow: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: '#FFFFFF',
    transform: [{ scale: 1.2 }],
  },
  /* form */
  form: {
    gap: 18,
    marginBottom: 28,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  /* buttons */
  createBtn: {
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
  createBtnDisabled: {
    opacity: 0.55,
  },
  createBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.3,
  },
  skipBtn: {
    marginTop: 18,
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});
