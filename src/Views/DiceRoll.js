import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  FlatList,
  Modal,
  Platform,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import { Icon } from "react-native-elements";
import { getStatusBarHeight, getBottomSpace } from "react-native-iphone-x-helper-2";
import Utils from "../Utils/utils";
import { TopAd, BottomAd } from "../Component/AdBanner";

const keyLocalConfigs = "@!keyLocalConfigs";
const keyLocalHistoryDice = "@!cacheDataHistoryDice";

const Dice3D = ({ val, isRolling }) => {
  const rollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRolling) {
      rollAnim.setValue(0);
      Animated.timing(rollAnim, {
        toValue: 1,
        duration: 560, // Match the shake sequence exactly
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      rollAnim.setValue(0);
    }
  }, [isRolling]);

  // Simulates a realistic 3D tumbling by combining a rapid Z-axis spin with multi-phase X/Y tilting (wobble).
  // This keeps the front face pointing towards the camera so the extrusion layer stack is always visible.
  const rotateX = rollAnim.interpolate({
    inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
    outputRange: ["0deg", "35deg", "-30deg", "20deg", "-10deg", "0deg"],
  });

  const rotateY = rollAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: ["0deg", "-35deg", "30deg", "-15deg", "0deg"],
  });

  const rotateZ = rollAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "1440deg"],
  });

  const scale = rollAnim.interpolate({
    inputRange: [0, 0.2, 0.5, 0.8, 1],
    outputRange: [1, 1.3, 0.75, 1.2, 1],
  });

  const translateY = rollAnim.interpolate({
    inputRange: [0, 0.25, 0.5, 0.75, 1],
    outputRange: [0, -50, 15, -20, 0],
  });

  const renderDotsOnly = (value) => {
    const dotPositions = {
      1: [{ top: "40%", left: "40%" }],
      2: [
        { top: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
      3: [
        { top: "15%", left: "15%" },
        { top: "40%", left: "40%" },
        { bottom: "15%", right: "15%" },
      ],
      4: [
        { top: "15%", left: "15%" },
        { top: "15%", right: "15%" },
        { bottom: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
      5: [
        { top: "15%", left: "15%" },
        { top: "15%", right: "15%" },
        { top: "40%", left: "40%" },
        { bottom: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
      6: [
        { top: "15%", left: "15%" },
        { top: "15%", right: "15%" },
        { top: "40%", left: "15%" },
        { top: "40%", right: "15%" },
        { bottom: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
    };

    return dotPositions[value]?.map((pos, i) => (
      <View
        key={i}
        style={[
          styles.dot,
          pos,
          { backgroundColor: value === 1 || value === 4 ? "#DC2626" : "#1E293B" },
        ]}
      />
    )) || null;
  };

  return (
    <Animated.View
      style={[
        styles.dice3DContainer,
        {
          transform: [
            { perspective: 600 }, // lower perspective increases depth deformation for a stronger 3D feel
            { scale: scale },
            { translateY: translateY },
            { rotateX: rotateX },
            { rotateY: rotateY },
            { rotateZ: rotateZ },
          ],
        },
      ]}
    >
      {/* 3D Extrusion Stack Layers (Back to Front) */}
      <View style={[styles.dice3DLayer, { top: 6, left: 6, backgroundColor: "#94A3B8" }]} />
      <View style={[styles.dice3DLayer, { top: 5, left: 5, backgroundColor: "#94A3B8" }]} />
      <View style={[styles.dice3DLayer, { top: 4, left: 4, backgroundColor: "#CBD5E1" }]} />
      <View style={[styles.dice3DLayer, { top: 3, left: 3, backgroundColor: "#CBD5E1" }]} />
      <View style={[styles.dice3DLayer, { top: 2, left: 2, backgroundColor: "#E2E8F0" }]} />
      <View style={[styles.dice3DLayer, { top: 1, left: 1, backgroundColor: "#E2E8F0" }]} />

      {/* Front Face */}
      <View style={[styles.dice3DFront, { top: 0, left: 0 }]}>
        {renderDotsOnly(val)}
      </View>
    </Animated.View>
  );
};

export default function DiceRoll({ navigation }) {
  const [diceCount, setDiceCount] = useState(1);
  const [diceValues, setDiceValues] = useState([1]);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const shakeAnimX = useRef(new Animated.Value(0)).current;
  const shakeAnimY = useRef(new Animated.Value(0)).current;

  const player = useAudioPlayer(require("../../assets/dice.wav"));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const configs = await Utils.getLocal(keyLocalConfigs);
    if (configs) {
      setSoundEnabled(configs.sound !== false);
    }
    const savedHistory = await Utils.getLocal(keyLocalHistoryDice);
    if (savedHistory) {
      setHistory(savedHistory);
    }
  };

  const playSound = async () => {
    if (!soundEnabled) return;
    try {
      player.seekTo(0);
      player.play();
    } catch (e) {
      console.log("Play sound error:", e);
    }
  };

  const stopSound = () => {
    try {
      player.pause();
    } catch (e) {
      console.log("Stop sound error:", e);
    }
  };

  const rollDice = () => {
    if (isRolling) return;
    setIsRolling(true);
    playSound();

    // Reset values and create shake loop
    const shakeX = Animated.sequence([
      Animated.timing(shakeAnimX, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: -8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: 5, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: -5, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]);

    const shakeY = Animated.sequence([
      Animated.timing(shakeAnimY, { toValue: -10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: 10, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: -8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: 8, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: -5, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: 5, duration: 80, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]);

    // Interval to randomize dice values while rolling
    let rollInterval = setInterval(() => {
      setDiceValues(
        Array(diceCount)
          .fill(0)
          .map(() => Math.floor(Math.random() * 6) + 1)
      );
    }, 100);

    Animated.parallel([shakeX, shakeY]).start(async () => {
      clearInterval(rollInterval);
      stopSound();

      // Final roll values
      const finalValues = Array(diceCount)
        .fill(0)
        .map(() => Math.floor(Math.random() * 6) + 1);

      setDiceValues(finalValues);
      setIsRolling(false);

      // Save to history
      const total = finalValues.reduce((a, b) => a + b, 0);
      const detailStr = finalValues.join(" + ");
      const historyTitle = `Dice: ${detailStr} = ${total}`;

      const newHistoryItem = {
        title: historyTitle,
        time: new Date().getTime(),
      };
      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      await Utils.setLocal(keyLocalHistoryDice, updatedHistory);
    });
  };

  const handleSetDiceCount = (count) => {
    setDiceCount(count);
    setDiceValues(Array(count).fill(1));
  };

  const renderDiceDots = (val) => {
    const dotPositions = {
      1: [{ top: "40%", left: "40%" }],
      2: [
        { top: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
      3: [
        { top: "15%", left: "15%" },
        { top: "40%", left: "40%" },
        { bottom: "15%", right: "15%" },
      ],
      4: [
        { top: "15%", left: "15%" },
        { top: "15%", right: "15%" },
        { bottom: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
      5: [
        { top: "15%", left: "15%" },
        { top: "15%", right: "15%" },
        { top: "40%", left: "40%" },
        { bottom: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
      6: [
        { top: "15%", left: "15%" },
        { top: "15%", right: "15%" },
        { top: "40%", left: "15%" },
        { top: "40%", right: "15%" },
        { bottom: "15%", left: "15%" },
        { bottom: "15%", right: "15%" },
      ],
    };
    return (
      <View style={styles.diceFace}>
        {dotPositions[val].map((pos, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              pos,
              { backgroundColor: val === 1 || val === 4 ? "#DC2626" : "#1E293B" },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.pop()}
        >
          <Icon name="arrow-back-circle-outline" type="ionicon" color="#1E293B" />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Lắc xúc xắc</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <TopAd containerStyle={{ marginTop: 10, alignItems: 'center' }} />

      {/* Quantity Select Tab */}
      <View style={styles.tabContainer}>
        {[1, 2, 3].map((count) => (
          <TouchableOpacity
            key={count}
            style={[
              styles.tabItem,
              diceCount === count && styles.tabItemActive,
            ]}
            onPress={() => handleSetDiceCount(count)}
            disabled={isRolling}
          >
            <Text
              style={[
                styles.tabText,
                diceCount === count && styles.tabTextActive,
              ]}
            >
              {count} Xúc xắc
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {/* Shaking Container */}
        <Animated.View
          style={[
            styles.diceContainer,
            {
              transform: [
                { translateX: shakeAnimX },
                { translateY: shakeAnimY },
              ],
            },
          ]}
        >
          {diceValues.map((val, idx) => (
            <Dice3D key={idx} val={val} isRolling={isRolling} />
          ))}
        </Animated.View>

        {/* Sum Result */}
        <Text style={[styles.resultLabel, { opacity: isRolling ? 0 : 1 }]}>
          Tổng điểm: {diceValues.reduce((a, b) => a + b, 0)}
        </Text>
      </View>

      <View style={styles.toolbarContainer}>
        <View style={styles.containerGroupIcon}>
          <TouchableOpacity style={styles.containerIcon} onPress={rollDice}>
            <Icon name="play-outline" type="ionicon" color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.containerIcon}
            onPress={() => setHistoryVisible(true)}
          >
            <Icon name="clipboard-outline" type="ionicon" color="#1E293B" />
          </TouchableOpacity>
        </View>
      </View>

      <BottomAd containerStyle={{ height: 260, marginBottom: getBottomSpace() || 10, justifyContent: 'center', alignItems: 'center' }} />

      {/* History Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={historyVisible}
        onRequestClose={() => setHistoryVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lịch sử lắc xúc xắc</Text>
              <TouchableOpacity onPress={() => setHistoryVisible(false)}>
                <Icon name="close-outline" type="ionicon" color="#1E293B" />
              </TouchableOpacity>
            </View>

            {history.length > 0 ? (
              <FlatList
                data={history}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.historyRow}>
                    <Text style={styles.historyIndex}>{history.length - index}.</Text>
                    <Text style={styles.historyResult}>{item.title}</Text>
                    <Text style={styles.historyTime}>
                      {new Date(item.time).toLocaleTimeString()}
                    </Text>
                  </View>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Chưa có lịch sử</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    height: 50,
    marginTop: getStatusBarHeight(true),
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  titleText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#1E293B",
    fontFamily: "Arial",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    marginTop: 10,
    marginBottom: 10,
    width: "80%",
    alignSelf: "center",
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 16,
  },
  tabItemActive: {
    backgroundColor: "rgba(255,255,255,0.8)",
  },
  tabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(30,41,59,0.7)",
    fontFamily: "Arial",
  },
  tabTextActive: {
    fontWeight: "bold",
    color: "#1E293B",
  },
  diceContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    minHeight: 100,
  },
  diceFace: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 8,
  },
  dot: {
    position: "absolute",
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  dice3DContainer: {
    width: 76,
    height: 76,
    marginHorizontal: 15,
    position: "relative",
  },
  dice3DFront: {
    width: 76,
    height: 76,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    position: "absolute",
    zIndex: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dice3DLayer: {
    width: 76,
    height: 76,
    borderRadius: 14,
    position: "absolute",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
  },
  resultLabel: {
    marginTop: 40,
    fontSize: 20,
    fontWeight: "bold",
    fontFamily: "Arial",
    color: "#1E293B",
  },
  toolbarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  containerGroupIcon: {
    flexDirection: "row",
    paddingHorizontal: 5,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 35,
    overflow: "hidden",
  },
  containerIcon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    padding: 20,
    paddingBottom: getBottomSpace() || 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Arial",
    color: "#1E293B",
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  historyIndex: {
    width: 30,
    fontSize: 14,
    color: "rgba(30,41,59,0.5)",
    fontFamily: "Arial",
  },
  historyResult: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    fontFamily: "Arial",
  },
  historyTime: {
    fontSize: 12,
    color: "rgba(30,41,59,0.6)",
    fontFamily: "Arial",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(30,41,59,0.5)",
    fontFamily: "Arial",
  },
});
