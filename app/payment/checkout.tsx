import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, BORDER_RADIUS } from "../../src/constants";

export default function CheckoutScreen() {
  const { url, title } = useLocalSearchParams<{ url: string; title: string }>();
  const [showPDF] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const cleanUrl = url?.split("?")[0].toLowerCase() || "";
  const isZip = cleanUrl.endsWith(".zip") || url?.toLowerCase().includes(".zip") || cleanUrl.endsWith(".rar") || url?.toLowerCase().includes(".rar");

  const handleDownload = async () => {
    if (!url) return;
    setDownloading(true);
    try {
      // Extract file extension dynamically
      let extension = "pdf";
      if (cleanUrl.endsWith(".zip") || url.toLowerCase().includes(".zip")) {
        extension = "zip";
      } else if (cleanUrl.endsWith(".rar") || url.toLowerCase().includes(".rar")) {
        extension = "rar";
      }

      const filename = `${title?.replace(/[^a-zA-Z0-9]/g, "_") || "document"}.${extension}`;
      const file = await File.downloadFileAsync(url, new File(Paths.cache, filename));
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri);
      }
    } catch (error) {
      console.error("Download Error:", error);
      Alert.alert("Download Failed", "Could not download the file. Please try again.");
    }
    setDownloading(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>{title || (isZip ? "ZIP Download" : "PDF Viewer")}</Text>
        <TouchableOpacity onPress={handleDownload} disabled={downloading}>
          {downloading ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Ionicons name="download-outline" size={24} color={COLORS.primary} />
          )}
        </TouchableOpacity>
      </View>

      {isZip ? (
        <View style={styles.zipContainer}>
          <View style={styles.zipIconBg}>
            <Ionicons name="archive" size={64} color={COLORS.primary} />
          </View>
          <Text style={styles.zipTitle}>{title || "ZIP Archive"}</Text>
          <Text style={styles.zipSubtitle}>
            This content is packed inside a ZIP file. Click below to download and save it to your device's files.
          </Text>
          <TouchableOpacity
            style={[styles.zipDownloadBtn, downloading && styles.zipDownloadBtnDisabled]}
            onPress={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <ActivityIndicator size="small" color={COLORS.onPrimary} />
            ) : (
              <>
                <Ionicons name="download" size={20} color={COLORS.onPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.zipDownloadBtnText}>Download ZIP File</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      ) : showPDF && url ? (
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          startInLoadingState
          renderLoading={() => (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={styles.loadingText}>Loading PDF...</Text>
            </View>
          )}
        />
      ) : (
        <View style={styles.center}>
          <Text style={styles.errorText}>No document URL provided</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: COLORS.surfaceContainerLowest,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.outlineVariant,
  },
  backText: {
    fontSize: FONTS.bodyLg,
    color: COLORS.primary,
    fontWeight: "600",
  },
  title: {
    fontSize: FONTS.bodyLg,
    fontWeight: "600",
    color: COLORS.onSurface,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  downloadText: {
    fontSize: FONTS.labelLg,
    color: COLORS.primary,
    fontWeight: "600",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
  },
  zipContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    backgroundColor: COLORS.background,
  },
  zipIconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surfaceContainer,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  zipTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
    marginBottom: 8,
  },
  zipSubtitle: {
    fontSize: 15,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  zipDownloadBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.DEFAULT,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: "100%",
    elevation: 2,
    shadowColor: COLORS.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  zipDownloadBtnDisabled: {
    opacity: 0.6,
  },
  zipDownloadBtnText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: "700",
  },
});
