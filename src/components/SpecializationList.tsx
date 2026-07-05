import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SPECIALIZATIONS } from "../constants";

interface Props {
  onSelect: (specId: string) => void;
}

export default function SpecializationList({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Specializations</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {SPECIALIZATIONS.map((spec) => (
          <TouchableOpacity
            key={spec.id}
            style={styles.card}
            onPress={() => onSelect(spec.id)}
            activeOpacity={0.7}
          >
            <Ionicons name={spec.icon as any} size={28} color={COLORS.primary} style={styles.icon} />
            <Text style={styles.name}>{spec.name}</Text>
            <Text style={styles.desc}>{spec.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: FONTS.large,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 12,
  },
  scroll: {
    gap: 12,
    paddingRight: 20,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    width: 150,
    minHeight: 130,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  icon: {
    marginBottom: 8,
  },
  name: {
    fontSize: FONTS.regular,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 4,
  },
  desc: {
    fontSize: FONTS.tiny,
    color: COLORS.textSecondary,
  },
});
