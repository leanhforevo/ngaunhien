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
const keyLocalHistoryCoin = "@!cacheDataHistoryCoin";

export default function CoinToss({ navigation }) {
  const [result, setResult] = useState("Tap to Flip");
  const [isFlipping, setIsFlipping] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const flipAnimation = useRef(new Animated.Value(0)).current;
  const bounceAnimation = useRef(new Animated.Value(0)).current;

  const player = useAudioPlayer(require("../../assets/coin.wav"));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const configs = await Utils.getLocal(keyLocalConfigs);
    if (configs) {
      setSoundEnabled(configs.sound !== false);
    }
    const savedHistory = await Utils.getLocal(keyLocalHistoryCoin);
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

  const tossCoin = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    playSound();

    // Reset animations
    flipAnimation.setValue(0);
    bounceAnimation.setValue(0);

    // Spin animation: rotates 5 full circles (1800 deg) over 5 seconds
    const spin = Animated.timing(flipAnimation, {
      toValue: 1,
      duration: 5000,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    // Toss up animation (2.5s up, 2.5s down)
    const toss = Animated.sequence([
      Animated.timing(bounceAnimation, {
        toValue: -60, // Toss up by 60px to prevent hitting top/bottom components
        duration: 2500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnimation, {
        toValue: 0, // Fall back down
        duration: 2500,
        easing: Easing.in(Easing.bounce),
        useNativeDriver: true,
      }),
    ]);

    Animated.parallel([spin, toss]).start(async () => {
      // Snap values back to 0deg cleanly to prevent layout collapse / backface disappearing bugs
      flipAnimation.setValue(0);
      bounceAnimation.setValue(0);
      
      stopSound();
      const randomValue = Math.random() < 0.5 ? "Sấp" : "Ngửa";
      setResult(randomValue);
      setIsFlipping(false);

      // Save to history
      const newHistoryItem = {
        title: randomValue,
        time: new Date().getTime(),
      };
      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      await Utils.setLocal(keyLocalHistoryCoin, updatedHistory);
    });
  };

  // Interpolate rotation using horizontal scaling (scaleX) to simulate a 3D flip cleanly on all devices with no backface clipping bugs
  const spinX = flipAnimation.interpolate({
    inputRange: [
      0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5,
      0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1
    ],
    outputRange: [
      1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1, 0, -1, 0, 1
    ],
  });

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
          <Text style={styles.titleText}>Tung đồng xu</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <TopAd containerStyle={{ marginTop: 10, alignItems: 'center' }} />

      <View style={styles.content}>
        <View style={styles.coinPlayground}>
          <Animated.View
            style={[
              styles.coinContainer,
              {
                transform: [{ translateY: bounceAnimation }, { scaleX: spinX }],
              },
            ]}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={tossCoin}
              disabled={isFlipping}
              style={styles.coin}
            >
              <Text style={styles.coinText}>
                {isFlipping ? "?" : result === "Tap to Flip" ? "$" : result}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Realistic fading floor shadow */}
          <Animated.View
            style={[
              styles.coinShadow,
              {
                transform: [
                  {
                    scale: bounceAnimation.interpolate({
                      inputRange: [-60, 0],
                      outputRange: [0.6, 1],
                    }),
                  },
                ],
                opacity: bounceAnimation.interpolate({
                  inputRange: [-60, 0],
                  outputRange: [0.15, 0.45],
                }),
              },
            ]}
          />
        </View>

        <Text style={styles.resultLabel}>
          {isFlipping ? "Đang tung..." : result}
        </Text>
      </View>

      <View style={styles.toolbarContainer}>
        <View style={styles.containerGroupIcon}>
          <TouchableOpacity style={styles.containerIcon} onPress={tossCoin}>
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

      <BottomAd />

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
              <Text style={styles.modalTitle}>Lịch sử tung xu</Text>
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
  },
  coinPlayground: {
    width: 120,
    height: 160,
    justifyContent: "space-between",
    alignItems: "center",
  },
  coinContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  coin: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
    backgroundColor: "#FFD700",
    borderWidth: 5,
    borderColor: "#DAA520",
    justifyContent: "center",
    alignItems: "center",
  },
  coinShadow: {
    width: 80,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    marginTop: 15,
  },
  coinText: {
    fontSize: 28,
    fontWeight: "bold",
    fontFamily: "Arial",
    color: "#B8860B",
  },
  resultLabel: {
    marginTop: 30,
    fontSize: 24,
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
