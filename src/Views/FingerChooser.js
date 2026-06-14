import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Animated,
  PanResponder,
  Platform,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { getBottomSpace } from "react-native-iphone-x-helper-2";
import Utils from "../Utils/utils";
import Header from "../Component/Header";
import { TopAd, BottomAd } from "../Component/AdBanner";
import { Text, GlassCard } from "../Component/Common";

const keyLocalConfigs = "@!keyLocalConfigs";

const COLORS = [
  "#FF416C", // Red-pink
  "#17EAD9", // Mint-cyan
  "#38ef7d", // Neon green
  "#b92b27", // Blue-purple
  "#FAD961", // Gold-yellow
  "#F857A6", // Magenta
];

const getRandomColor = (id) => {
  const index = Math.abs(id) % COLORS.length;
  return COLORS[index];
};

const translations = {
  vi: {
    title: "Chọn ngón tay",
    instruction: "Đặt từ 2 ngón tay trở lên để chọn",
    countdownText: "Đang đếm ngược...",
    selectedText: "Đã tìm ra người may mắn!",
  },
  en: {
    title: "Finger Chooser",
    instruction: "Place 2 or more fingers to start",
    countdownText: "Choosing in...",
    selectedText: "Winner Chosen!",
  },
  de: {
    title: "Finger-Wähler",
    instruction: "Legen Sie 2 oder mehr Finger auf",
    countdownText: "Auswahl in...",
    selectedText: "Gewinner ausgewählt!",
  },
  fr: {
    title: "Sélecteur de Doigt",
    instruction: "Placez 2 doigts ou plus pour commencer",
    countdownText: "Sélection dans...",
    selectedText: "Gagnant choisi !",
  },
  pt: {
    title: "Escolha de Dedo",
    instruction: "Coloque 2 ou mais dedos para começar",
    countdownText: "Escolhendo em...",
    selectedText: "Vencedor escolhido!",
  },
  hi: {
    title: "फिंगर चॉइस",
    instruction: "शुरू करने के लिए 2 या अधिक उंगलियां रखें",
    countdownText: "उल्टी गिनती...",
    selectedText: "विजेता चुना गया!",
  },
};

