import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import WheelOfFortune from "react-native-wheel-of-fortune-dp";
import { Audio } from "expo-av";
import { Icon } from "react-native-elements";
import ConfettiCannon from "react-native-confetti-cannon";
import Utils from "../Utils/utils";
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
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";

const ad_id_IOS = "ca-app-pub-4249582158718282/2906946274";
const ad_id_Android = "ca-app-pub-4249582158718282/4024586823";
const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.OS == "ios"
  ? ad_id_IOS
  : ad_id_Android;
const App = ({ navigation }) => {
  const [data, setData] = useState(null);
  const [configs, setConfigs] = useState({
    sound: true,
    duration: 9500,
  });
  const [showConfetti, setShowConfetti] = useState(false);

  var child = null;
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

    const { sound } = await Audio.Sound.createAsync(
      require("../../assets/wheelSpining.wav")
    );
    await sound.playAsync();
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
       <BannerAd
        unitId={adUnitId}
        style={{top:50}}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
      <View style={{ flex: 1 }}></View>
      <View style={{ flex: 3 }}>
        {data && (
          <WheelOfFortune
            options={{
              rewards: data,
              knobSize: 25,
              borderWidth: 10,
              borderColor: "#fff",
              innerRadius: 50,
              duration: 9500,
              backgroundColor: "transparent",
              textAngle: "horizontal",
              knobSource: require("../../assets/knook.png"),
              logoApp: require("../../assets/Logo.png"),

              onRef: (ref) => (child = ref),
            }}
            duration={11000}
            getWinner={_evtResult}
          />
        )}
      </View>
     
      <View style={{ flex: 1, alignItems: "center" }}>
        <View style={styles.containerGroupIcon}>
          <TouchableOpacity
            style={styles.containerIcon}
            onPress={() => {
            try {
              setShowConfetti(false);
              child._tryAgain();
              playSound();
            } catch (error) {
              console.log("Error:",error)
            }
            }}
          >
            <Icon
              // reverse
              name="help-buoy-outline"
              type="ionicon"
              color="#fff"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.containerIcon}
            onPress={() => {
              navigation.navigate("History");
            }}
          >
            <Icon
              // reverse
              name="clipboard-outline"
              type="ionicon"
              color="#fff"
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
              // reverse
              name="cog-outline"
              type="ionicon"
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </View>
      <View style={{alignItems:'center'}}>
      <BannerAd
        unitId={adUnitId}
        style={{top:50}}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
      </View>
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
    backgroundColor: "#c2c2c2",
    borderRadius: 35,
    overflow: "hidden",
  },
});
