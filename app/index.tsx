import { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/lib/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const t = useTheme();

  // skip welcome for users who are already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/map');
    });
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: t.brandBg }]}>
      <StatusBar style="light" />

      {/* centered title */}
      <View style={styles.topSection}>
        <Text style={styles.appName}>Community</Text>
        <Text style={styles.tagline}>Find your people, do what you love</Text>
      </View>

      {/* bottom CTA */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace('/interests')}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>Find Your People</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/login')}
          activeOpacity={0.7}
        >
          <Text style={styles.loginLinkText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0284C7',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  /* ── main content ── */
  topSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    zIndex: 1,
  },
  appName: {
    fontSize: 56,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    alignItems: 'center',
    zIndex: 1,
    gap: 20,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 50,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.3,
  },
  loginLink: {
    paddingVertical: 6,
  },
  loginLinkText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },
});
