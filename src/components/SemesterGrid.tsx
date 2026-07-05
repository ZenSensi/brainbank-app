import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, FONTS, SEMESTERS } from "../constants";

interface Props {
  onSelect: (semester: number) => void;
}

export default function SemesterGrid({ onSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Browse by Semester</Text>
      <View style={styles.grid}>
        {SEMESTERS.map((sem) => (
          <TouchableOpacity
            key={sem.id}
            style={styles.card}
            onPress={() => onSelect(sem.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.semesterNumber}>S{sem.id}</Text>
            <Text style={styles.semesterName}>{sem.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  card: {
    width: "30%",
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  semesterNumber: {
    fontSize: FONTS.heading,
    fontWeight: "800",
    color: COLORS.surface,
  },
  semesterName: {
    fontSize: FONTS.tiny,
    color: COLORS.surface,
    marginTop: 4,
    opacity: 0.9,
  },
});
