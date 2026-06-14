import React from "react";
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const quickActions = [
  {
    key: "wheel",
    title: "Vòng quay",
    subtitle: "Random bằng wheel",
    screen: "WheelSpinning",
  },
  {
    key: "number",
    title: "Số ngẫu nhiên",
    subtitle: "Chọn số nhanh",
    screen: "NumberRandom",
  },
];

export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground
      source={require("../../assets/background.jpeg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.kicker}>RANDOM APP</Text>
          <Text style={styles.title}>Boilerplate chuẩn cho app random</Text>
          <Text style={styles.description}>
            Giao diện nền tảng gọn, hiện đại, dễ mở rộng cho feature mới.
          </Text>
        </View>

        <View style={styles.grid}>
          {quickActions.map((item) => (
            <Pressable
              key={item.key}
              onPress={() => navigation.navigate(item.screen)}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.cardPressed,
              ]}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={() => navigation.navigate("History")}
            style={({ pressed }) => [
              styles.footerButton,
              pressed && styles.footerButtonPressed,
            ]}
          >
            <Text style={styles.footerButtonText}>Xem lịch sử</Text>
          </Pressable>
          <Pressable
            onPress={() => navigation.navigate("Settings")}
            style={({ pressed }) => [
              styles.footerButtonSecondary,
              pressed && styles.footerButtonPressed,
            ]}
          >
            <Text style={styles.footerButtonSecondaryText}>Cài đặt</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 14, 25, 0.72)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  header: { paddingTop: 12 },
  kicker: {
    color: "#A5B4FC",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "800",
    maxWidth: 320,
  },
  description: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
    maxWidth: 330,
  },
  grid: { gap: 14 },
  card: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  cardPressed: { transform: [{ scale: 0.98 }], opacity: 0.9 },
  cardTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.72)",
    marginTop: 6,
    fontSize: 14,
  },
  footer: { flexDirection: "row", gap: 12 },
  footerButton: {
    flex: 1,
    backgroundColor: "#6366F1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  footerButtonSecondary: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
  },
  footerButtonPressed: { opacity: 0.88 },
  footerButtonText: { color: "#FFFFFF", fontWeight: "700" },
  footerButtonSecondaryText: { color: "#FFFFFF", fontWeight: "700" },
});
