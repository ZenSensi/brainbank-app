import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ContentItem } from "../types";
import { COLORS, FONTS, CURRENCY_SYMBOL, NOTES_PRICE, PYQ_PRICE } from "../constants";

interface Props {
  item: ContentItem;
  onPress: (item: ContentItem) => void;
  /** Pass true only if the current user has purchased or is a member */
  isOwned?: boolean;
}

export default function ContentCard({ item, onPress, isOwned = false }: Props) {
  const isVideo = item.type === "video";
  const price = item.price || (item.type === "pyq" ? PYQ_PRICE : NOTES_PRICE);

  let badgeLabel: string;
  let badgeStyle: object;

  if (isVideo) {
    badgeLabel = "Free";
    badgeStyle = styles.videoBadge;
  } else if (isOwned) {
    badgeLabel = "Owned";
    badgeStyle = styles.ownedBadge;
  } else {
    badgeLabel = "Locked";
    badgeStyle = styles.lockedBadge;
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.7}>
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={[styles.badge, badgeStyle]}>
        {!isVideo && !isOwned && (
          <Ionicons name="lock-closed" size={10} color="#fff" style={{ marginRight: 3 }} />
        )}
        <Text style={styles.badgeText}>{badgeLabel}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.type}>{item.type.toUpperCase()}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.subject} numberOfLines={1}>{item.subjectName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: "100%",
    height: 140,
    backgroundColor: COLORS.border,
  },
  badge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  videoBadge: {
    backgroundColor: COLORS.accent,
  },
  lockedBadge: {
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  ownedBadge: {
    backgroundColor: "rgba(34,139,34,0.85)",
  },
  badgeText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: "700",
  },
  info: {
    padding: 12,
  },
  type: {
    fontSize: FONTS.tiny,
    fontWeight: "600",
    color: COLORS.primary,
    marginBottom: 4,
    letterSpacing: 1,
  },
  title: {
    fontSize: FONTS.regular,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  subject: {
    fontSize: FONTS.small,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
});