export default function FingerChooser({ navigation }) {
  const [lang, setLang] = useState("en");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [touches, setTouches] = useState([]);
  const [gameState, setGameState] = useState("idle"); // idle, counting, selected
  const [countdown, setCountdown] = useState(5);
  const [selectedId, setSelectedId] = useState(null);

  const timerRef = useRef(null);
  const selectedPulse = useRef(new Animated.Value(1)).current;
  const player = useAudioPlayer(require("../../assets/lucky_draw.wav"));

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    const configs = await Utils.getLocal(keyLocalConfigs);
    if (configs) {
      if (configs.lang !== undefined) {
        setLang(configs.lang);
      }
      setSoundEnabled(configs.sound !== false);
    }
  };

  const t = translations[lang] || translations.en;

  // Pulse animation for selected finger
  useEffect(() => {
    if (gameState === "selected") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(selectedPulse, {
            toValue: 1.4,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(selectedPulse, {
            toValue: 1.0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      selectedPulse.setValue(1);
    }
  }, [gameState]);

  // Countdown & Selection trigger
  useEffect(() => {
    if (gameState === "selected") return;

    if (touches.length >= 2) {
      setGameState("counting");
      setCountdown(5);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            makeSelection();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setGameState("idle");
      setCountdown(5);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [touches.length, gameState]);

  const makeSelection = () => {
    if (touches.length === 0) return;

    const selectedIdx = Math.floor(Math.random() * touches.length);
    const chosen = touches[selectedIdx];
    setSelectedId(chosen.id);
    setGameState("selected");
    setTouches([chosen]);

    if (soundEnabled) {
      try {
        player.seekTo(0);
        player.play();
      } catch (e) {
        console.log(e);
      }
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  // Touch handlers
  const handleTouch = (evt) => {
    if (gameState === "selected") return;
    const rawTouches = evt.nativeEvent.touches;

    const newTouches = rawTouches.map((t) => {
      const existing = touches.find((x) => x.id === t.identifier);
      const color = existing ? existing.color : getRandomColor(t.identifier);
      return {
        id: t.identifier,
        x: t.locationX,
        y: t.locationY,
        color: color,
      };
    });

    setTouches(newTouches);
  };

  const handleRelease = (evt) => {
    const rawTouches = evt.nativeEvent.touches;
    if (rawTouches.length === 0) {
      setTouches([]);
      setGameState("idle");
      setSelectedId(null);
      setCountdown(5);
    } else {
      if (gameState === "selected") {
        const hasSelected = rawTouches.some((t) => t.identifier === selectedId);
        if (!hasSelected) {
          setTouches([]);
          setGameState("idle");
          setSelectedId(null);
          setCountdown(5);
        } else {
          const remainingSelected = rawTouches
            .filter((t) => t.identifier === selectedId)
            .map((t) => {
              const existing = touches.find((x) => x.id === t.identifier);
              return {
                id: t.identifier,
                x: t.locationX,
                y: t.locationY,
                color: existing ? existing.color : "#FFD700",
              };
            });
          setTouches(remainingSelected);
        }
      } else {
        const remainingTouches = rawTouches.map((t) => {
          const existing = touches.find((x) => x.id === t.identifier);
          return {
            id: t.identifier,
            x: t.locationX,
            y: t.locationY,
            color: existing ? existing.color : getRandomColor(t.identifier),
          };
        });
        setTouches(remainingTouches);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: handleTouch,
      onPanResponderMove: handleTouch,
      onPanResponderRelease: handleRelease,
      onPanResponderTerminate: handleRelease,
    })
  ).current;

  return (
    <View style={styles.container}>
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />
      <Header title={t.title} navigation={navigation} />

      <TopAd containerStyle={{ marginTop: 10, alignItems: 'center' }} />

      <View style={styles.playground} {...panResponder.panHandlers}>
        {/* Background Instruction / State Label */}
        {gameState === "idle" && (
          <GlassCard style={styles.instructionCard}>
            <Text bold size={16} align="center" style={styles.instructionText}>
              {t.instruction}
            </Text>
          </GlassCard>
        )}

        {/* Countdown Number in the Center */}
        {gameState === "counting" && (
          <View style={styles.countdownContainer}>
            <Text bold size={120} color="rgba(30, 41, 59, 0.15)">
              {countdown}
            </Text>
            <Text medium size={16} color="rgba(30, 41, 59, 0.6)">
              {t.countdownText}
            </Text>
          </View>
        )}

        {/* Selected Banner */}
        {gameState === "selected" && (
          <GlassCard style={styles.instructionCard}>
            <Text bold size={18} color="#FFD700" align="center">
              🎉 {t.selectedText}
            </Text>
          </GlassCard>
        )}

        {/* Render Glowing Circles under fingers */}
        {touches.map((t) => {
          const isSelected = t.id === selectedId;
          return (
            <View
              key={t.id}
              style={[
                styles.glowCircle,
                {
                  left: t.x - 55,
                  top: t.y - 55,
                },
              ]}
              pointerEvents="none"
            >
              {/* Outer Glow */}
              <View style={[styles.glowOuter, { backgroundColor: t.color }]} />
              {/* Mid Ring */}
              <View style={[styles.glowMid, { borderColor: t.color }]} />
              {/* Inner Solid Dot */}
              <View style={[styles.glowInner, { backgroundColor: t.color }]} />

              {/* Pulsing Expand Ring for Selected winner */}
              {isSelected && (
                <Animated.View
                  style={[
                    styles.selectedRing,
                    {
                      borderColor: "#FFD700",
                      transform: [{ scale: selectedPulse }],
                      opacity: selectedPulse.interpolate({
                        inputRange: [1, 1.4],
                        outputRange: [0.8, 0.2],
                      }),
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <BottomAd />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  playground: {
    flex: 1,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionCard: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    maxWidth: "80%",
  },
  instructionText: {
    color: "#1E293B",
  },
  countdownContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  glowCircle: {
    position: "absolute",
    width: 110,
    height: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  glowOuter: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    opacity: 0.18,
  },
  glowMid: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2.5,
    opacity: 0.45,
  },
  glowInner: {
    position: "absolute",
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 3.5,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 4,
  },
  selectedRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
});
