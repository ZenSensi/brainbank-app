import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { ContentItem } from "../types";
import { COLORS, FONTS } from "../constants";

interface Props {
  item: ContentItem;
}

export default function VideoCard({ item }: Props) {
  const handlePlay = async () => {
    if (item.youtubePlaylistId) {
      await WebBrowser.openBrowserAsync(
        `https://www.youtube.com/playlist?list=${item.youtubePlaylistId}`
      );
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePlay} activeOpacity={0.7}>
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.playBadge}>
        <Text style={styles.playIcon}>▶</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.type}>FREE VIDEO</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.subject}>{item.subjectName}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginRight: 12,
    width: 220,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: "100%",
    height: 120,
    backgroundColor: COLORS.border,
  },
  playBadge: {
    position: "absolute",
    top: "30%",
    left: "40%",
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 24,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  playIcon: {
    color: COLORS.surface,
    fontSize: 20,
  },
  info: {
    padding: 10,
  },
  type: {
    fontSize: 10,
    fontWeight: "700",
    color: COLORS.accent,
    letterSpacing: 1,
  },
  title: {
    fontSize: FONTS.regular,
    fontWeight: "600",
    color: COLORS.text,
    marginTop: 2,
  },
  subject: {
    fontSize: FONTS.tiny,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
