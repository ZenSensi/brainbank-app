import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/contexts/AuthContext";
import { usePayment } from "../../src/contexts/PaymentContext";
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS, CURRENCY_SYMBOL, MEMBERSHIP_PRICE, NOTES_PRICE } from "../../src/constants";

export default function MembershipScreen() {
  const { user } = useAuth();
  const { processMembership } = usePayment();
  const [loading, setLoading] = useState(false);

  const handleBuyMembership = async () => {
    if (!user) {
      router.push("/(auth)/login");
      return;
    }

    Alert.alert(
      "Unlock Lifetime Membership",
      `Pay ${CURRENCY_SYMBOL}${MEMBERSHIP_PRICE} to get lifetime access.\n\nYou will be redirected to your UPI app (GPay, PhonePe, FamPay, etc.) to complete the payment.\n\n⚠️ IMPORTANT: After payment, please COPY the 12-digit UPI Reference No. (UTR) from your payment app's history. You will need to paste it in the next screen to unlock your membership.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: `Pay ${CURRENCY_SYMBOL}${MEMBERSHIP_PRICE}`,
          style: "default",
          onPress: async () => {
            setLoading(true);
            const success = await processMembership();
            if (success) {
              Alert.alert(
                "Welcome to Premium! 🎉",
                "You now have lifetime access to all current and future content.",
                [{ text: "Awesome!", onPress: () => router.back() }]
              );
            } else {
              Alert.alert(
                "Payment Incomplete",
                "If you completed the payment, please wait a moment and refresh. If not, you can try again."
              );
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.iconContainer}>
        <Ionicons name="star" size={56} color="#FFD700" />
      </View>
      <Text style={styles.title}>Lifetime Membership</Text>
      <Text style={styles.subtitle}>Unlock everything, forever</Text>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>One-time payment</Text>
        <Text style={styles.price}>{CURRENCY_SYMBOL}{MEMBERSHIP_PRICE}</Text>
        <Text style={styles.priceDesc}>No recurring charges. Ever.</Text>
      </View>

      <View style={styles.benefits}>
        <Text style={styles.benefitsTitle}>What you get:</Text>
        {[
          { text: "All notes PDFs (current & future)", icon: "document-text" },
          { text: "All PYQs (current & future)", icon: "newspaper" },
          { text: "Unlimited downloads", icon: "download" },
          { text: "Offline access", icon: "phone-portrait" },
          { text: "No ads", icon: "ban" },
          { text: "Priority access to new content", icon: "star" },
        ].map((benefit, i) => (
          <View key={i} style={styles.benefitRow}>
            <Ionicons name={benefit.icon as any} size={20} color={COLORS.primary} style={{ marginRight: 12 }} />
            <Text style={styles.benefitText}>{benefit.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.comparison}>
        <Text style={styles.comparisonTitle}>Compare:</Text>
        <View style={styles.compareRow}>
          <Text style={styles.compareLabel}>Single PDF</Text>
          <Text style={styles.compareValue}>{CURRENCY_SYMBOL}{NOTES_PRICE}</Text>
        </View>
        <View style={styles.compareRow}>
          <Text style={styles.compareLabel}>5 PDFs</Text>
          <Text style={styles.compareValue}>{CURRENCY_SYMBOL}{NOTES_PRICE * 5}</Text>
        </View>
        <View style={[styles.compareRow, styles.compareHighlight]}>
          <Text style={styles.compareLabel}>Membership (unlimited)</Text>
          <Text style={styles.compareValue}>{CURRENCY_SYMBOL}{MEMBERSHIP_PRICE}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.buyBtn, loading && styles.buyBtnDisabled]}
        onPress={handleBuyMembership}
        disabled={loading}
      >
        {user?.isMember && !loading && (
          <Ionicons name="checkmark-circle" size={20} color={COLORS.onSurface} style={{ marginRight: 8 }} />
        )}
        <Text style={styles.buyBtnText}>
          {loading
            ? "Processing..."
            : user?.isMember
              ? "Already a Member"
              : `Get Membership - ${CURRENCY_SYMBOL}${MEMBERSHIP_PRICE}`}
        </Text>
      </TouchableOpacity>

      {user?.isMember && (
        <Text style={styles.activeNote}>You are already a premium member. Enjoy unlimited access!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 20,
  },
  backText: {
    fontSize: FONTS.bodyLg,
    color: COLORS.primary,
    fontWeight: "600",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: FONTS.displayMobile,
    fontWeight: FONT_WEIGHTS.display,
    color: COLORS.onSurface,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 24,
  },
  priceCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: FONTS.labelLg,
    color: COLORS.onPrimary,
    opacity: 0.9,
  },
  price: {
    fontSize: 48,
    fontWeight: "800",
    color: COLORS.onPrimary,
    marginVertical: 4,
  },
  priceDesc: {
    fontSize: FONTS.labelSm,
    color: COLORS.onPrimary,
    opacity: 0.8,
  },
  benefits: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 2,
  },
  benefitsTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 16,
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  benefitText: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurface,
  },
  comparison: {
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 20,
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 25,
    elevation: 2,
  },
  comparisonTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: FONT_WEIGHTS.headlineMd,
    color: COLORS.onSurface,
    marginBottom: 12,
  },
  compareRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  compareHighlight: {
    backgroundColor: COLORS.primaryFixed,
    marginHorizontal: -8,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderBottomWidth: 0,
  },
  compareLabel: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurface,
  },
  compareValue: {
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  buyBtn: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buyBtnDisabled: {
    opacity: 0.6,
  },
  buyBtnText: {
    color: COLORS.onSurface,
    fontSize: FONTS.bodyLg,
    fontWeight: "800",
  },
  activeNote: {
    textAlign: "center",
    color: COLORS.tertiary,
    fontSize: FONTS.labelLg,
    marginTop: 16,
    fontWeight: "600",
  },
});
