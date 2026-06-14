import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  Dimensions,
} from "react-native";
import WheelOfFortune from "react-native-wheel-of-fortune-dp";
import { useAudioPlayer } from "expo-audio";
import { Icon } from "react-native-elements";
import ConfettiCannon from "react-native-confetti-cannon";
import Utils from "../Utils/utils";
import { getStatusBarHeight, getBottomSpace } from "react-native-iphone-x-helper-2";
const keyLocalCache = "@!cacheData";
const keyLocalhistory = "@!cacheDataHistory";
const keyLocalConfigs = "@!keyLocalConfigs";
const participants = [
  "%10",
  "%20",
  "%30",
  "%40",
  "%50",
  "%60",
  "%70",
  "%90",
  "FREE",
];
import Header from '../Component/Header';
import { TopAd, BottomAd } from '../Component/AdBanner';
const App = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [configs, setConfigs] = useState({
    sound: true,
    duration: 9500,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const player = useAudioPlayer(require("../../assets/wheelSpining.wav"));

  const childRef = useRef(null);
  // const wheelOptions = ;
  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    const dataLocal = await Utils.getLocal(keyLocalCache);
    const configsLocal = await Utils.getLocal(keyLocalConfigs);
    if (configsLocal) {
      setConfigs(configsLocal);
    } else {
      Utils.setLocal(keyLocalConfigs, configsLocal);
    }
    if (dataLocal) {
      setData(dataLocal);
    } else {
      Utils.setLocal(keyLocalCache, participants);
      setData(participants);
    }
  };
  const playSound = async () => {
    if (!configs?.sound) return null;

    try {
      player.seekTo(0);
    } catch (e) {
      console.log("Audio seek error:", e);
    }

    try {
      player.play();
    } catch (error) {
      console.log("Audio play error:", error);
    }
  };
  const _evtSaveItem = async (value) => {
    try {
      const itemResult = {
        title: value,
        time: new Date().getTime(),
      };
      const dataHistoryLocal = await Utils.getLocal(keyLocalhistory);
      let newDataHistory = [];
      if (dataHistoryLocal) {
        newDataHistory = [itemResult, ...dataHistoryLocal];
      } else {
        newDataHistory = [itemResult];
      }
      Utils.setLocal(keyLocalhistory, newDataHistory);
    } catch (error) {
      alert(error);
    }
  };
  const _evtResult = (value, index) => {
    _evtSaveItem(value);
    setShowConfetti(true);
    try {
      player.pause();
    } catch (error) {
      console.log("Audio pause error:", error);
    }
    Alert.alert("Completed", `Result: ${value}`, [
      {
        text: "Remove item in wheel",
        onPress: () => _evtRemoveItem(index),
        style: "cancel",
      },
      {
        text: "Close",
        onPress: () => console.log("Cancel Pressed"),
        style: "cancel",
      },
    ]);
  };
  const _evtRemoveItem = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(null);
    setTimeout(() => {
      setData(newData);
    }, 10);
  };
  // if (!data) return null;
  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={150}
          origin={{ x: 180, y: -20 }}
          fadeOut={true}
        />
      )}
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />
      <Header />
      <TopAd containerStyle={{ marginTop: getStatusBarHeight(true) + 50, height: 60, justifyContent: 'center', alignItems: 'center' }} />

      <View style={{ flex: 1, justifyContent: 'space-around', alignItems: 'center' }}>
        <View style={{ width: "100%", height: 310, justifyContent: 'center', alignItems: 'center' }}>
          {data && (
            <>
              <WheelOfFortune
                options={{
                  rewards: data,
                  knobSize: 25,
                  borderWidth: 10,
                  borderColor: "#DAA520",
                  innerRadius: 50,
                  duration: 9500,
                  backgroundColor: "transparent",
                  textAngle: "horizontal",
                  knobSource: require("../../assets/knook.png"),
                  logoApp: require("../../assets/Logo.png"),
                  iconRewards: Array(data.length).fill(null),
                  colors: ["#B22222", "#222222", "#2E8B57", "#DAA520", "#2F4F4F"],
                  fontFamily: "Arial",
                  onRef: (ref) => (childRef.current = ref),
                }}
                duration={11000}
                getWinner={_evtResult}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={{
                  position: 'absolute',
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: '#FFF',
                  borderWidth: 3,
                  borderColor: '#DAA520',
                  justifyContent: 'center',
                  alignItems: 'center',
                  top: -100 + (Dimensions.get('screen').height / 4) - 15,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 4.65,
                  elevation: 8,
                }}
                onPress={() => {
                  try {
                    setShowConfetti(false);
                    childRef.current?._tryAgain();
                    playSound();
                  } catch (error) {
                    console.log("Error:", error);
                  }
                }}
              >
                <Image
                  source={require("../../assets/icon512.png")}
                  style={{ width: 74, height: 74, borderRadius: 37 }}
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={{ height: 30 }} />

        <View style={{ alignItems: "center" }}>
          <View style={styles.containerGroupIcon}>
            <TouchableOpacity
              style={styles.containerIcon}
              onPress={() => {
                try {
                  setShowConfetti(false);
                  childRef.current?._tryAgain();
                  playSound();
                } catch (error) {
                  console.log("Error:", error);
                }
              }}
            >
              <Icon
                name="help-buoy-outline"
                type="ionicon"
                color="#1E293B"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.containerIcon}
              onPress={() => {
                navigation.navigate("History");
              }}
            >
              <Icon
                name="clipboard-outline"
                type="ionicon"
                color="#1E293B"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.containerIcon}
              onPress={() => {
                navigation.navigate("Settings", {
                  data: data,
                  callback: (newData) => {
                    setData(null);
                    setTimeout(() => {
                      getData();
                    }, 10);
                  },
                });
              }}
            >
              <Icon
                name="cog-outline"
                type="ionicon"
                color="#1E293B"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <BottomAd containerStyle={{ height: 260, marginBottom: getBottomSpace() || 10, justifyContent: 'center', alignItems: 'center' }} />
      <StatusBar style="auto" />
    </View>
  );
};
export default App;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    // alignItems: "center",
    // justifyContent: "center",
  },
  containerIcon: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 15,
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
});
