import { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../src/constants/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from "../../src/constants";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async () => {
    const trimEmail = email.trim().toLowerCase();
    if (!trimEmail.includes("@")) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Invalid Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, trimEmail, password);
      const fbUser = credential.user;

      // Ensure user doc exists (for users who signed up via phone/google previously)
      const userDocRef = doc(db, "users", fbUser.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          id: fbUser.uid,
          displayName: fbUser.displayName || "Student",
          email: trimEmail,
          phone: "",
          photoURL: `https://ui-avatars.com/api/?name=Student&background=674bb5&color=fff`,
          isMember: false,
          createdAt: Date.now(),
        });
      }

      router.replace("/(tabs)");
    } catch (error: any) {
      let msg = "Login failed. Please check your email and password.";
      if (error?.code === "auth/user-not-found" || error?.code === "auth/invalid-credential") {
        msg = "No account found with this email. Please sign up first.";
      } else if (error?.code === "auth/wrong-password") {
        msg = "Incorrect password. Please try again.";
      } else if (error?.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please try again later.";
      }
      Alert.alert("Login Failed", msg);
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
        <View style={styles.logoContainer}>
          <Ionicons name="school" size={56} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Brain Bank</Text>
        <Text style={styles.subtitle}>Your BCA Study Companion</Text>

        {/* Email Field */}
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

        {/* Password Field */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.inputRow}>
            <Ionicons name="lock-closed-outline" size={20} color={COLORS.outline} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={COLORS.outline}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleEmailLogin}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={COLORS.outline}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleEmailLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <Text style={styles.buttonText}>Signing In...</Text>
          ) : (
            <>
              <Ionicons name="log-in" size={18} color={COLORS.onPrimary} style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Log In</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Sign Up */}
        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => router.push("/(auth)/signup")}
          disabled={isLoading}
        >
          <Ionicons name="person-add-outline" size={18} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.signupText}>Create New Account</Text>
        </TouchableOpacity>

        {/* Info about persistent purchases */}
        <View style={styles.infoCard}>
          <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={styles.infoText}>
            All your purchased notes and PYQs are linked to your account. Sign out anytime and log back in to reaccess them.
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
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: "center",
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
    marginBottom: 40,
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
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: FONTS.bodyLg,
    fontWeight: "700",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.outlineVariant,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: FONTS.labelLg,
    color: COLORS.outline,
  },
  signupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 14,
    marginBottom: 24,
  },
  signupText: {
    fontSize: FONTS.bodyLg,
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
