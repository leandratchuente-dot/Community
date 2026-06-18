import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

// ─── types ───────────────────────────────────────────────────────────────────

type EventPin = {
  id: string;
  title: string;
  location: string;
  date: string;
  time: string;
  description: string;
  category: string;
  color: string;
  emoji: string;
  lat: number;
  lng: number;
  attendees: number;
  maxAttendees: number;
};

const FILTERS = ['All', 'Basketball', 'Football', 'Gaming', 'Jazz', 'Volleyball'];

// ─── leaflet html ─────────────────────────────────────────────────────────────

function buildLeafletHTML(events: EventPin[]): string {
  const eventsJson = JSON.stringify(
    events.map(({ id, emoji, color, lat, lng, title, attendees, maxAttendees }) => ({
      id,
      emoji,
      color,
      lat,
      lng,
      title,
      attendees,
      maxAttendees,
    }))
  );

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.css"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet.markercluster@1.5.3/dist/MarkerCluster.Default.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script src="https://unpkg.com/leaflet.markercluster@1.5.3/dist/leaflet.markercluster.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    .leaflet-control-attribution { font-size: 9px; }
    /* cluster rings use app purple */
    .marker-cluster-small,
    .marker-cluster-medium,
    .marker-cluster-large {
      background-color: rgba(61, 31, 140, 0.18) !important;
    }
    .marker-cluster-small div,
    .marker-cluster-medium div,
    .marker-cluster-large div {
      background-color: #3D1F8C !important;
      color: white !important;
      font-weight: 700 !important;
      font-size: 13px !important;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([49.0134, 8.4014], 13);

    // CartoDB Positron — clean white/beige minimal style
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // ── cluster group ──
    var clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function(cluster) {
        var count = cluster.getChildCount();
        return L.divIcon({
          html: '<div style="'
            + 'width:46px;height:46px;border-radius:50%;'
            + 'background:#3D1F8C;'
            + 'display:flex;align-items:center;justify-content:center;'
            + 'color:white;font-size:15px;font-weight:700;'
            + 'box-shadow:0 3px 10px rgba(0,0,0,0.28);'
            + 'border:2.5px solid white;'
            + '">' + count + '</div>',
          className: '',
          iconSize: [46, 46],
          iconAnchor: [23, 23]
        });
      }
    });

    var allEvents = ${eventsJson};
    var markers = {};

    // ── custom marker: title above, emoji circle, tail, attendee counter ──
    function makeIcon(emoji, color, title, attendees, maxAttendees) {
      var label = title.length > 15 ? title.substring(0, 13) + '\u2026' : title;
      var html = [
        '<div style="display:flex;flex-direction:column;align-items:center;pointer-events:none;">',
          // event name label
          '<div style="',
            'background:rgba(255,255,255,0.96);',
            'border-radius:8px;',
            'padding:2px 8px;',
            'font-size:10px;font-weight:700;',
            'color:#111827;',
            'white-space:nowrap;',
            'box-shadow:0 1px 5px rgba(0,0,0,0.16);',
            'margin-bottom:3px;',
          '">',
            label,
          '</div>',
          // coloured circle
          '<div style="',
            'width:44px;height:44px;border-radius:50%;',
            'background:' + color + ';',
            'display:flex;align-items:center;justify-content:center;',
            'font-size:22px;',
            'box-shadow:0 3px 8px rgba(0,0,0,0.32);',
            'border:2.5px solid white;',
          '">',
            emoji,
          '</div>',
          // downward tail
          '<div style="',
            'width:0;height:0;',
            'border-left:7px solid transparent;',
            'border-right:7px solid transparent;',
            'border-top:9px solid ' + color + ';',
            'margin-top:-1px;',
          '"></div>',
          // attendee counter pill
          '<div style="',
            'background:rgba(17,24,39,0.75);',
            'border-radius:10px;',
            'padding:2px 7px;',
            'font-size:9px;font-weight:700;',
            'color:white;',
            'margin-top:2px;',
            'white-space:nowrap;',
          '">',
            attendees + '/' + maxAttendees,
          '</div>',
        '</div>'
      ].join('');

      return L.divIcon({
        html: html,
        className: '',
        // iconSize covers title(~20px) + circle(44px) + tail(9px) + counter(~18px) wide enough for label
        iconSize: [130, 96],
        // anchor at tip of tail: title(20) + gap(3) + circle(44) + tail(8) = 75 from top; center x = 65
        iconAnchor: [65, 75],
        popupAnchor: [0, -75]
      });
    }

    allEvents.forEach(function(ev) {
      var marker = L.marker([ev.lat, ev.lng], {
        icon: makeIcon(ev.emoji, ev.color, ev.title, ev.attendees, ev.maxAttendees)
      });
      marker.on('click', function(e) {
        L.DomEvent.stopPropagation(e);
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'markerTap', id: ev.id }));
      });
      clusterGroup.addLayer(marker);
      markers[ev.id] = marker;
    });

    map.addLayer(clusterGroup);

    // close detail panel when tapping map background
    map.on('click', function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapTap' }));
    });

    function handleMessage(raw) {
      try {
        var msg = JSON.parse(raw);

        if (msg.type === 'filter') {
          // rebuild cluster with only the visible event ids
          clusterGroup.clearLayers();
          msg.ids.forEach(function(id) {
            if (markers[id]) clusterGroup.addLayer(markers[id]);
          });
        }

        if (msg.type === 'panTo') {
          map.setView([msg.lat, msg.lng], msg.zoom || 15);
        }
      } catch(e) {}
    }

    document.addEventListener('message', function(e) { handleMessage(e.data); });
    window.addEventListener('message', function(e) { handleMessage(e.data); });
  </script>
