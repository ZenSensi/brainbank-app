import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import ContentCard from "../src/components/ContentCard";
import { searchContent } from "../src/services/contentService";
import { ContentItem } from "../src/types";
import { COLORS, FONTS, BORDER_RADIUS } from "../src/constants";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const items = await searchContent(query);
        setResults(items);
      } catch {
        setResults([]);
      }
      setSearching(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  const handleContentPress = (item: ContentItem) => {
    router.push(`/content/${item.id}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={COLORS.outline} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.input}
            placeholder="Search notes, PYQs, subjects..."
            placeholderTextColor={COLORS.outline}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color={COLORS.outline} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.results}>
        {searching && (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
        )}
        {!searching && query.length > 0 && results.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="search" size={48} color={COLORS.outlineVariant} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptyDesc}>Try searching for a different term</Text>
          </View>
        )}
        {results.map((item) => (
          <ContentCard key={item.id} item={item} onPress={handleContentPress} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: 16,
    paddingTop: 60,
    backgroundColor: COLORS.background,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.surfaceContainerLow,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurface,
  },
  results: {
    padding: 20,
    gap: 12,
  },
  empty: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: FONTS.headlineMd,
    fontWeight: "700",
    color: COLORS.onSurface,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: FONTS.bodyLg,
    color: COLORS.onSurfaceVariant,
  },
});
