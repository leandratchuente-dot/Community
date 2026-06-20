import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '@/lib/supabase';
import { useTheme, type AppTheme } from '@/lib/theme';

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
  const t = useTheme();
  const styles = useMemo(() => makeStyles(t), [t.isDark]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [joiningId, setJoiningId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/map'); return; }

      // 1. Get the user's interest IDs
      const { data: uiData, error: uiError } = await supabase
        .from('user_interests')
        .select('interest_id')
        .eq('user_id', session.user.id);
      console.log('[JoinCommunities] user_interests:', JSON.stringify(uiData), uiError);

      const interestIds = (uiData ?? []).map((r: any) => r.interest_id as number);

      // 2. Get community IDs the user has already joined
      const { data: memberData, error: memberError } = await supabase
        .from('community_members')
        .select('community_id')
        .eq('user_id', session.user.id);
      console.log('[JoinCommunities] community_members:', JSON.stringify(memberData), memberError);

      const alreadyJoined = new Set((memberData ?? []).map((r: any) => String(r.community_id)));

      // 3. Fetch communities matching the user's interest IDs
      const { data: commData, error: commError } = interestIds.length > 0
        ? await supabase
            .from('communities')
            .select('id, name, description, interest_id, interests(name)')
            .in('interest_id', interestIds)
        : { data: [], error: null };
      console.log('[JoinCommunities] communities:', JSON.stringify(commData), commError);

      // 4. Exclude communities already joined
      const unjoined = (commData ?? []).filter((r: any) => !alreadyJoined.has(String(r.id)));

      setJoinedIds(alreadyJoined);
      setCommunities(
        unjoined.map((r: any) => ({
          id: String(r.id),
          name: r.name,
          description: r.description ?? null,
          category: (r.interests as any)?.name ?? null,
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
      <StatusBar style={t.isDark ? 'light' : 'dark'} />

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

function makeStyles(t: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: t.bg,
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
      color: t.primary,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 2,
    },
    title: {
      fontSize: 32,
      fontWeight: '800',
      color: t.text,
      letterSpacing: -0.5,
    },
    sub: {
      fontSize: 15,
      color: t.textSub,
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
      color: t.text,
    },
    emptyText: {
      fontSize: 14,
      color: t.textMuted,
      textAlign: 'center',
      lineHeight: 21,
    },
    list: {
      paddingHorizontal: 16,
      gap: 10,
    },
    card: {
      backgroundColor: t.surface,
      borderRadius: 18,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: t.isDark ? 0.3 : 0.07,
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
      backgroundColor: t.primaryLight,
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
      color: t.text,
    },
    cardCategory: {
      fontSize: 12,
      fontWeight: '600',
      color: t.primary,
    },
    cardDesc: {
      fontSize: 12,
      color: t.textMuted,
      lineHeight: 17,
      marginTop: 1,
    },
    joinBtn: {
      backgroundColor: t.primary,
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
      backgroundColor: t.bg,
      borderTopWidth: 1,
      borderTopColor: t.border,
    },
    doneBtn: {
      backgroundColor: t.primary,
      paddingVertical: 18,
      borderRadius: 50,
      alignItems: 'center',
      shadowColor: t.primary,
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
      borderColor: t.border,
    },
    doneBtnText: {
      fontSize: 17,
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.2,
    },
    doneBtnTextSkip: {
      color: t.textSub,
    },
  });
}
