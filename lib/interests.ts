/*
  Run once in the Supabase SQL editor to create the required tables:

  CREATE TABLE IF NOT EXISTS interests (
    id   BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name TEXT   NOT NULL UNIQUE,
    emoji TEXT  NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_interests (
    id          BIGINT      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    interest_id BIGINT      NOT NULL REFERENCES interests(id)  ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, interest_id)
  );
*/

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

// Stores names, not IDs — the user is unauthenticated at selection time so
// Supabase calls can fail silently due to RLS. Names are resolved to IDs
// inside flushPendingInterests once the user has a valid session.
const ASYNC_KEY = 'pending_interest_names';

export const SEED_INTERESTS = [
  { name: 'Basketball', emoji: '🏀' },
  { name: 'Football',   emoji: '⚽' },
  { name: 'Gaming',     emoji: '🎮' },
  { name: 'Jazz',       emoji: '🎷' },
  { name: 'Volleyball', emoji: '🏐' },
  { name: 'Photography',emoji: '📸' },
  { name: 'Hiking',     emoji: '🥾' },
  { name: 'Cooking',    emoji: '🍳' },
  { name: 'Music',      emoji: '🎵' },
  { name: 'Art',        emoji: '🎨' },
];

/** Upsert all seed interests then return name → supabase id mapping. */
export async function seedAndFetchInterests(): Promise<Record<string, number>> {
  await supabase
    .from('interests')
    .upsert(SEED_INTERESTS, { onConflict: 'name', ignoreDuplicates: true });

  const { data, error } = await supabase
    .from('interests')
    .select('id, name');

  if (error || !data) return {};

  return Object.fromEntries(data.map((r: { id: number; name: string }) => [r.name, r.id]));
}

/** Persist selected interest names to AsyncStorage (no Supabase call — user not yet auth'd). */
export async function savePendingInterestNames(names: string[]): Promise<void> {
  await AsyncStorage.setItem(ASYNC_KEY, JSON.stringify(names));
  const verified = await AsyncStorage.getItem(ASYNC_KEY);
  console.log('[savePendingInterestNames] saved to AsyncStorage:', verified);
}

/** Flush pending interests into user_interests after the user has signed up. */
export async function flushPendingInterests(userId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(ASYNC_KEY);
  if (!raw) {
    console.log('[flushPendingInterests] nothing in AsyncStorage — skipping');
    return;
  }

  const names: string[] = JSON.parse(raw);
  if (names.length === 0) {
    console.log('[flushPendingInterests] empty names array — skipping');
    return;
  }

  console.log('[flushPendingInterests] resolving names to IDs for user', userId, ':', names);

  // User is now authenticated — safe to call Supabase.
  const map = await seedAndFetchInterests();
  const ids = names.map((n) => map[n]).filter((id): id is number => id !== undefined);

  if (ids.length === 0) {
    console.error('[flushPendingInterests] could not resolve any names to IDs. Map keys:', Object.keys(map));
    return;
  }

  console.log('[flushPendingInterests] inserting', ids.length, 'interests for user', userId);

  const rows = ids.map((interest_id) => ({ user_id: userId, interest_id }));
  const { error } = await supabase
    .from('user_interests')
    .upsert(rows, { onConflict: 'user_id,interest_id', ignoreDuplicates: true });

  if (error) {
    console.error('[flushPendingInterests] upsert error:', error.message, error.code, error.details);
    return;
  }

  console.log('[flushPendingInterests] success — clearing AsyncStorage');
  await AsyncStorage.removeItem(ASYNC_KEY);
}
