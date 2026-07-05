import { useState, useEffect, useCallback } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { getSavedItems, toggleSaveItem } from "../../src/services/saveService";
import { COLORS, FONTS, FONT_WEIGHTS, SPACING, BORDER_RADIUS, CURRENCY_SYMBOL, MEMBERSHIP_PRICE } from "../../src/constants";

type SavedItem = {
  id: string;
  title: string;
  type: string;
  playlistId?: string;
};

export default function ProfileScreen() {
  const { user, signOut, isAuthenticated } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: signOut },
    ]);
  };

  const loadSaved = async () => {
    const items = await getSavedItems();
    setSavedItems(items);
  };

  // Reload saved items every time the tab comes into focus
  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, [])
  );

  const handleUnsave = async (item: SavedItem) => {
    await toggleSaveItem(item);
    setSavedItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  const handleOpenSaved = (item: SavedItem) => {
    if (item.type === "video" && item.playlistId) {
      const { Linking } = require("react-native");
      Linking.openURL(`https://www.youtube.com/playlist?list=${item.playlistId}`);
    } else {
      router.push(`/content/${item.id}` as any);
    }
  };

  const getIconForType = (type: string) => {
    if (type === "video") return "play-circle";
    if (type === "pyq") return "newspaper";
    return "document-text";
  };

  const getIconBgForType = (type: string) => {
    if (type === "video") return COLORS.tertiaryContainer;
    if (type === "pyq") return COLORS.secondaryContainer;
    return COLORS.primaryContainer;
  };

  const getIconColorForType = (type: string) => {
    if (type === "video") return COLORS.tertiary;
    if (type === "pyq") return COLORS.secondary;
    return COLORS.primary;
  };

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
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

          <View style={styles.emptyState}>
            <Ionicons name="person-circle-outline" size={80} color={COLORS.outlineVariant} />
            <Text style={styles.emptyTitle}>Not Logged In</Text>
            <Text style={styles.emptyDesc}>Login to access your profile, purchases, and membership</Text>
            <TouchableOpacity style={styles.loginBtn} onPress={() => router.push("/(auth)/login")}>
              <Ionicons name="log-in" size={18} color={COLORS.onPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.loginBtnText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const displayName = user?.displayName || "Student";

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={[styles.avatar, { borderWidth: 2, borderColor: COLORS.primaryContainer }]}>
              <Ionicons name="person" size={20} color={COLORS.primary} />
            </View>
            <Text style={styles.appName}>Brain Bank</Text>
          </View>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.onSurface} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileAvatarLarge}>
            <Ionicons name="person" size={36} color={COLORS.onPrimary} />
          </View>
          <Text style={styles.profileName}>{displayName}</Text>
          <Text style={styles.profileEmail}>{user?.email || ""}</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badgePrimary}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.onPrimary} style={{ marginRight: 4 }} />
              <Text style={styles.badgePrimaryText}>Verified Student</Text>
            </View>
            {user?.isMember && (
              <View style={styles.badgeSecondary}>
                <Ionicons name="star" size={14} color={COLORS.onSecondaryContainer} style={{ marginRight: 4 }} />
                <Text style={styles.badgeSecondaryText}>Premium Member</Text>
              </View>
            )}
          </View>
        </View>

        {/* Saved Notes */}
        <View style={styles.savedSection}>
          <Text style={styles.sectionTitle}>Saved Notes</Text>

          {savedItems.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="bookmark-outline" size={40} color={COLORS.outlineVariant} style={{ marginBottom: 8 }} />
              <Text style={styles.emptyCardText}>You haven't saved anything yet</Text>
              <Text style={styles.emptyCardSub}>Tap the bookmark icon on any note, PYQ, or playlist to save it here</Text>
            </View>
          ) : (
            savedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.savedCard}
                onPress={() => handleOpenSaved(item)}
                activeOpacity={0.7}
              >
                <View style={[styles.savedIcon, { backgroundColor: getIconBgForType(item.type) }]}>
                  <Ionicons name={getIconForType(item.type) as any} size={22} color={getIconColorForType(item.type)} />
                </View>
                <View style={styles.savedInfo}>
                  <Text style={styles.savedTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.savedType}>
                    {item.type === "video" ? "YouTube Playlist" : item.type === "pyq" ? "PYQ Paper" : "Notes"}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleUnsave(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name="bookmark" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingsCard}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="color-palette-outline" size={22} color={COLORS.onSurface} />
                <Text style={styles.settingLabel}>Theme</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>Lavender Light</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={22} color={COLORS.onSurface} />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>Enabled</Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.settingItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push("/membership")}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="star-outline" size={22} color={COLORS.onSurface} />
                <Text style={styles.settingLabel}>
                  {user?.isMember ? "Membership Active" : "Get Membership"}
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={styles.settingValue}>
                  {user?.isMember ? "Lifetime" : `${CURRENCY_SYMBOL}${MEMBERSHIP_PRICE}`}
                </Text>
                <Ionicons name="chevron-forward" size={18} color={COLORS.outline} />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.error} style={{ marginRight: 8 }} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>
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
  profileSection: {
    alignItems: "center",
    paddingTop: 16,
    marginBottom: SPACING.sectionGap,
  },
  profileAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 3,
    borderColor: COLORS.primaryContainer,
  },
  profileName: {
    fontSize: FONTS.headlineLg,
    fontWeight: FONT_WEIGHTS.headlineLg,
    color: COLORS.onSurface,
  },
  profileEmail: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    gap: SPACING.inlinePillGap,
    marginTop: 12,
  },
  badgePrimary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.full,
  },
  badgePrimaryText: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.onPrimary,
  },
  badgeSecondary: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: COLORS.secondaryContainer,
    borderRadius: BORDER_RADIUS.full,
  },
  badgeSecondaryText: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.onSecondaryContainer,
  },
  savedSection: {
    paddingHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.sectionGap,
  },
  sectionTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.surfaceContainer,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    borderStyle: "dashed",
  },
  emptyCardText: {
    fontSize: FONTS.bodyLg,
    fontWeight: "600",
    color: COLORS.onSurface,
    marginBottom: 4,
    textAlign: "center",
  },
  emptyCardSub: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 20,
  },
  savedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    padding: 14,
    borderRadius: BORDER_RADIUS.DEFAULT,
    marginBottom: SPACING.stackGap,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  savedIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  savedInfo: {
    flex: 1,
  },
  savedTitle: {
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  savedType: {
    fontSize: FONTS.labelSm,
    color: COLORS.onSurfaceVariant,
    marginTop: 2,
  },
  settingsSection: {
    paddingHorizontal: SPACING.containerMargin,
    marginBottom: SPACING.sectionGap,
  },
  settingsCard: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    overflow: "hidden",
    shadowColor: COLORS.surfaceTint,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(202, 196, 212, 0.3)",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  settingLabel: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurface,
  },
  settingRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  settingValue: {
    fontSize: FONTS.labelLg,
    color: COLORS.onSurfaceVariant,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: SPACING.containerMargin,
    paddingVertical: 16,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: COLORS.error,
    marginBottom: 20,
  },
  logoutBtnText: {
    color: COLORS.error,
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
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
