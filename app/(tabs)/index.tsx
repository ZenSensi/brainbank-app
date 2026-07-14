import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, RefreshControl, TouchableOpacity, Image } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ContentCard from "../../src/components/ContentCard";
import SemesterGrid from "../../src/components/SemesterGrid";
import SpecializationList from "../../src/components/SpecializationList";
import VideoCard from "../../src/components/VideoCard";
import { useAuth } from "../../src/contexts/AuthContext";
import {
  COLORS, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS,
  SUBJECTS, FREE_PLAYLISTS, CURRENCY_SYMBOL, NOTES_PRICE,
} from "../../src/constants";

import { getRecentContent } from "../../src/services/contentService";
import { getRecentlyViewed } from "../../src/services/recentService";
import { getUserPurchases } from "../../src/services/purchaseService";
import { ContentItem } from "../../src/types";

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// In-memory cache to save loaded homepage lists across mounts
let cachedRecentViewed: ContentItem[] | null = null;
let cachedRecentDbContent: ContentItem[] | null = null;

export default function HomeScreen() {
  const { user } = useAuth();
  const [recentContent, setRecentContent] = useState<ContentItem[]>(cachedRecentViewed || []);
  const [notes, setNotes] = useState<ContentItem[]>(cachedRecentDbContent ? cachedRecentDbContent.filter((item) => item.type === "notes") : []);
  const [refreshing, setRefreshing] = useState(false);
  const [purchasedIds, setPurchasedIds] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    try {
      const [recent, dbRecent] = await Promise.all([
        getRecentlyViewed(),
        getRecentContent(),
      ]);
      cachedRecentViewed = recent;
      cachedRecentDbContent = dbRecent;
      setRecentContent(recent);
      setNotes(dbRecent.filter((item) => item.type === "notes"));

      // Load user's purchased content IDs
      if (user?.id) {
        const purchases = await getUserPurchases(user.id);
        setPurchasedIds(new Set(purchases.map((p) => p.contentId || "")));
      } else {
        setPurchasedIds(new Set());
      }
    } catch {}
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData, user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const displayName = user?.displayName || "Student";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
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

        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>Hello, {displayName}!</Text>
          <Text style={styles.welcomeSub}>Your academic progress is looking great today.</Text>
        </View>

        {user && recentContent.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={272}
              decelerationRate="fast"
              contentContainerStyle={styles.recentScroll}
            >
              {recentContent.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentCard}
                  onPress={() => router.push(`/content/${item.id}`)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.recentIconBox, { backgroundColor: COLORS.primaryFixed }]}>
                    <Ionicons
                      name={item.type === "notes" ? "document-text" : item.type === "pyq" ? "newspaper" : "videocam"}
                      size={24}
                      color={COLORS.primary}
                    />
                  </View>
                  <Text style={styles.recentTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.recentDesc} numberOfLines={1}>{item.description}</Text>
                  <View style={styles.recentMeta}>
                    <Text style={styles.recentTime}>
                      Recently Opened
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/browse")}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.notesGrid}>
            {notes.slice(0, 4).map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.squareCard}
                onPress={() => router.push(`/content/${item.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.squareThumbContainer}>
                  <Image
                    source={{ uri: item.thumbnailUrl }}
                    style={styles.squareThumb}
                    resizeMode="cover"
                  />
                  {(() => {
                    const isOwned = user?.isMember || purchasedIds.has(item.id);
                    return (
                      <View style={[
                        styles.squareBadge,
                        { backgroundColor: isOwned ? "rgba(34, 139, 34, 0.85)" : "rgba(0,0,0,0.65)" }
                      ]}>
                        {!isOwned && (
                          <Ionicons name="lock-closed" size={9} color="#fff" style={{ marginRight: 3 }} />
                        )}
                        <Text style={styles.squareBadgeText}>
                          {isOwned ? "Owned" : "Locked"}
                        </Text>
                      </View>
                    );
                  })()}
                </View>
                <View style={styles.squareInfo}>
                  <Text style={styles.squareTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={styles.squareSubject} numberOfLines={1}>
                    {item.subjectName || "Notes"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Free Courses</Text>
          <View style={styles.featuredStack}>
            {FREE_PLAYLISTS.map((pl, idx) => (
              <TouchableOpacity
                key={pl.id}
                style={styles.featuredCard}
                onPress={() => router.push("/(tabs)/browse")}
                activeOpacity={0.9}
              >
                <View style={styles.featuredOverlay} />
                <View style={[styles.featuredTag, idx === 0 && { backgroundColor: COLORS.primary }, { position: "absolute", top: 16, left: 16, zIndex: 3 }]}>
                  <Ionicons name="play-circle" size={14} color={COLORS.onPrimary} style={{ marginRight: 4 }} />
                  <Text style={styles.featuredTagText}>Free</Text>
                </View>
                <View style={styles.featuredContent}>
                  <Ionicons
                    name={pl.icon as IoniconsName}
                    size={28}
                    color={COLORS.onPrimary}
                    style={{ marginBottom: 8 }}
                  />
                  <Text style={styles.featuredTitle}>{pl.name}</Text>
                  <Text style={styles.featuredDesc}>
                    {pl.specialization === "web-dev" ? "Full Stack Course" :
                     pl.specialization === "ai-ml" ? "AI Principles & Techniques" :
                     "Network Security & Hacking"}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>


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
    borderWidth: 2,
    borderColor: COLORS.primaryContainer,
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
    backgroundColor: COLORS.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  welcomeSection: {
    paddingHorizontal: SPACING.containerMargin,
    paddingVertical: 8,
    marginBottom: SPACING.sectionGap - 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  welcomeSub: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  section: {
    marginBottom: SPACING.sectionGap,
    paddingHorizontal: SPACING.containerMargin,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  seeAll: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.primary,
  },
  recentScroll: {
    paddingRight: SPACING.containerMargin,
    gap: 12,
  },
  recentCard: {
    width: 256,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 3,
  },
  recentIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  recentDesc: {
    fontSize: FONTS.labelSm,
    fontWeight: FONT_WEIGHTS.labelSm,
    color: COLORS.onSurfaceVariant,
    marginBottom: 16,
  },
  recentMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  semBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: COLORS.surfaceContainerHigh,
    borderRadius: 4,
  },
  semBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.onPrimaryContainer,
  },
  recentTime: {
    fontSize: FONTS.labelSm,
    color: COLORS.outline,
  },
  featuredStack: {
    gap: SPACING.stackGap,
  },
  featuredCard: {
    width: "100%",
    height: 180,
    borderRadius: BORDER_RADIUS.DEFAULT,
    overflow: "hidden",
    backgroundColor: COLORS.primaryContainer,
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 3,
  },
  featuredCardAlt: {
    backgroundColor: COLORS.primary,
  },
  featuredOverlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 1,
  },
  featuredContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    zIndex: 2,
  },
  featuredTag: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: COLORS.tertiary,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: 12,
  },
  featuredTagText: {
    fontSize: FONTS.labelSm,
    fontWeight: FONT_WEIGHTS.labelSm,
    color: COLORS.onPrimary,
    letterSpacing: 0.5,
  },
  featuredTitle: {
    fontSize: FONTS.headlineLg,
    fontWeight: FONT_WEIGHTS.headlineLg,
    color: COLORS.surface,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: FONTS.bodyMd,
    color: "rgba(255,255,255,0.8)",
  },
  subjectRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.inlinePillGap,
  },
  subjectPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
  },
  subjectPillText: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.primary,
  },
  subjectPillActive: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  subjectPillTextActive: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.onPrimary,
  },
  notesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 8,
  },
  squareCard: {
    width: "49%",
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  squareThumbContainer: {
    width: "100%",
    aspectRatio: 1.1,
    backgroundColor: COLORS.primaryFixed,
  },
  squareThumb: {
    width: "100%",
    height: "100%",
  },
  squareBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  squareBadgeText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "700",
  },
  squareInfo: {
    padding: 10,
  },
  squareTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 2,
  },
  squareSubject: {
    fontSize: 11,
    color: COLORS.onSurfaceVariant,
  },
});
