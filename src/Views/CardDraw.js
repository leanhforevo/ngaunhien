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
  Alert,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import { Icon } from "react-native-elements";
import { getStatusBarHeight, getBottomSpace } from "react-native-iphone-x-helper-2";
import Utils from "../Utils/utils";
import { TopAd, BottomAd } from "../Component/AdBanner";

const keyLocalConfigs = "@!keyLocalConfigs";
const keyLocalHistoryCard = "@!cacheDataHistoryCard";

const SUITS = [
  { name: "♠", symbol: "♠", color: "#1E293B", text: "Bích" },
  { name: "♣", symbol: "♣", color: "#1E293B", text: "Nhép" },
  { name: "♦", symbol: "♦", color: "#EF4444", text: "Rô" },
  { name: "♥", symbol: "♥", color: "#EF4444", text: "Cơ" },
];

const VALUES = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

export default function CardDraw({ navigation }) {
  const [deck, setDeck] = useState([]);
  const [drawnCard, setDrawnCard] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const flipAnim = useRef(new Animated.Value(0)).current;

  const drawPlayer = useAudioPlayer(require("../../assets/card_draw.wav"));
  const shufflePlayer = useAudioPlayer(require("../../assets/card_shuffle.wav"));

  useEffect(() => {
    loadData();
    initializeDeck();
  }, []);

  const loadData = async () => {
    const configs = await Utils.getLocal(keyLocalConfigs);
    if (configs) {
      setSoundEnabled(configs.sound !== false);
    }
    const savedHistory = await Utils.getLocal(keyLocalHistoryCard);
    if (savedHistory) {
      setHistory(savedHistory);
    }
  };

  const playSound = async (currentPlayer) => {
    if (!soundEnabled || !currentPlayer) return;
    try {
      currentPlayer.seekTo(0);
      currentPlayer.play();
    } catch (e) {
      console.log("Play sound error:", e);
    }
  };

  const stopSound = (currentPlayer) => {
    if (!currentPlayer) return;
    try {
      currentPlayer.pause();
    } catch (e) {
      console.log("Stop sound error:", e);
    }
  };

  const initializeDeck = () => {
    let newDeck = [];
    for (let suit of SUITS) {
      for (let val of VALUES) {
        newDeck.push({ suit, value: val });
      }
    }
    shuffle(newDeck);
  };

  const shuffle = (targetDeck) => {
    let shuffDeck = [...targetDeck];
    for (let i = shuffDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffDeck[i], shuffDeck[j]] = [shuffDeck[j], shuffDeck[i]];
    }
    setDeck(shuffDeck);
    setDrawnCard(null);
  };

  const handleShuffle = () => {
    playSound(shufflePlayer);
    setTimeout(() => {
      stopSound(shufflePlayer);
    }, 600);
    initializeDeck();
  };

  const drawCard = () => {
    if (isDrawing) return;
    if (deck.length === 0) {
      Alert.alert("Hết bài", "Hãy xáo bài để bắt đầu lượt chơi mới!");
      return;
    }

    const nextDeck = [...deck];
    const card = nextDeck.pop();
    setDeck(nextDeck);
    setDrawnCard(card);
    setIsDrawing(true);
    playSound(drawPlayer);

    // Reset animations
    slideAnim.setValue(0);
    flipAnim.setValue(0);

    // Slide out from the deck pile
    const slide = Animated.timing(slideAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    // Flip card
    const flip = Animated.timing(flipAnim, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    });

    Animated.sequence([slide, flip]).start(async () => {
      stopSound(drawPlayer);
      setIsDrawing(false);
      
      // Save to history
      const cardStr = `${card.value}${card.suit.symbol}`;
      const newHistoryItem = {
        title: `Rút bài: ${cardStr} (${card.suit.text})`,
        time: new Date().getTime(),
      };
      const updatedHistory = [newHistoryItem, ...history];
      setHistory(updatedHistory);
      await Utils.setLocal(keyLocalHistoryCard, updatedHistory);
    });
  };

  // Card scale oscillation (simulates a clean 3D flip in 2D space)
  const cardScaleX = flipAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 1],
  });

  const cardTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-140, 0],
  });

  const cardTranslateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0],
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
          <Text style={styles.titleText}>Rút bài Tây</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      <TopAd containerStyle={{ marginTop: 10, alignItems: 'center' }} />

      <View style={styles.content}>
        <Text style={styles.counterText}>Còn lại: {deck.length} / 52 lá</Text>

        <View style={styles.playArea}>
          {/* Deck pile */}
          <View style={[styles.deckPile, deck.length === 0 && styles.deckPileEmpty]}>
            <Text style={styles.deckPileText}>{deck.length > 0 ? "🎴" : "Hết"}</Text>
          </View>

          {/* Active Card container */}
          <View style={styles.cardWrapper}>
            {drawnCard && (
              <Animated.View
                style={[
                  styles.card,
                  {
                    transform: [
                      { translateX: cardTranslateX },
                      { translateY: cardTranslateY },
                      { scaleX: cardScaleX },
                    ],
                  },
                ]}
              >
                {/* Facedown Layer (Card Back) */}
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor: "#1E293B",
                      borderRadius: 10,
                      borderWidth: 3,
                      borderColor: "#FFF",
                      justifyContent: "center",
                      alignItems: "center",
                      opacity: flipAnim.interpolate({
                        inputRange: [0, 0.49, 0.5, 1],
                        outputRange: [1, 1, 0, 0],
                      }),
                    },
                  ]}
                >
                  <Icon name="logo-usd" type="ionicon" color="#FFF" size={40} />
                </Animated.View>

                {/* Faceup Layer (Card Front) */}
                <Animated.View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      backgroundColor: "#FFFFFF",
                      borderRadius: 10,
                      opacity: flipAnim.interpolate({
                        inputRange: [0, 0.49, 0.5, 1],
                        outputRange: [0, 0, 1, 1],
                      }),
                    },
                  ]}
                >
                  <View style={styles.cardInner}>
                    {/* Top Left */}
                    <View style={styles.topLeft}>
                      <Text style={[styles.cardCornerValue, { color: drawnCard.suit.color }]}>
                        {drawnCard.value}
                      </Text>
                      <Text style={[styles.cardCornerSuit, { color: drawnCard.suit.color }]}>
                        {drawnCard.suit.symbol}
                      </Text>
                    </View>

                    {/* Center Suit */}
                    <Text style={[styles.centerSuit, { color: drawnCard.suit.color }]}>
                      {drawnCard.suit.symbol}
                    </Text>

                    {/* Bottom Right */}
                    <View style={styles.bottomRight}>
                      <Text style={[styles.cardCornerValue, { color: drawnCard.suit.color }]}>
                        {drawnCard.value}
                      </Text>
                      <Text style={[styles.cardCornerSuit, { color: drawnCard.suit.color }]}>
                        {drawnCard.suit.symbol}
                      </Text>
                    </View>
                  </View>
                </Animated.View>
              </Animated.View>
            )}
            {!drawnCard && !isDrawing && (
              <View style={styles.cardPlaceholder}>
                <Text style={styles.placeholderText}>Nhấn Rút bài</Text>
              </View>
            )}
            {isDrawing && !drawnCard && (
              <View style={[styles.cardPlaceholder, { opacity: 0.5 }]}>
                <Text style={styles.placeholderText}>Đang rút...</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.toolbarContainer}>
        <View style={styles.containerGroupIcon}>
          <TouchableOpacity style={styles.containerIcon} onPress={drawCard} disabled={isDrawing}>
            <Icon name="play-outline" type="ionicon" color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.containerIcon} onPress={handleShuffle} disabled={isDrawing}>
            <Icon name="refresh-outline" type="ionicon" color="#1E293B" />
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
              <Text style={styles.modalTitle}>Lịch sử rút bài</Text>
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
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  counterText: {
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(30,41,59,0.7)",
    fontFamily: "Arial",
    marginBottom: 30,
  },
  playArea: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    minHeight: 220,
  },
  deckPile: {
    width: 100,
    height: 150,
    borderRadius: 10,
    backgroundColor: "#1E293B",
    borderWidth: 3,
    borderColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  deckPileEmpty: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.4)",
    borderStyle: "dashed",
    borderWidth: 2,
    elevation: 0,
    shadowOpacity: 0,
  },
  deckPileText: {
    fontSize: 32,
    color: "#FFF",
  },
  cardWrapper: {
    width: 110,
    height: 165,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 110,
    height: 165,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardInner: {
    flex: 1,
    padding: 8,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  topLeft: {
    position: "absolute",
    top: 6,
    left: 8,
    alignItems: "center",
  },
  bottomRight: {
    position: "absolute",
    bottom: 6,
    right: 8,
    alignItems: "center",
    transform: [{ rotate: "180deg" }],
  },
  cardCornerValue: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Arial",
  },
  cardCornerSuit: {
    fontSize: 14,
    marginTop: -2,
  },
  centerSuit: {
    fontSize: 50,
    textAlign: "center",
  },
  cardPlaceholder: {
    width: 110,
    height: 165,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  placeholderText: {
    fontSize: 13,
    color: "rgba(30,41,59,0.5)",
    fontFamily: "Arial",
    textAlign: "center",
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
