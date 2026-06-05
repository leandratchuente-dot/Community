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

const ASYNC_KEY = 'pending_interest_ids';

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

/** Persist selected interest IDs (Supabase) while the user hasn't signed up yet. */
export async function savePendingInterestIds(ids: number[]): Promise<void> {
  await AsyncStorage.setItem(ASYNC_KEY, JSON.stringify(ids));
}

/** Flush pending interest IDs into user_interests after the user has signed up. */
export async function flushPendingInterests(userId: string): Promise<void> {
  const raw = await AsyncStorage.getItem(ASYNC_KEY);
  if (!raw) return;

  const ids: number[] = JSON.parse(raw);
  if (ids.length === 0) return;

  const rows = ids.map((interest_id) => ({ user_id: userId, interest_id }));
  const { error } = await supabase
    .from('user_interests')
    .upsert(rows, { onConflict: 'user_id,interest_id', ignoreDuplicates: true });

  if (error) {
    console.warn('user_interests flush error:', error.message);
    return;
  }

  await AsyncStorage.removeItem(ASYNC_KEY);
}
