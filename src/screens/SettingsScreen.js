import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Cài đặt</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Theme</Text>
        <Text style={styles.value}>System default</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.label}>Thông báo</Text>
        <Text style={styles.value}>Bật</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#0B1020" },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  label: { color: "rgba(255,255,255,0.7)", fontSize: 13 },
  value: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 6,
  },
});
