import { useState, useEffect } from "react";
import { Alert as RNAlert, AlertButton, Modal, View, Text, TouchableOpacity, StyleSheet, Keyboard, Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/contexts/AuthContext";
import { PaymentProvider } from "../src/contexts/PaymentContext";
import { SafeAreaProvider } from "react-native-safe-area-context";

// Global callback for the custom alert override
let globalAlertCallback: ((
  title: string,
  message: string,
  buttons?: AlertButton[]
) => void) | null = null;

// Intercept all native Alert.alert calls globally
// @ts-ignore
RNAlert.alert = (title: string, message?: string, buttons?: AlertButton[]) => {
  if (globalAlertCallback) {
    globalAlertCallback(title, message || "", buttons);
  } else {
    // Fallback in case alert triggers before root layout mounts
    console.warn("Global alert fired before mount:", title, message);
  }
};

export default function RootLayout() {
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertButtons, setAlertButtons] = useState<AlertButton[]>([]);

  useEffect(() => {
    globalAlertCallback = (title, message, buttons) => {
      Keyboard.dismiss();
      setAlertTitle(title);
      setAlertMessage(message);
      setAlertButtons(buttons || [{ text: "OK" }]);
      setAlertVisible(true);
    };
    return () => {
      globalAlertCallback = null;
    };
  }, []);

  const handleButtonPress = (btn: AlertButton) => {
    setAlertVisible(false);
    if (btn.onPress) {
      btn.onPress();
    }
  };

  const isVerticalLayout = alertButtons.length > 2 || alertButtons.some(b => (b.text || "").length > 12);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaymentProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="content/[id]" options={{ presentation: "modal" }} />
            <Stack.Screen name="payment/checkout" options={{ presentation: "modal" }} />
            <Stack.Screen name="membership/index" options={{ presentation: "modal" }} />
            <Stack.Screen name="search" options={{ presentation: "modal" }} />
          </Stack>

          {/* Global Custom Themed Alert Modal */}
          <Modal
            visible={alertVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setAlertVisible(false)}
          >
            <View style={styles.alertOverlay}>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>{alertTitle}</Text>
                {alertMessage ? <Text style={styles.alertMessage}>{alertMessage}</Text> : null}
                
                <View style={isVerticalLayout ? styles.buttonContainerVertical : styles.buttonContainer}>
                  {alertButtons.map((btn, index) => {
                    const isCancel = btn.style === "cancel";
                    const isDestructive = btn.style === "destructive";
                    
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          isVerticalLayout ? styles.buttonVertical : styles.button,
                          isCancel ? styles.buttonCancel : isDestructive ? styles.buttonDestructive : styles.buttonConfirm
                        ]}
                        onPress={() => handleButtonPress(btn)}
                      >
                        <Text style={[
                          styles.buttonText,
                          { color: isCancel ? "#494552" : "#ffffff" }
                        ]}>
                          {btn.text}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </Modal>
        </PaymentProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(10, 5, 25, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  alertContent: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#674bb5",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#674bb5",
    marginBottom: 8,
    textAlign: "center",
  },
  alertMessage: {
    fontSize: 14,
    color: "#494552",
    lineHeight: 20,
    marginBottom: 24,
    textAlign: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonContainerVertical: {
    flexDirection: "column",
    gap: 10,
    width: "100%",
  },
  button: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  buttonVertical: {
    width: "100%",
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonConfirm: {
    backgroundColor: "#674bb5",
  },
  buttonCancel: {
    backgroundColor: "#f0f0f5",
    borderWidth: 1,
    borderColor: "#cac4d4",
  },
  buttonDestructive: {
    backgroundColor: "#ba1a1a",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
