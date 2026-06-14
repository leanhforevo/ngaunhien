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
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useAudioPlayer } from "expo-audio";
import { Icon } from "react-native-elements";
import { getStatusBarHeight, getBottomSpace } from "react-native-iphone-x-helper-2";
import Utils from "../Utils/utils";
import KeyboardSpacer from "../Component/KeyboardSpacer";
import { TopAd, BottomAd } from "../Component/AdBanner";

const keyLocalConfigs = "@!keyLocalConfigs";
const keyLocalHistoryLucky = "@!cacheDataHistoryLucky";
const keyLocalLuckyList = "@!cacheLuckyDrawList";

const DEFAULT_ITEMS = ["Đồ ăn Việt", "Đồ ăn Hàn", "Đồ ăn Nhật", "Đồ ăn Thái", "Đồ ăn Ý"];

export default function LuckyDraw({ navigation }) {
  const [items, setItems] = useState([]);
  const [newItemText, setNewItemText] = useState("");
  const [result, setResult] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  
  const [history, setHistory] = useState([]);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [listVisible, setListVisible] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const shakeAnimX = useRef(new Animated.Value(0)).current;
  const shakeAnimY = useRef(new Animated.Value(0)).current;
  const popAnim = useRef(new Animated.Value(0)).current;

  const player = useAudioPlayer(require("../../assets/lucky_draw.wav"));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const configs = await Utils.getLocal(keyLocalConfigs);
    if (configs) {
      setSoundEnabled(configs.sound !== false);
    }
    const savedList = await Utils.getLocal(keyLocalLuckyList);
    if (savedList && savedList.length > 0) {
      setItems(savedList);
    } else {
      setItems(DEFAULT_ITEMS);
      await Utils.setLocal(keyLocalLuckyList, DEFAULT_ITEMS);
    }
    const savedHistory = await Utils.getLocal(keyLocalHistoryLucky);
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

  const addItem = async () => {
    const text = newItemText.trim();
    if (!text) return;
    if (items.includes(text)) {
      Alert.alert("Trùng lặp", "Lựa chọn này đã tồn tại trong danh sách!");
      return;
    }
    const updatedList = [...items, text];
    setItems(updatedList);
    setNewItemText("");
    await Utils.setLocal(keyLocalLuckyList, updatedList);
  };

  const removeItem = async (index) => {
    if (items.length <= 1) {
      Alert.alert("Giới hạn", "Danh sách phải có ít nhất 1 lựa chọn!");
      return;
    }
    const updatedList = [...items];
    updatedList.splice(index, 1);
    setItems(updatedList);
    await Utils.setLocal(keyLocalLuckyList, updatedList);
  };

  const drawItem = () => {
    if (isDrawing) return;
    if (items.length === 0) {
      Alert.alert("Danh sách trống", "Hãy thêm lựa chọn vào danh sách trước khi bốc thăm!");
      return;
    }

    setIsDrawing(true);
    setResult("");
    playSound();

    // Reset animations
    shakeAnimX.setValue(0);
    shakeAnimY.setValue(0);
    popAnim.setValue(0);

    // Box Shake Animation
    const shakeX = Animated.sequence([
      Animated.timing(shakeAnimX, { toValue: 12, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: -12, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: 10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: -10, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: -6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimX, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]);

    const shakeY = Animated.sequence([
      Animated.timing(shakeAnimY, { toValue: -6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: 6, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: -4, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: 4, duration: 70, useNativeDriver: true }),
      Animated.timing(shakeAnimY, { toValue: 0, duration: 70, useNativeDriver: true }),
    ]);

    // Card Pop Up Animation
    const popUp = Animated.timing(popAnim, {
      toValue: 1,
      duration: 500,
      easing: Easing.out(Easing.back(1.5)),
      useNativeDriver: true,
    });

    Animated.parallel([shakeX, shakeY]).start(() => {
      stopSound();
      
      const randomIndex = Math.floor(Math.random() * items.length);
      const chosen = items[randomIndex];
      setResult(chosen);

      // Trigger popup
      popUp.start(async () => {
        setIsDrawing(false);

        // Save to history
        const newHistoryItem = {
          title: `Bốc thăm: ${chosen}`,
          time: new Date().getTime(),
        };
        const updatedHistory = [newHistoryItem, ...history];
        setHistory(updatedHistory);
        await Utils.setLocal(keyLocalHistoryLucky, updatedHistory);
      });
    });
  };

  // Card pop transformations
  const cardTranslateY = popAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, -80],
  });

  const cardScale = popAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const cardOpacity = popAnim.interpolate({
    inputRange: [0, 0.2, 1],
    outputRange: [0, 1, 1],
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
          <Text style={styles.titleText}>Bốc thăm may mắn</Text>
        </View>
        <View style={styles.backButton} />
      </View>
      <TopAd containerStyle={{ marginTop: 10, alignItems: 'center' }} />
      <View style={styles.content}>
        {/* Animated Pop-Up Card */}
        <Animated.View
          style={[
            styles.popCard,
            {
              opacity: cardOpacity,
              transform: [{ translateY: cardTranslateY }, { scale: cardScale }],
            },
          ]}
        >
          <Text style={styles.popCardText}>{result}</Text>
        </Animated.View>

        {/* Shaking Chest */}
        <Animated.View
          style={[
            styles.chestContainer,
            {
              transform: [
                { translateX: shakeAnimX },
                { translateY: shakeAnimY },
              ],
            },
          ]}
        >
          <TouchableOpacity activeOpacity={0.9} onPress={drawItem} disabled={isDrawing}>
            <View style={styles.chestBackground}>
              <Icon name="gift-outline" type="ionicon" size={80} color="#DAA520" />
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Status Indicator */}
        <Text style={[styles.statusText, { opacity: (isDrawing || !result) ? 1 : 0 }]}>
          {isDrawing ? "Đang bốc thăm..." : "Nhấn vào hộp để bốc thăm!"}
        </Text>
      </View>

      <View style={styles.toolbarContainer}>
        <View style={styles.containerGroupIcon}>
          <TouchableOpacity style={styles.containerIcon} onPress={drawItem} disabled={isDrawing}>
            <Icon name="play-outline" type="ionicon" color="#1E293B" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.containerIcon}
            onPress={() => setListVisible(true)}
            disabled={isDrawing}
          >
            <Icon name="list-outline" type="ionicon" color="#1E293B" />
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

      {/* List Manager Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={listVisible}
        onRequestClose={() => setListVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: "80%" }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Danh sách lá thăm</Text>
              <TouchableOpacity onPress={() => setListVisible(false)}>
                <Icon name="close-outline" type="ionicon" color="#1E293B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={items}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.listItemRow}>
                  <Text style={styles.listItemText}>{index + 1}. {item}</Text>
                  <TouchableOpacity onPress={() => removeItem(index)}>
                    <Icon name="trash-outline" type="ionicon" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              style={{ maxHeight: 250 }}
            />

            <View style={styles.addInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Nhập lá thăm mới..."
                placeholderTextColor="rgba(30,41,59,0.4)"
                value={newItemText}
                onChangeText={setNewItemText}
                onSubmitEditing={addItem}
                returnKeyType="done"
              />
              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Icon name="add-outline" type="ionicon" color="#FFF" />
              </TouchableOpacity>
            </View>
            <KeyboardSpacer />
          </View>
        </View>
      </Modal>

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
              <Text style={styles.modalTitle}>Lịch sử bốc thăm</Text>
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
    position: "relative",
  },
  popCard: {
    position: "absolute",
    width: 220,
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "rgba(30,41,59,0.1)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  popCardText: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Arial",
    color: "#1E293B",
    textAlign: "center",
  },
  chestContainer: {
    width: 130,
    height: 130,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
    zIndex: 5,
    marginTop: 40,
  },
  chestBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  statusText: {
    marginTop: 30,
    fontSize: 15,
    fontWeight: "600",
    color: "rgba(30,41,59,0.7)",
    fontFamily: "Arial",
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
  listItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  listItemText: {
    fontSize: 15,
    fontFamily: "Arial",
    color: "#1E293B",
    flex: 1,
  },
  addInputContainer: {
    flexDirection: "row",
    marginTop: 15,
    height: 46,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    height: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(30,41,59,0.15)",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#1E293B",
    fontFamily: "Arial",
    backgroundColor: "#FFF",
  },
  addButton: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: "#1E293B",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
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
