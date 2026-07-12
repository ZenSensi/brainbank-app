import { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { usePayment } from "../../src/contexts/PaymentContext";
import { getContentById } from "../../src/services/contentService";
import { addRecentlyViewed, removeRecentlyViewed } from "../../src/services/recentService";
import { isContentPurchased } from "../../src/services/purchaseService";
import { isItemSaved, toggleSaveItem } from "../../src/services/saveService";
import { ContentItem } from "../../src/types";
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS, CURRENCY_SYMBOL, NOTES_PRICE, PYQ_PRICE, MEMBERSHIP_PRICE } from "../../src/constants";

export default function ContentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { processPayment } = usePayment();
  const [item, setItem] = useState<ContentItem | null>(null);
  const [isOwned, setIsOwned] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [id, user]);

  const loadContent = async () => {
    if (!id) return;
    try {
      const content = await getContentById(id);
      setItem(content);
      if (content) {
        await addRecentlyViewed(content);
        const saved = await isItemSaved(content.id);
        setIsSaved(saved);

        if (user) {
          if (user.isMember) {
            setIsOwned(true);
          } else {
            const owned = await isContentPurchased(user.id, id);
            setIsOwned(owned);
          }
        }
      } else {
        await removeRecentlyViewed(id);
        Alert.alert(
          "Content Not Found",
          "This content may have been updated or removed.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch { }
    setLoading(false);
  };

  const handleToggleSave = async () => {
    if (!item) return;
    const saved = await toggleSaveItem(item);
    setIsSaved(saved);
  };

  const handlePurchase = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }
    if (!item) return;

    const price = item.type === "pyq" ? PYQ_PRICE : NOTES_PRICE;
    const purchaseType = item.type === "pyq" ? "pyq" as const : "notes" as const;
    const typeLabel = item.type === "pyq" ? "PYQ Paper" : "Notes";

    // Show confirmation before opening UPI app
    Alert.alert(
      `Unlock ${typeLabel}`,
      `Pay ${CURRENCY_SYMBOL}${price} to unlock "${item.title}"\n\nYou will be redirected to your UPI app (GPay, PhonePe, Paytm, etc.) to complete the payment.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: `Pay ${CURRENCY_SYMBOL}${price}`,
          style: "default",
          onPress: async () => {
            const success = await processPayment(price, `Brain Bank - ${item.title}`, item.id, purchaseType);
            if (success) {
              setIsOwned(true);
              Alert.alert(
                "Purchase Successful! 🎉",
                "Content unlocked! You can now view and download this file. It's also been added to your Library.",
              );
            } else {
              Alert.alert(
                "Payment Incomplete",
                "If you completed the payment, please wait a moment and refresh. If not, you can try again.",
              );
            }
          },
        },
      ]
    );
  };

  const handleViewPDF = () => {
    const fileUrl = item?.fileUrl || item?.url;
    if (fileUrl) {
      router.push({
        pathname: "/payment/checkout",
        params: { url: fileUrl, title: item.title },
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!item) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Content not found</Text>
      </View>
    );
  }

  const isVideo = item.type === "video";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveBtn} onPress={handleToggleSave}>
          <Ionicons
            name={isSaved ? "bookmark" : "bookmark-outline"}
            size={24}
            color={isSaved ? COLORS.primary : COLORS.onSurface}
          />
        </TouchableOpacity>
      </View>

      {item.thumbnailUrl ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={styles.imageHeader}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Ionicons 
            name={isVideo ? "play-circle" : item.type === "notes" ? "document-text" : "document"} 
            size={56} 
            color={COLORS.primary} 
          />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.badgeRow}>
          <View style={[styles.badge, isVideo ? styles.videoBadge : styles.pdfBadge]}>
            <Text style={styles.badgeText}>{isVideo ? "FREE VIDEO" : item.type.toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subject}>{item.subjectName}</Text>
        {item.specialization && (
          <Text style={styles.spec}>Specialization: {item.specialization}</Text>
        )}

        <Text style={styles.desc}>{item.description}</Text>

        {isVideo ? (
          <TouchableOpacity style={styles.watchBtn}>
            <Ionicons name="play" size={18} color={COLORS.onTertiary} style={{ marginRight: 8 }} />
            <Text style={styles.watchBtnText}>Watch Free Playlist</Text>
          </TouchableOpacity>
        ) : !isOwned ? (
          <View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>
                {CURRENCY_SYMBOL}{item.type === "pyq" ? PYQ_PRICE : NOTES_PRICE}
              </Text>
              <Text style={styles.priceLabel}>one-time unlock</Text>
            </View>
            <TouchableOpacity style={styles.buyBtn} onPress={handlePurchase}>
              <Text style={styles.buyBtnText}>Unlock for {CURRENCY_SYMBOL}{item.type === "pyq" ? PYQ_PRICE : NOTES_PRICE}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.membershipBtn}
              onPress={() => router.push("/membership")}
            >
              <Text style={styles.membershipBtnText}>
                Or get membership - {CURRENCY_SYMBOL}{MEMBERSHIP_PRICE} for everything
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.viewBtn} onPress={handleViewPDF}>
            <Text style={styles.viewBtnText}>📖 View & Download PDF</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 8,
  },
  backBtn: {
    padding: 12,
  },
  saveBtn: {
    padding: 12,
  },
  backText: {
    fontSize: FONTS.bodyLg,
    color: COLORS.primary,
    fontWeight: "600",
  },
  imagePlaceholder: {
    width: "100%",
    height: 220,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  imageHeader: {
    width: "100%",
    height: 220,
  },
  imageEmoji: {
    fontSize: 64,
  },
  info: {
    padding: 20,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  videoBadge: {
    backgroundColor: COLORS.tertiary,
  },
  pdfBadge: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    color: COLORS.onPrimary,
    fontSize: FONTS.labelSm,
    fontWeight: "700",
    letterSpacing: 1,
  },
  semBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.surfaceContainerHigh,
  },
  semBadgeText: {
    color: COLORS.onSurfaceVariant,
    fontSize: FONTS.labelSm,
    fontWeight: "600",
  },
  title: {
    fontSize: FONTS.headlineLg,
    fontWeight: FONT_WEIGHTS.headlineLg,
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  subject: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
    marginBottom: 4,
  },
  spec: {
    fontSize: FONTS.labelLg,
    color: COLORS.primary,
    marginBottom: 12,
    fontWeight: "500",
  },
  desc: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurface,
    lineHeight: 24,
    marginBottom: 16,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  statText: {
    fontSize: FONTS.labelSm,
    color: COLORS.outline,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginBottom: 16,
  },
  price: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.onSurface,
  },
  priceLabel: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
  },
  buyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  buyBtnText: {
    color: COLORS.onPrimary,
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
  },
  membershipBtn: {
    paddingVertical: 12,
    alignItems: "center",
  },
  membershipBtnText: {
    color: COLORS.primary,
    fontSize: FONTS.labelLg,
    fontWeight: "600",
  },
  viewBtn: {
    backgroundColor: COLORS.tertiary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 16,
    alignItems: "center",
  },
  viewBtnText: {
    color: COLORS.onTertiary,
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
  },
  watchBtn: {
    flexDirection: "row",
    backgroundColor: COLORS.tertiary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  watchBtnText: {
    color: COLORS.onTertiary,
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
  },
});
