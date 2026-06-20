import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';

const BLUE = '#0284C7';
const BLUE_LIGHT = '#E0F2FE';

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

type Community = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
};

export default function JoinCommunitiesScreen() {
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/map'); return; }

      // Resolve interest names — Supabase first, AsyncStorage as fallback
      let interestNames: string[] = [];
      const { data: uiData } = await supabase
        .from('user_interests')
        .select('interests(name)')
        .eq('user_id', session.user.id);

      if (uiData && uiData.length > 0) {
        interestNames = uiData
          .map((r: any) => r.interests?.name as string | undefined)
          .filter((n): n is string => Boolean(n));
      }

      if (interestNames.length === 0) {
        const raw = await AsyncStorage.getItem('pending_interest_names');
        if (raw) interestNames = JSON.parse(raw);
      }

      // Fetch communities whose category matches an interest
      const commQuery = supabase
        .from('communities')
        .select('id, name, description, category');
      const { data: commData } = interestNames.length > 0
        ? await commQuery.in('category', interestNames)
        : await commQuery;

      // Check which communities this user has already joined
      const { data: memberData } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', session.user.id);

      setJoinedIds(
        new Set((memberData ?? []).map((r: any) => String(r.community_id)))
      );
      setCommunities(
        (commData ?? []).map((r: any) => ({
          id: String(r.id),
          name: r.name,
          description: r.description ?? null,
          category: r.category ?? null,
        }))
      );
      setLoading(false);
    }
    load();
  }, []);

  async function handleJoin(communityId: string) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    setJoiningId(communityId);
    const { error } = await supabase.from('community_members').insert({
      community_id: communityId,
      user_id: session.user.id,
      role: 'member',
    });
    setJoiningId(null);
    if (!error) {
      setJoinedIds((prev) => new Set([...prev, communityId]));
    }
  }

  const hasJoined = joinedIds.size > 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Welcome</Text>
          <Text style={styles.title}>Join Communities</Text>
          <Text style={styles.sub}>
            Here are communities that match your interests. Join the ones you like.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={BLUE} style={styles.loader} />
        ) : communities.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🏘️</Text>
            <Text style={styles.emptyTitle}>No communities yet</Text>
            <Text style={styles.emptyText}>
              Communities matching your interests will appear here once they're created.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {communities.map((community) => {
              const isJoined = joinedIds.has(community.id);
              const isJoining = joiningId === community.id;
              const emoji = community.category
                ? (CATEGORY_EMOJI[community.category] ?? '🏘️')
                : '🏘️';
              return (
                <View key={community.id} style={styles.card}>
                  <View style={styles.cardLeft}>
                    <View style={styles.iconBox}>
                      <Text style={styles.iconEmoji}>{emoji}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName} numberOfLines={1}>
                        {community.name}
                      </Text>
                      {community.category ? (
                        <Text style={styles.cardCategory}>{community.category}</Text>
                      ) : null}
                      {community.description ? (
                        <Text style={styles.cardDesc} numberOfLines={2}>
                          {community.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.joinBtn, isJoined && styles.joinBtnDone]}
                    onPress={() => { if (!isJoined) handleJoin(community.id); }}
                    disabled={isJoined || joiningId !== null}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.joinBtnText, isJoined && styles.joinBtnTextDone]}>
                      {isJoining ? '…' : isJoined ? '✓ Joined' : 'Join'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneBtn, !hasJoined && styles.doneBtnSkip]}
          onPress={() => router.replace('/map')}
          activeOpacity={0.85}
        >
          <Text style={[styles.doneBtnText, !hasJoined && styles.doneBtnTextSkip]}>
            {hasJoined ? 'Done' : 'Skip for now'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scroll: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 68,
    paddingBottom: 28,
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    color: BLUE,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 22,
    marginTop: 4,
  },
  loader: {
    marginTop: 60,
  },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 48,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 21,
  },
  list: {
    paddingHorizontal: 16,
    gap: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minWidth: 0,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: BLUE_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: {
    fontSize: 24,
  },
  cardInfo: {
    flex: 1,
    gap: 2,
    minWidth: 0,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  cardCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: BLUE,
  },
  cardDesc: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 17,
    marginTop: 1,
  },
  joinBtn: {
    backgroundColor: BLUE,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minWidth: 72,
  },
  joinBtnDone: {
    backgroundColor: '#D1FAE5',
  },
  joinBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  joinBtnTextDone: {
    color: '#059669',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 44,
    paddingTop: 16,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  doneBtn: {
    backgroundColor: BLUE,
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  doneBtnSkip: {
    backgroundColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  doneBtnTextSkip: {
    color: '#6B7280',
  },
});
