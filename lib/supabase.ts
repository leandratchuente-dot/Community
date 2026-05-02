import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aknuyxsmlgmynpjtapca.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI' +
    'sInJlZiI6ImFrbnV5eHNtbGdteW5wanRhcGNhIi' +
    'wicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0OTA4ODAsImV4cCI6MjA5MzA2Njg4MH0.MMdziSHwZiFvOZmlgNB5lhv1PK' +
    'sVGfadDYQTM2e5M_k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});