</body>
</html>`;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function MapScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);

  const [events, setEvents] = useState<EventPin[]>([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [listView, setListView] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventPin | null>(null);
  const [cardAnim] = useState(new Animated.Value(0));

  // ── fetch events from Supabase ──
  useEffect(() => {
    supabase
      .from('events')
      .select('*')
      .then(({ data, error }) => {
        if (data) {
          setEvents(
            data.map((row) => ({
              id: String(row.id),
              title: row.title,
              location: row.location,
              date: row.date,
              time: row.time,
              description: row.description ?? '',
              category: row.category,
              color: row.color,
              emoji: row.emoji,
              lat: row.lat,
              lng: row.lng,
              attendees: row.attendees,
              maxAttendees: row.max_attendees,
            }))
          );
        }
        setEventsLoaded(true);
      });
  }, []);

  // ── leaflet html — rebuilt once events are fetched ──
  const leafletHtml = useMemo(() => buildLeafletHTML(events), [eventsLoaded]);

  // ── visible events (used both for map filter and list view) ──
  const visibleEvents = events.filter((e) => {
    const matchFilter = activeFilter === 'All' || e.category === activeFilter;
    const matchSearch =
      search.trim() === '' ||
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.location.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  // keep map markers in sync whenever filter/search changes
  useEffect(() => {
    const ids = visibleEvents.map((e) => e.id);
    webViewRef.current?.injectJavaScript(
      `handleMessage(${JSON.stringify(JSON.stringify({ type: 'filter', ids }))});true;`
    );
  }, [activeFilter, search]);

  // ── pan helper ──
  function panMapTo(lat: number, lng: number, zoom = 15) {
    webViewRef.current?.injectJavaScript(
      `handleMessage(${JSON.stringify(JSON.stringify({ type: 'panTo', lat, lng, zoom }))});true;`
    );
  }

  // ── geocode address on search submit ──
  async function geocodeAddress(query: string) {
    if (!query.trim()) return;
    try {
      const url =
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
      const res = await fetch(url, { headers: { 'User-Agent': 'CommunityApp/1.0' } });
      const data = await res.json();
      if (data && data.length > 0) {
        panMapTo(parseFloat(data[0].lat), parseFloat(data[0].lon), 14);
        if (listView) setListView(false);
      }
    } catch (_) {
      // silently ignore network errors
    }
  }

  async function locateMe() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    panMapTo(pos.coords.latitude, pos.coords.longitude, 15);
    if (listView) setListView(false);
  }

  // ── card animation ──
  function openCard(event: EventPin) {
    setSelectedEvent(event);
    Animated.spring(cardAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }

  function closeCard() {
    Animated.timing(cardAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setSelectedEvent(null));
  }

  const handleMessage = useCallback((e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'markerTap') {
        const found = events.find((ev) => ev.id === msg.id);
        if (found) openCard(found);
      }
      if (msg.type === 'mapTap') {
        closeCard();
      }
    } catch {}
  }, [events]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  async function handleJoinEvent() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/profile-create');
      return;
    }
    // TODO: record join in Supabase once events table exists
  }

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [400, 0],
  });

  const attendeePct = selectedEvent
    ? Math.min(selectedEvent.attendees / selectedEvent.maxAttendees, 1)
    : 0;

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* ── leaflet map (hidden in list view to preserve state) ── */}
      <WebView
        key={eventsLoaded ? 'ready' : 'init'}
        ref={webViewRef}
        style={[StyleSheet.absoluteFillObject, listView && { display: 'none' }]}
        source={{ html: leafletHtml, baseUrl: 'https://unpkg.com' }}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={handleMessage}
        scrollEnabled={false}
        bounces={false}
      />

      {/* ── list view ── */}
      {listView && (
        <View style={[StyleSheet.absoluteFillObject, styles.listContainer]}>
          <ScrollView
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
          >
            {visibleEvents.length === 0 ? (
              <View style={styles.listEmpty}>
                <Text style={styles.listEmptyText}>No events match your filter.</Text>
              </View>
            ) : (
              visibleEvents.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.listItem}
                  onPress={() => openCard(item)}
                  activeOpacity={0.72}
                >
                  <View style={[styles.listItemIcon, { backgroundColor: item.color + '22' }]}>
                    <Text style={styles.listItemEmoji}>{item.emoji}</Text>
                  </View>
                  <View style={styles.listItemInfo}>
                    <Text style={styles.listItemTitle}>{item.title}</Text>
                    <Text style={styles.listItemSub}>{item.category}  ·  {item.date}</Text>
                  </View>
                  <View style={styles.listItemRight}>
                    <Text style={[styles.listItemCount, { color: item.color }]}>
                      {item.attendees}/{item.maxAttendees}
                    </Text>
                    <Text style={styles.listItemGoing}>going</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>
      )}

      {/* ── search + filter overlay ── */}
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.searchRow} pointerEvents="auto">
          <View style={styles.searchBar}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search events or type an address…"
              placeholderTextColor="#9CA3AF"
              value={search}
              onChangeText={setSearch}
              returnKeyType="search"
              onSubmitEditing={() => geocodeAddress(search)}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch('')}>
                <Text style={styles.clearIcon}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* list / map toggle */}
          <TouchableOpacity
            style={[styles.iconBtn, listView && styles.iconBtnActive]}
            onPress={() => setListView((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.iconBtnText}>{listView ? '🗺️' : '☰'}</Text>
          </TouchableOpacity>

          {/* locate me */}
          <TouchableOpacity style={styles.iconBtn} onPress={locateMe} activeOpacity={0.8}>
            <Text style={styles.iconBtnText}>📍</Text>
          </TouchableOpacity>

          {/* temp: logout */}
          <TouchableOpacity style={[styles.iconBtn, styles.logoutBtn]} onPress={handleLogout} activeOpacity={0.8}>
            <Text style={styles.iconBtnText}>🚪</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
          pointerEvents="auto"
        >
          {FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setActiveFilter(f)}
                activeOpacity={0.75}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── event detail bottom panel ── */}
      {selectedEvent && (
        <Animated.View style={[styles.card, { transform: [{ translateY: cardTranslateY }] }]}>
          <View style={styles.cardHandle} />

          <View style={styles.cardHeader}>
            <View style={[styles.cardBadge, { backgroundColor: selectedEvent.color + '22' }]}>
              <Text style={styles.cardBadgeEmoji}>{selectedEvent.emoji}</Text>
              <Text style={[styles.cardBadgeText, { color: selectedEvent.color }]}>
                {selectedEvent.category}
              </Text>
            </View>
            <TouchableOpacity onPress={closeCard} style={styles.cardClose}>
              <Text style={styles.cardCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.cardTitle}>{selectedEvent.title}</Text>
          <Text style={styles.cardLocation}>📍 {selectedEvent.location}</Text>

          <View style={styles.cardMeta}>
            <Text style={styles.cardMetaText}>📅 {selectedEvent.date}</Text>
            <Text style={styles.cardMetaDot}>·</Text>
            <Text style={styles.cardMetaText}>🕐 {selectedEvent.time}</Text>
          </View>

          <Text style={styles.cardDescription}>{selectedEvent.description}</Text>

          {/* attendee capacity bar */}
          <View style={styles.attendeeRow}>
            <Text style={styles.attendeeLabel}>
              👥 {selectedEvent.attendees} / {selectedEvent.maxAttendees} attending
            </Text>
            <Text style={[styles.attendeePct, { color: selectedEvent.color }]}>
              {Math.round(attendeePct * 100)}%
            </Text>
          </View>
          <View style={styles.attendeeTrack}>
            <View
              style={[
                styles.attendeeFill,
                { width: `${Math.round(attendeePct * 100)}%` as any, backgroundColor: selectedEvent.color },
              ]}
            />
          </View>

          <TouchableOpacity
            style={[styles.cardButton, { backgroundColor: selectedEvent.color }]}
            onPress={handleJoinEvent}
            activeOpacity={0.85}
          >
            <Text style={styles.cardButtonText}>Join Event</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F0',
  },
  /* ── list view ── */
  listContainer: {
    backgroundColor: '#F8F8F6',
  },
  listContent: {
    paddingTop: 168,
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 10,
  },
  listEmpty: {
    paddingTop: 40,
    alignItems: 'center',
  },
  listEmptyText: {
    fontSize: 15,
    color: '#9CA3AF',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  listItemIcon: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItemEmoji: { fontSize: 24 },
  listItemInfo: { flex: 1, gap: 3 },
  listItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  listItemSub: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  listItemRight: { alignItems: 'flex-end', gap: 2 },
  listItemCount: {
    fontSize: 13,
    fontWeight: '800',
  },
  listItemGoing: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  /* ── overlay ── */
  overlay: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    gap: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#111827',
    padding: 0,
  },
  clearIcon: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBtnActive: {
    backgroundColor: '#3D1F8C',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
  },
  iconBtnText: { fontSize: 18 },
  filtersRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filterChip: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterChipActive: {
    backgroundColor: '#3D1F8C',
    borderColor: '#3D1F8C',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  filterChipTextActive: { color: '#FFFFFF' },
  /* ── event detail card ── */
  card: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
    paddingBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 14,
    gap: 10,
  },
  cardHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 50,
  },
  cardBadgeEmoji: { fontSize: 14 },
  cardBadgeText: { fontSize: 13, fontWeight: '700' },
  cardClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardCloseText: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  cardLocation: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardMetaText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  cardMetaDot: { fontSize: 13, color: '#9CA3AF' },
  cardDescription: { fontSize: 14, color: '#6B7280', lineHeight: 21 },
  /* attendee bar */
  attendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  attendeeLabel: { fontSize: 13, color: '#374151', fontWeight: '600' },
  attendeePct: { fontSize: 13, fontWeight: '700' },
  attendeeTrack: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: -4,
  },
  attendeeFill: {
    height: '100%',
    borderRadius: 3,
  },
  cardButton: {
    marginTop: 4,
    paddingVertical: 15,
    borderRadius: 50,
    alignItems: 'center',
  },
  cardButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});
