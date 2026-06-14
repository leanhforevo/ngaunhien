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
import { Icon } from "react-native-elements";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
} from "react-native-google-mobile-ads";
import { getStatusBarHeight, getBottomSpace } from "react-native-iphone-x-helper-2";

const ad_id_IOS = "ca-app-pub-4249582158718282/2906946274";
const ad_id_Android = "ca-app-pub-4249582158718282/4024586823";
const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.OS == "ios"
  ? ad_id_IOS
  : ad_id_Android;
const App = ({ navigation }) => {
  useEffect(() => {}, []);
  return (
    <View style={styles.container}>
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />
      <View style={{ marginTop: getStatusBarHeight(true) + 10, alignItems: 'center' }}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
          flexDirection: "row",
        }}
      >
        <TouchableOpacity style={styles.containerItem} onPress={()=>{navigation.navigate('WheelSpinning')}}>
          <Image
            style={{ width: "100%", height: "100%" }}
            source={require("../../assets/WheelSpining.png")}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.containerItem} onPress={()=>{navigation.navigate('NumberRandom')}}>
          <Image
            style={{ width: "100%", height: "100%", position: "absolute" }}
            source={require("../../assets/randomNumber.jpeg")}
          />
        </TouchableOpacity>
      </View>
      <View style={{ height: 60, marginBottom: getBottomSpace() || 10, justifyContent: 'center', alignItems: 'center' }}>
        <BannerAd
          unitId={adUnitId}
          size={BannerAdSize.BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
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
  containerItem: {
    width: 120,
    height: 120,
    overflow: "hidden",
    backgroundColor: "#ffffff80",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
