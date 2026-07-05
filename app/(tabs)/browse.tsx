import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ContentCard from "../../src/components/ContentCard";
import { getAllContent } from "../../src/services/contentService";
import { toggleSaveItem, isItemSaved, getSavedItems } from "../../src/services/saveService";
import { getUserPurchases } from "../../src/services/purchaseService";
import { useAuth } from "../../src/contexts/AuthContext";
import { ContentItem } from "../../src/types";
import {
  COLORS, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS,
  SEMESTERS, SPECIALIZATIONS, SUBJECTS, FREE_PLAYLISTS,
} from "../../src/constants";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

const filterOptions = [
  { key: "notes", label: "Notes", icon: "document-text" as IoniconsName },
  { key: "pyqs", label: "PYQ's", icon: "newspaper" as IoniconsName },
  { key: "playlists", label: "Playlists", icon: "play-circle" as IoniconsName },
];

export default function BrowseScreen() {
  const { user } = useAuth();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "notes" | "pyq" | "video">("notes");
  const [activeTab, setActiveTab] = useState(0);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadContent();
    loadSavedIds();
  }, []);

  // Reload purchased IDs whenever user changes (login/logout)
  useEffect(() => {
    const loadPurchased = async () => {
      if (user?.id) {
        const purchases = await getUserPurchases(user.id);
        setPurchasedIds(new Set(purchases.map((p) => p.contentId || "")));
      } else {
        setPurchasedIds(new Set());
      }
    };
    loadPurchased();
  }, [user]);

  const loadContent = async () => {
    setLoading(true);
    try {
      const items = await getAllContent();
      setContent(items);
    } catch {}
    setLoading(false);
  };

  const loadSavedIds = async () => {
    const saved = await getSavedItems();
    setSavedIds(new Set(saved.map((i: any) => i.id)));
  };

  const handleTogglePlaylistSave = async (pl: any) => {
    await toggleSaveItem({ id: pl.id, title: pl.name, type: "video", playlistId: pl.playlistId });
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(pl.id)) next.delete(pl.id);
      else next.add(pl.id);
      return next;
    });
  };

  const isSearching = searchQuery.trim().length > 0;
  const q = searchQuery.trim().toLowerCase();

  // Tab-filtered content (used when not searching)
  const filteredContent = content.filter((item) => item.type === filterType);

  // Unified search across ALL types
  const searchResultsDb = isSearching
    ? content.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.subjectName?.toLowerCase().includes(q)
      )
    : [];

  const searchResultsPlaylists = isSearching
    ? FREE_PLAYLISTS.filter((pl) => pl.name.toLowerCase().includes(q))
    : [];

  const handleContentPress = (item: ContentItem) => {
    router.push(`/content/${item.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>Brain Bank</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.titleMain}>Your College Vault</Text>
          <Text style={styles.titleSub}>Notes • Playlists • PYQ's</Text>
        </View>

        {/* Hide tab pills while searching */}
        {!isSearching && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          <View style={styles.filterRow}>
            {filterOptions.map((opt, idx) => (
              <TouchableOpacity
                key={opt.key}
                style={[styles.filterPill, activeTab === idx && styles.filterPillActive]}
                onPress={() => {
                  setActiveTab(idx);
                  if (idx === 0) setFilterType("notes");
                  else if (idx === 1) setFilterType("pyq");
                  else if (idx === 2) setFilterType("video");
                }}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={opt.icon}
                  size={16}
                  color={activeTab === idx ? COLORS.onPrimary : COLORS.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterPillText, activeTab === idx && styles.filterPillTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        )}

        <View style={styles.searchSection}>
          <View style={[styles.searchBar, isSearching && styles.searchBarActive]}>
            <Ionicons name="search" size={20} color={isSearching ? COLORS.primary : COLORS.outline} style={{ marginRight: 12 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search notes, PYQs, playlists..."
              placeholderTextColor={COLORS.onSurfaceVariant}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {isSearching && (
              <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color={COLORS.outline} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SEARCH RESULTS — shown across all types when user types */}
        {isSearching && (
          <View style={{ paddingHorizontal: SPACING.containerMargin }}>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : searchResultsDb.length === 0 && searchResultsPlaylists.length === 0 ? (
              <View style={styles.emptySearch}>
                <Ionicons name="search-outline" size={48} color={COLORS.outlineVariant} style={{ marginBottom: 12 }} />
                <Text style={styles.emptySearchTitle}>No results for "{searchQuery}"</Text>
                <Text style={styles.emptySearchSub}>Try a different keyword or check the spelling</Text>
              </View>
            ) : (
              <>
                {searchResultsDb.length > 0 && (
                  <>
                    <Text style={styles.searchGroupLabel}>Notes & PYQs</Text>
                    {searchResultsDb.map((item) => (
                      <ContentCard
                        key={item.id}
                        item={item}
                        onPress={handleContentPress}
                        isOwned={user?.isMember || purchasedIds.has(item.id)}
                      />
                    ))}
                  </>
                )}
                {searchResultsPlaylists.length > 0 && (
                  <>
                    <Text style={[styles.searchGroupLabel, { marginTop: searchResultsDb.length > 0 ? 16 : 0 }]}>YouTube Playlists</Text>
                    {searchResultsPlaylists.map((pl) => (
                      <TouchableOpacity
                        key={pl.id}
                        style={styles.searchPlaylistRow}
                        activeOpacity={0.7}
                        onPress={() => Linking.openURL(`https://www.youtube.com/playlist?list=${pl.playlistId}`).catch(() => Alert.alert("Error", "Could not open YouTube link."))}
                      >
                        <View style={styles.searchPlaylistIcon}>
                          <Ionicons name="play-circle" size={24} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.searchPlaylistTitle}>{pl.name}</Text>
                          <Text style={styles.searchPlaylistSub}>Free YouTube Playlist</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
                      </TouchableOpacity>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        )}

        {/* Playlists grid - only show when Playlists tab (2) is active AND not searching */}
        {!isSearching && activeTab === 2 && (
          <>

            <View style={styles.playlistGrid}>
              {FREE_PLAYLISTS.map((pl) => (
                <TouchableOpacity
                  key={pl.id}
                  style={styles.playlistCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    Linking.openURL(`https://www.youtube.com/playlist?list=${pl.playlistId}`).catch(() => {
                      Alert.alert("Error", "Could not open YouTube playlist.");
                    });
                  }}
                >
                  <View style={[styles.cardThumb, { backgroundColor: COLORS.primaryFixed }]}>
                    <View style={styles.thumbOverlay}>
                      <Ionicons name={pl.icon as IoniconsName} size={32} color={COLORS.primary} />
                      <View style={styles.sourceBadge}>
                        <Ionicons name="logo-youtube" size={10} color={COLORS.onSurface} />
                        <Text style={styles.sourceBadgeText}>YouTube</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{pl.name}</Text>
                    <View style={styles.cardMeta}>
                      <Text style={styles.cardDesc}>
                        {pl.specialization === "web-dev" ? "Full Stack Course" :
                         pl.specialization === "ai-ml" ? "AI Principles" :
                         "Security & Hacking"}
                      </Text>
                      <TouchableOpacity
                        onPress={(e) => { e.stopPropagation(); handleTogglePlaylistSave(pl); }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Ionicons
                          name={savedIds.has(pl.id) ? "bookmark" : "bookmark-outline"}
                          size={18}
                          color={savedIds.has(pl.id) ? COLORS.primary : COLORS.outline}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Database Content - show when Notes (0) or PYQ (1) tab is active AND not searching */}
        {!isSearching && (activeTab === 0 || activeTab === 1) && (
          <>
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
            ) : filteredContent.length > 0 ? (
              <View style={styles.contentList}>
                {filteredContent.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    onPress={handleContentPress}
                    isOwned={user?.isMember || purchasedIds.has(item.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.center}>
                <Ionicons name="document-text-outline" size={48} color={COLORS.outlineVariant} style={{ marginBottom: 12 }} />
                <Text style={styles.errorText}>No items found in this category</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 56,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.containerMargin,
    paddingVertical: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: FONTS.displayMobile,
    fontWeight: FONT_WEIGHTS.display,
    color: COLORS.primary,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  titleSection: {
    paddingHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.sectionGap - 8,
    marginTop: 8,
  },
  titleMain: {
    fontSize: FONTS.displayMobile,
    fontWeight: FONT_WEIGHTS.display,
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  titleSub: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  filterScroll: {
    paddingHorizontal: SPACING.containerMargin,
    paddingBottom: 8,
    marginBottom: SPACING.sectionGap - 8,
  },
  filterRow: {
    flexDirection: "row",
    gap: SPACING.stackGap,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.secondaryContainer,
  },
  filterPillActive: {
    backgroundColor: COLORS.primary,
  },
  filterPillText: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.primary,
  },
  filterPillTextActive: {
    color: COLORS.onPrimary,
  },
  searchSection: {
    paddingHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.sectionGap,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 52,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  searchBarActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surfaceContainerLowest,
  },
  searchInput: {
    flex: 1,
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurface,
  },
  emptySearch: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptySearchTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySearchSub: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
  searchGroupLabel: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 4,
  },
  searchPlaylistRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  searchPlaylistIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  searchPlaylistTitle: {
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  searchPlaylistSub: {
    fontSize: FONTS.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  featuredCard: {
    marginHorizontal: SPACING.containerMargin,
    height: 190,
    borderRadius: BORDER_RADIUS.DEFAULT,
    backgroundColor: COLORS.primaryContainer,
    overflow: "hidden",
    marginBottom: SPACING.sectionGap,
  },
  featuredOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(103, 75, 181, 0.6)",
    zIndex: 1,
  },
  featuredBadgeRow: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featuredBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DC2626",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
  },
  featuredBadgeText: {
    color: COLORS.onPrimary,
    fontSize: 10,
    fontWeight: "700",
  },
  featuredBadgeLabel: {
    color: "rgba(255,255,255,0.9)",
    fontSize: FONTS.labelSm,
  },
  featuredTitle: {
    position: "absolute",
    bottom: 24,
    left: 24,
    zIndex: 2,
    fontSize: FONTS.headlineLg,
    fontWeight: FONT_WEIGHTS.headlineLg,
    color: COLORS.onPrimary,
  },
  playBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -30,
    marginTop: -30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  playlistGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: SPACING.containerMargin,
    gap: SPACING.stackGap,
    marginBottom: SPACING.sectionGap,
  },
  playlistCard: {
    width: "47%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 12,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 2,
  },
  cardThumb: {
    height: 90,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbOverlay: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  sourceBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    gap: 4,
  },
  sourceBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  cardInfo: {
    gap: 4,
  },
  cardTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
  },
  cardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDesc: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    flex: 1,
  },
  semesterSection: {
    paddingHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  semScroll: {
    gap: SPACING.inlinePillGap,
    paddingBottom: 4,
  },
  semChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  semChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  semChipText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },
  semChipTextActive: {
    color: COLORS.onPrimary,
  },
  specScroll: {
    gap: SPACING.inlinePillGap,
    paddingBottom: 4,
    marginBottom: 8,
  },
  specRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.inlinePillGap,
  },
  specChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  specChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  specText: {
    fontSize: 14,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },
  typeFilterRow: {
    flexDirection: "row",
    paddingHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.stackGap,
    gap: SPACING.inlinePillGap,
  },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceContainerLow,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  typeChipActive: {
    backgroundColor: COLORS.tertiary,
    borderColor: COLORS.tertiary,
  },
  typeChipText: {
    fontSize: FONTS.labelSm,
    color: COLORS.onSurfaceVariant,
    fontWeight: "600",
  },
  typeChipTextActive: {
    color: COLORS.onTertiary,
  },
  contentList: {
    paddingHorizontal: SPACING.containerMargin,
    gap: SPACING.stackGap,
    paddingBottom: 20,
  },
  comingSoonCard: {
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 16,
    marginHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.stackGap,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
  },
  comingSoonHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.primary,
  },
  comingSoonDesc: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    lineHeight: 20,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
  },
});
