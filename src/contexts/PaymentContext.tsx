import { createContext, useContext, useState, ReactNode } from "react";
import { Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "./AuthContext";
import { grantMembership, isContentPurchased, checkMembershipStatus } from "../services/purchaseService";
import { MEMBERSHIP_PRICE } from "../constants";

interface PaymentContextType {
  processPayment: (amount: number, description: string, contentId?: string, type?: "notes" | "pyq") => Promise<boolean>;
  processMembership: () => Promise<boolean>;
  isProcessing: boolean;
}

const PaymentContext = createContext<PaymentContextType>({
  processPayment: async () => false,
  processMembership: async () => false,
  isProcessing: false,
});

const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || "";
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export function PaymentProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, refreshUser } = useAuth();

  const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch {
      clearTimeout(id);
      throw new Error("Network request failed");
    }
  };

  const getAuthToken = async (): Promise<string | null> => {
    try {
      const { auth } = await import("../constants/firebase");
      const token = await auth.currentUser?.getIdToken();
      return token || null;
    } catch {
      return null;
    }
  };

  const pollPurchaseStatus = async (
    contentId?: string,
    type?: "notes" | "pyq" | "membership"
  ): Promise<boolean> => {
    if (!user) return false;
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds total

    while (attempts < maxAttempts) {
      if (type === "membership") {
        const hasMembership = await checkMembershipStatus(user.id);
        if (hasMembership) return true;
      } else if (contentId) {
        const isPurchased = await isContentPurchased(user.id, contentId);
        if (isPurchased) return true;
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      attempts++;
    }
    return false;
  };

  const processPayment = async (
    amount: number,
    description: string,
    contentId?: string,
    type?: "notes" | "pyq"
  ): Promise<boolean> => {
    if (!user) {
      Alert.alert("Login Required", "Please login to make a purchase");
      return false;
    }

    setIsProcessing(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Could not authenticate. Please login again.");
        return false;
      }

      const orderRes = await fetchWithTimeout(`${API_URL}/api/payments/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          contentId,
          amount,
          type: type || (contentId ? "notes" : "membership"),
        }),
      });

      if (!orderRes.ok) {
        const errorBody = await orderRes.text();
        console.error("Create order failed:", orderRes.status, errorBody);
        Alert.alert("Error", `Payment failed (${orderRes.status}): ${errorBody.substring(0, 200)}`);
        return false;
      }

      let orderData;
      try {
        orderData = await orderRes.json();
      } catch {
        const text = await orderRes.text();
        console.error("Invalid JSON response:", text.substring(0, 300));
        Alert.alert("Error", "Server returned invalid response. Check backend logs.");
        return false;
      }

      const { paymentLinkUrl } = orderData;
      if (!paymentLinkUrl) {
        console.error("No paymentLinkUrl in response:", JSON.stringify(orderData));
        Alert.alert("Error", "Payment link not found in server response");
        return false;
      }

      // Open the payment page in the system browser
      await WebBrowser.openBrowserAsync(paymentLinkUrl);

      // Now poll for completion in Firestore (updated by webhook)
      const success = await pollPurchaseStatus(contentId, type);
      if (success) {
        await refreshUser();
        return true;
      }

      return false;
    } catch (error: any) {
      Alert.alert("Payment Failed", error?.message || "Something went wrong");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const processMembership = async (): Promise<boolean> => {
    if (!user) {
      Alert.alert("Login Required", "Please login first");
      return false;
    }

    setIsProcessing(true);
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Could not authenticate. Please login again.");
        return false;
      }

      const orderRes = await fetchWithTimeout(`${API_URL}/api/payments/create-membership-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });

      if (!orderRes.ok) {
        Alert.alert("Error", "Failed to create membership order");
        return false;
      }

      const { paymentLinkUrl } = await orderRes.json();
      if (!paymentLinkUrl) {
        Alert.alert("Error", "Payment link not found in server response");
        return false;
      }

      // Open payment page
      await WebBrowser.openBrowserAsync(paymentLinkUrl);

      // Poll membership purchase status
      const success = await pollPurchaseStatus(undefined, "membership");
      if (success) {
        await refreshUser();
        return true;
      }

      return false;
    } catch (error: any) {
      Alert.alert("Payment Failed", error?.message || "Something went wrong");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PaymentContext.Provider value={{ processPayment, processMembership, isProcessing }}>
      {children}
    </PaymentContext.Provider>
  );
}

export const usePayment = () => useContext(PaymentContext);
