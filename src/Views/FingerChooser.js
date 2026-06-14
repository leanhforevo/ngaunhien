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
import { getBottomSpace, getStatusBarHeight } from "react-native-iphone-x-helper-2";
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
    countdownText: "Chuẩn bị chọn...",
    choosingText: "Đang xoay vòng...",
    selectedText: "Đã tìm ra người may mắn!",
  },
  en: {
    title: "Finger Chooser",
    instruction: "Place 2 or more fingers to start",
    countdownText: "Get ready...",
    choosingText: "Choosing...",
    selectedText: "Winner Chosen!",
  },
  de: {
    title: "Finger-Wähler",
    instruction: "Legen Sie 2 oder mehr Finger auf",
    countdownText: "Bereit machen...",
    choosingText: "Auswahl läuft...",
    selectedText: "Gewinner ausgewählt!",
  },
  fr: {
    title: "Sélecteur de Doigt",
    instruction: "Placez 2 doigts ou plus pour commencer",
    countdownText: "Préparez-vous...",
    choosingText: "Sélection en cours...",
    selectedText: "Gagnant choisi !",
  },
  pt: {
    title: "Escolha de Dedo",
    instruction: "Coloque 2 ou mais dedos para começar",
    countdownText: "Prepare-se...",
    choosingText: "Escolhendo...",
    selectedText: "Vencedor escolhido!",
  },
  hi: {
    title: "फिंगर चॉइस",
    instruction: "शुरू करने के लिए 2 या अधिक उंगलियां रखें",
    countdownText: "तैयार हो जाओ...",
    choosingText: "चुन रहे हैं...",
    selectedText: "विजेता चुना गया!",
  },
};

export default function FingerChooser({ navigation }) {
  const [lang, setLang] = useState("en");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [touches, setTouches] = useState([]);
  const [gameState, setGameState] = useState("idle"); // idle, counting, choosing, selected
  const gameStateRef = useRef("idle");
  const updateGameState = (nextState) => {
    gameStateRef.current = nextState;
    setGameState(nextState);
  };
  const [countdown, setCountdown] = useState(5);
  const [selectedId, setSelectedId] = useState(null);
  const [activeCycleId, setActiveCycleId] = useState(null);

  const timerRef = useRef(null);
  const cycleTimerRef = useRef(null);
  const choosingTimeoutRef = useRef(null);
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

  // Cycling selector cursor animation during choosing phase
  useEffect(() => {
    if (gameState === "choosing" && touches.length >= 2) {
      let cycleIndex = 0;
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);

      cycleTimerRef.current = setInterval(() => {
        if (touches.length > 0) {
          const currentId = touches[cycleIndex % touches.length].id;
          setActiveCycleId(currentId);
          cycleIndex++;

          // Gentle tick sensation as cursor circles around fingers
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
        }
      }, 150);
    } else {
      setActiveCycleId(null);
      if (cycleTimerRef.current) {
        clearInterval(cycleTimerRef.current);
        cycleTimerRef.current = null;
      }
    }

    return () => {
      if (cycleTimerRef.current) clearInterval(cycleTimerRef.current);
    };
  }, [gameState, touches.length]);

  // Countdown trigger (idle -> counting -> choosing)
  useEffect(() => {
    if (gameState === "selected" || gameState === "choosing") return;

    if (touches.length >= 2) {
      updateGameState("counting");
      setCountdown(5);

      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            startChoosingPhase();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      updateGameState("idle");
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

  // Start fast cycling choosing phase for 5s
  const startChoosingPhase = () => {
    updateGameState("choosing");
    if (choosingTimeoutRef.current) clearTimeout(choosingTimeoutRef.current);
    choosingTimeoutRef.current = setTimeout(() => {
      finalizeSelection();
    }, 5000);
  };

  // Pick the winner
  const finalizeSelection = () => {
    if (touches.length === 0) return;

    const selectedIdx = Math.floor(Math.random() * touches.length);
    const chosen = touches[selectedIdx];
    setSelectedId(chosen.id);
    updateGameState("selected");

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
    if (gameStateRef.current === "selected") {
      setTouches([]);
      setSelectedId(null);
      setActiveCycleId(null);
      setCountdown(5);
      updateGameState("idle");
    } else if (gameStateRef.current === "choosing") {
      return;
    }

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
    // During choosing or selected state, we keep coordinates locked.
    if (gameStateRef.current === "choosing" || gameStateRef.current === "selected") {
      return;
    }

    const rawTouches = evt.nativeEvent.touches;
    
    // If all fingers are lifted from the screen, ALWAYS reset back to idle.
    if (rawTouches.length === 0) {
      if (choosingTimeoutRef.current) clearTimeout(choosingTimeoutRef.current);
      setTouches([]);
      updateGameState("idle");
      setSelectedId(null);
      setActiveCycleId(null);
      setCountdown(5);
      return;
    }

    // Standard release handling during idle/counting
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
      <View style={{ height: getStatusBarHeight(true) + 50 }} />

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

        {/* Choosing State label */}
        {gameState === "choosing" && (
          <View style={styles.countdownContainer}>
            <Text bold size={28} color="#1E293B">
              ⚡ {t.choosingText}
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
          const isCyclingActive = t.id === activeCycleId;
          
          // Fade non-winning circles during final reveal to make the winner pop
          const showDimmed = gameState === "selected" && !isSelected;

          return (
            <View
              key={t.id}
              style={[
                styles.glowCircle,
                {
                  left: t.x - 55,
                  top: t.y - 55,
                  opacity: showDimmed ? 0.25 : 1,
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

              {/* Scanning/Cycling ring during countdown */}
              {isCyclingActive && (
                <View
                  style={[
                    styles.cyclingRing,
                    {
                      borderColor: "#FFFFFF",
                    },
                  ]}
                />
              )}

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

      <BottomAd size="small" />
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
  cyclingRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3.5,
    borderStyle: "dashed",
    opacity: 0.9,
  },
  selectedRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
  },
});
