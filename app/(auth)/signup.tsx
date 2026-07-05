import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/constants/firebase";
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from "../../src/constants";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    const trimName = name.trim();
    const trimEmail = email.trim().toLowerCase();

    if (!trimName) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }
    if (!trimEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Passwords Don't Match", "Please make sure both passwords are the same.");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Create Firebase Auth account
      const credential = await createUserWithEmailAndPassword(auth, trimEmail, password);
      const fbUser = credential.user;

      // 2. Update display name in Firebase Auth profile
      await updateProfile(fbUser, { displayName: trimName });

      // 3. Create user document in Firestore (purchases will be linked to this uid)
      await setDoc(doc(db, "users", fbUser.uid), {
        id: fbUser.uid,
        displayName: trimName,
        email: trimEmail,
        phone: "",
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(trimName)}&background=674bb5&color=fff`,
        isMember: false,
        createdAt: Date.now(),
      });

      Alert.alert(
        "Account Created! 🎉",
        `Welcome to Brain Bank, ${trimName}! You can now purchase notes and PYQs. Your purchases are saved to your account and can be accessed anytime you log back in.`,
        [{ text: "Start Exploring", onPress: () => router.replace("/(tabs)") }]
      );
    } catch (error: any) {
      let msg = "Signup failed. Please try again.";
      if (error?.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Please log in instead.";
      } else if (error?.code === "auth/invalid-email") {
        msg = "Invalid email address.";
      } else if (error?.code === "auth/weak-password") {
        msg = "Password is too weak. Use at least 6 characters.";
      }
      Alert.alert("Signup Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={COLORS.onSurface} />
        </TouchableOpacity>

        <View style={styles.logoContainer}>
          <Ionicons name="school" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Sign up to save & access your purchases anytime</Text>

        {/* Full Name */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={20} color={COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={COLORS.outline}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputRow}>
            <Ionicons name="mail-outline" size={20} color={COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={COLORS.outline}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Minimum 6 characters"
              placeholderTextColor={COLORS.outline}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="next"
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.outline} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Confirm Password */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Re-enter your password"
              placeholderTextColor={COLORS.outline}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)} style={styles.eyeBtn}>
              <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.outline} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSignup}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Creating Account...</Text>
          ) : (
            <>
              <Ionicons name="person-add" size={18} color={COLORS.onPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Create Account</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={styles.loginPrompt}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/login")}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Info card */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.primary} style={{ marginRight: 10 }} />
          <Text style={styles.infoText}>
            Your purchases are permanently linked to your account. Sign out and back in anytime to reaccess everything you've bought.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: 16,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: COLORS.surfaceContainer,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: FONTS.displayMobile,
    fontWeight: FONT_WEIGHTS.display,
    color: COLORS.onSurface,
    textAlign: "center",
  },
  subtitle: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 32,
    marginTop: 4,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: FONTS.labelLg,
    fontWeight: FONT_WEIGHTS.labelLg,
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurface,
  },
  eyeBtn: {
    padding: 4,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 24,
  },
  loginPrompt: {
    fontSize: FONTS.bodyMd,
    color: COLORS.onSurfaceVariant,
  },
  loginLink: {
    fontSize: FONTS.bodyMd,
    color: COLORS.primary,
    fontWeight: "700",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: COLORS.primaryContainer,
    borderRadius: BORDER_RADIUS.DEFAULT,
    padding: 14,
  },
  infoText: {
    flex: 1,
    fontSize: FONTS.labelLg,
    color: COLORS.onPrimaryContainer,
    lineHeight: 20,
  },
});
