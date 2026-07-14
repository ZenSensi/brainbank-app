import { useState, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { getUserPurchases } from "../../src/services/purchaseService";
import { getContentById } from "../../src/services/contentService";
import { Purchase, ContentItem } from "../../src/types";
import { COLORS, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS } from "../../src/constants";

const QUOTES = [
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Education is the passport to the future.", author: "Malcolm X" },
  { text: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown" },
];

function getDailyQuote() {
  const day = new Date().getDate();
  return QUOTES[day % QUOTES.length];
}

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

// In-memory cache to save loaded library content across focus events
let cachedPurchasedContent: ContentItem[] | null = null;

export default function LibraryScreen() {
  const { user } = useAuth();
  const [purchasedContent, setPurchasedContent] = useState<ContentItem[]>(cachedPurchasedContent || []);
  const [loading, setLoading] = useState(cachedPurchasedContent === null);

  const loadPurchasedContent = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    if (purchasedContent.length === 0) {
      setLoading(true);
    }
    try {
      const purchases = await getUserPurchases(user.id);
      const contentIds = purchases
        .filter((p: Purchase) => p.contentId)
        .map((p: Purchase) => p.contentId!);

      const items = await Promise.all(
        contentIds.map((id: string) => getContentById(id))
      );
      const validItems = items.filter((item): item is ContentItem => item !== null);
      cachedPurchasedContent = validItems;
      setPurchasedContent(validItems);
    } catch {}
    setLoading(false);
  }, [user, purchasedContent.length]);

  // Refresh whenever this tab gains focus
  useFocusEffect(
    useCallback(() => {
      loadPurchasedContent();
    }, [loadPurchasedContent])
  );

  const quote = getDailyQuote();

  const getIconForType = (type: string): IoniconsName => {
    if (type === "pyq") return "newspaper";
    return "document-text";
  };

  const getIconBgForType = (type: string) => {
    if (type === "pyq") return COLORS.secondaryContainer;
    return COLORS.primaryContainer;
  };

  const getIconColorForType = (type: string) => {
    if (type === "pyq") return COLORS.secondary;
    return COLORS.primary;
  };

  const getTypeLabel = (type: string) => {
    if (type === "pyq") return "PYQ Paper";
    return "Notes";
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
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

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.titleMain}>My Library</Text>
          <Text style={styles.titleSub}>Your purchased notes & PYQs</Text>
        </View>

        {/* Motivational Quote Block */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteIconRow}>
            <Ionicons name="sparkles" size={18} color={COLORS.primary} style={{ marginRight: 6 }} />
            <Text style={styles.quoteLabel}>Daily Motivation</Text>
          </View>
          <Text style={styles.quoteText}>"{quote.text}"</Text>
          <Text style={styles.quoteAuthor}>— {quote.author}</Text>
        </View>

        {/* Not logged in state */}
        {!user && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={64} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>Login to view your library</Text>
            <Text style={styles.emptyDesc}>Sign in to access your purchased notes and PYQs</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/(auth)/login")}>
              <Ionicons name="log-in" size={18} color={COLORS.onPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Member badge */}
        {user?.isMember && (
          <View style={styles.memberBanner}>
            <Ionicons name="star" size={22} color="#F59E0B" style={{ marginRight: 12 }} />
            <View>
              <Text style={styles.memberTitle}>Premium Member</Text>
              <Text style={styles.memberDesc}>You have access to all content</Text>
            </View>
          </View>
        )}

        {/* Purchased content list */}
        {user && (
          <View style={styles.purchasedSection}>
            <Text style={styles.sectionTitle}>Purchased Items</Text>

            {loading ? (
              <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 24 }} />
            ) : purchasedContent.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="bag-outline" size={48} color={COLORS.outlineVariant} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyCardTitle}>Nothing purchased yet</Text>
                <Text style={styles.emptyCardSub}>
                  Notes and PYQ papers you purchase will appear here so you can access them anytime
                </Text>
                <TouchableOpacity
                  style={styles.browseBtn}
                  onPress={() => router.push("/(tabs)/browse")}
                >
                  <Ionicons name="search" size={16} color={COLORS.onPrimary} style={{ marginRight: 6 }} />
                  <Text style={styles.browseBtnText}>Browse Content</Text>
                </TouchableOpacity>
              </View>
            ) : (
              purchasedContent.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.itemCard}
                  onPress={() => router.push(`/content/${item.id}` as any)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.itemIconBox, { backgroundColor: getIconBgForType(item.type) }]}>
                    <Ionicons
                      name={getIconForType(item.type)}
                      size={22}
                      color={getIconColorForType(item.type)}
                    />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                    <View style={styles.itemMetaRow}>
                      <View style={styles.typeBadge}>
                        <Text style={styles.typeBadgeText}>{getTypeLabel(item.type)}</Text>
                      </View>
                      {item.subjectName && (
                        <Text style={styles.itemSubject} numberOfLines={1}>{item.subjectName}</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.ownedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color="#22c55e" style={{ marginRight: 3 }} />
                    <Text style={styles.ownedText}>Owned</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
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
    marginBottom: 20,
  },
  titleMain: {
    fontSize: FONTS.headlineLg,
    fontWeight: FONT_WEIGHTS.headlineLg,
    color: COLORS.onSurface,
  },
  titleSub: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 4,
  },

  // Quote card
  quoteCard: {
    marginHorizontal: SPACING.containerMargin,
    marginBottom: 24,
    backgroundColor: COLORS.primaryContainer,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(103,75,181,0.15)",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  quoteIconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  quoteLabel: {
    fontSize: FONTS.labelLg,
    fontWeight: "700",
    color: COLORS.primary,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  quoteText: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onPrimaryContainer,
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 10,
  },
  quoteAuthor: {
    fontSize: FONTS.labelLg,
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "right",
  },

  // Member banner
  memberBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: SPACING.containerMargin,
    backgroundColor: "#FFF8E1",
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  memberTitle: {
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  memberDesc: {
    fontSize: FONTS.labelSm,
    color: COLORS.onSurfaceVariant,
  },

  // Purchased section
  purchasedSection: {
    paddingHorizontal: SPACING.containerMargin,
  },
  sectionTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 14,
  },
  emptyCard: {
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderStyle: "dashed",
  },
  emptyCardTitle: {
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 6,
    textAlign: "center",
  },
  emptyCardSub: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
  },
  browseBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.full,
  },
  browseBtnText: {
    color: COLORS.onPrimary,
    fontSize: FONTS.labelLg,
    fontWeight: "700",
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  itemIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  itemMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeBadge: {
    backgroundColor: COLORS.surfaceContainerHigh,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
  },
  itemSubject: {
    fontSize: FONTS.labelSm,
    color: COLORS.onSurfaceVariant,
  },
  ownedBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.12)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ownedText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#22c55e",
  },

  // Not logged in state
  emptyState: {
    alignItems: "center",
    paddingTop: 32,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 8,
    textAlign: "center",
    marginTop: 16,
  },
  emptyDesc: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 24,
  },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: BORDER_RADIUS.full,
  },
  loginBtnText: {
    color: COLORS.onPrimary,
    fontSize: FONTS.labelLg,
    fontWeight: "700",
  },
});
