import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "../src/contexts/AuthContext";
import { PaymentProvider } from "../src/contexts/PaymentContext";

export default function RootLayout() {
  return (
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
      </PaymentProvider>
    </AuthProvider>
  );
}
