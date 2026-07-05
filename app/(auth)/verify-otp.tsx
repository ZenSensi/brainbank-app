import { useState, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PhoneAuthProvider, signInWithCredential, signInWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../src/constants/firebase";
import { COLORS, FONTS, FONT_WEIGHTS, BORDER_RADIUS } from "../../src/constants";

export default function VerifyOTPScreen() {
  const { verificationId, phone } = useLocalSearchParams<{ verificationId: string; phone: string }>();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) {
      Alert.alert("Invalid OTP", "Please enter the complete 6-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      let userId = "";

      if (verificationId === "mock-verification-id") {
        // Mock phone sign-in mode for development / Expo Go
        if (code !== "123456") {
          throw new Error("Invalid verification code. Enter '123456' for development.");
        }
        
        // Map this phone to a custom test email account in Firebase
        const mockEmail = `phone_${phone?.replace("+", "")}@brainbank.com`;
        const testPassword = "brainbank-test-password-123";
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, mockEmail, testPassword);
        } catch (err: any) {
          if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/invalid-email") {
            const { createUserWithEmailAndPassword } = await import("firebase/auth");
            userCredential = await createUserWithEmailAndPassword(auth, mockEmail, testPassword);
          } else {
            throw err;
          }
        }
        userId = userCredential.user.uid;
      } else {
        // Real Phone Authentication fallback for production native environment
        const credential = PhoneAuthProvider.credential(verificationId!, code);
        const userCredential = await signInWithCredential(auth, credential);
        userId = userCredential.user.uid;
      }

      // Sync Firestore user node
      await setDoc(doc(db, "users", userId), {
        id: userId,
        phone: phone,
        displayName: `Student ${phone?.slice(-4)}`,
        email: `student_${phone?.slice(-4)}@gmail.com`,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(phone?.slice(-4) || "User")}&background=674bb5&color=fff`,
        isMember: false,
        createdAt: Date.now(),
      }, { merge: true });

      Alert.alert("Welcome!", "Signed in successfully!");
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Verification Failed", error?.message || "Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>Enter the 6-digit code sent to {phone}</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleOtpChange(text, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Verifying..." : "Verify & Login"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => Alert.alert("Verification Hint", "Enter '123456' for developer verification mode.")}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: FONTS.displayMobile,
    fontWeight: FONT_WEIGHTS.display,
    color: COLORS.onSurface,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
    marginBottom: 32,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: BORDER_RADIUS.DEFAULT,
    borderWidth: 1,
    borderColor: COLORS.outlineVariant,
    textAlign: "center",
    fontSize: FONTS.headlineMd,
    fontWeight: "700",
    color: COLORS.onSurface,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 16,
    alignItems: "center",
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
  resendText: {
    textAlign: "center",
    color: COLORS.primary,
    fontSize: FONTS.bodyLg,
    fontWeight: "600",
  },
});
