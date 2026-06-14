import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Platform,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
} from "react-native";
import Header from "../Component/Header";
import { Icon } from "react-native-elements";
import Utils from "../Utils/utils";
import {
  getBottomSpace,
  getStatusBarHeight,
} from "react-native-iphone-x-helper-2";
import KeyboardSpacer from "../Component/KeyboardSpacer";
const keyLocalCache = "@!cacheData2";
const keyLocalhistory = "@!cacheDataHistory2";
const keyLocalConfigs = "@!keyLocalConfigs2";

import AnimatedNumbers from "react-native-animated-numbers";
import ConfettiCannon from "react-native-confetti-cannon";
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

const RandomNumbers = ({ navigation }) => {
  const [configs, setConfigs] = useState({
    max: 9999,
    min: 0,
  });
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(100);

  const [animateToNumber, setAnimateToNumber] = React.useState(9999);
  const [showConfetti, setShowConfetti] = useState(false);

  const increase = () => {
    setShowConfetti(false);
    // alert(minValue+'-'+ maxValue)
    const value = randomIntFromInterval(parseInt(minValue), parseInt(maxValue));
    _evtSaveItem(value);
    setAnimateToNumber(value);
    setTimeout(() => {
      setShowConfetti(true);
    }, 100);
  };
  function randomIntFromInterval(min = 10, max = 9999) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  useEffect(() => {
    // appOpenAd.load();
    // appOpenAd.show();
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
  return (
    <View style={styles.container}>
      {showConfetti && (
        <ConfettiCannon
          count={100}
          origin={{ x: 180, y: -20 }}
          fadeOut={true}
        />
      )}
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />
      <Header />
      <View style={{ marginTop: getStatusBarHeight(true) + 50, height: 60, justifyContent: 'center', alignItems: 'center' }}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
      <ScrollView
        //ref={refScroll}
        contentContainerStyle={{
          flex: 1,
          paddingBottom: getBottomSpace() || 15,
        }}
      >
        <View style={{ flex: 1 }}></View>
        <View
          style={{ flex: 3, justifyContent: "center", alignItems: "center" }}
        >
          <AnimatedNumbers
            // includeComma
            animateToNumber={animateToNumber}
            fontStyle={{ fontSize: 50, fontWeight: "bold" }}
          />
        </View>
        <View style={{ width: "100%", height: 60, flexDirection: "row" }}>
          <View style={styles.containerBTNAdd}>
            <TextInput
              // ref={refTxt}
              style={{ flex: 1 }}
              placeholder={"Nhập nội dung"}
              //  autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={"done"}
              keyboardType={"numeric"}
              value={minValue + ""}
              onChangeText={(txt) => setMinValue(txt)}
              onSubmitEditing={() => {}}
            />
            <View style={styles.containerLabel}>
              <Text style={{}}>From:</Text>
            </View>
          </View>
          <View style={styles.containerBTNAdd}>
            <TextInput
              // ref={refTxt}
              style={{ flex: 1 }}
              placeholder={"Nhập nội dung"}
              //  autoCapitalize="none"
              autoCorrect={false}
              returnKeyType={"done"}
              value={maxValue + ""}
              keyboardType={"numeric"}
              onChangeText={(txt) => setMaxValue(txt)}
              onSubmitEditing={() => {}}
            />
            <View style={styles.containerLabel}>
              <Text style={{}}>To:</Text>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <View style={styles.containerGroupIcon}>
            <TouchableOpacity
              style={styles.containerIcon}
              onPress={() => {
                increase();
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
                navigation.navigate("HistoryNumber");
              }}
            >
              <Icon
                // reverse
                name="clipboard-outline"
                type="ionicon"
                color="#fff"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <View style={{ height: 60, marginBottom: getBottomSpace() || 10, justifyContent: 'center', alignItems: 'center' }}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
      <KeyboardSpacer />
      <StatusBar style="auto" />
    </View>
  );
};
export default RandomNumbers;
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
  containerBTNAdd: {
    height: 50,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    borderRadius: 10,
    borderTopWidth: 1,
    borderLeftWidth: 2,
    borderRightWidth: 3,
    borderBottomWidth: 4,
    borderColor: "#617EAF",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  containerLabel: {
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  bottomBanner: {
    position: "absolute",
    bottom: 0,
  },
});
