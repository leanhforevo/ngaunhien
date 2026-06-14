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
  Keyboard,
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
import { TopAd, BottomAd } from '../Component/AdBanner';

const RandomNumbers = ({ navigation }) => {
  const [minValue, setMinValue] = useState("0");
  const [maxValue, setMaxValue] = useState("100");
  const [quantity, setQuantity] = useState("1");

  const [animateToNumbers, setAnimateToNumbers] = useState([0]);
  const [showConfetti, setShowConfetti] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const increase = () => {
    setShowConfetti(false);
    let min = parseInt(minValue);
    let max = parseInt(maxValue);
    let qty = parseInt(quantity);

    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = 100;
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 50) qty = 50;

    // Auto swap bounds if min > max to prevent calculations error
    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
      setMinValue(min + "");
      setMaxValue(max + "");
    }

    // Save configuration back to storage
    Utils.setLocal(keyLocalConfigs, { min, max, quantity: qty });

    // Generate random numbers
    const newValues = [];
    for (let i = 0; i < qty; i++) {
      newValues.push(randomIntFromInterval(min, max));
    }

    _evtSaveItem(newValues.join(", "));
    setAnimateToNumbers(newValues);
    setTimeout(() => {
      setShowConfetti(true);
    }, 3000);
  };
  function randomIntFromInterval(min = 0, max = 100) {
    // min and max included
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  useEffect(() => {
    getData();

    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);
  const getData = async () => {
    const configsLocal = await Utils.getLocal(keyLocalConfigs);
    if (configsLocal) {
      const min = parseInt(configsLocal.min);
      const max = parseInt(configsLocal.max);
      const qty = parseInt(configsLocal.quantity);
      const valMin = isNaN(min) ? 0 : min;
      const valMax = isNaN(max) ? 100 : max;
      const valQty = isNaN(qty) ? 1 : qty;
      setMinValue(valMin + "");
      setMaxValue(valMax + "");
      setQuantity(valQty + "");
      setAnimateToNumbers(Array(valQty).fill(valMin));
    } else {
      const defaultConfigs = { min: 0, max: 100, quantity: 1 };
      await Utils.setLocal(keyLocalConfigs, defaultConfigs);
      setMinValue("0");
      setMaxValue("100");
      setQuantity("1");
      setAnimateToNumbers([0]);
    }
  };

  const handleSetMin = async (val) => {
    setMinValue(val);
    const cleanMin = parseInt(val) || 0;
    const cleanMax = parseInt(maxValue) || 0;
    const cleanQty = parseInt(quantity) || 1;
    setAnimateToNumbers(Array(cleanQty).fill(cleanMin));
    await Utils.setLocal(keyLocalConfigs, { min: cleanMin, max: cleanMax, quantity: cleanQty });
  };

  const handleSetMax = async (val) => {
    setMaxValue(val);
    const cleanMin = parseInt(minValue) || 0;
    const cleanMax = parseInt(val) || 0;
    const cleanQty = parseInt(quantity) || 1;
    await Utils.setLocal(keyLocalConfigs, { min: cleanMin, max: cleanMax, quantity: cleanQty });
  };

  const handleSetQuantity = async (val) => {
    const cleanVal = val.replace(/[^0-9]/g, "");
    setQuantity(cleanVal);
    let qtyNum = parseInt(cleanVal) || 1;
    if (qtyNum > 50) qtyNum = 50;
    if (qtyNum < 1) qtyNum = 1;

    const cleanMin = parseInt(minValue) || 0;
    const cleanMax = parseInt(maxValue) || 0;
    setAnimateToNumbers(Array(qtyNum).fill(cleanMin));
    await Utils.setLocal(keyLocalConfigs, { min: cleanMin, max: cleanMax, quantity: qtyNum });
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
      <TopAd containerStyle={{ marginTop: getStatusBarHeight(true) + 50, height: 60, justifyContent: 'center', alignItems: 'center' }} />
      <ScrollView
        //ref={refScroll}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: 270 + (getBottomSpace() || 15),
        }}
      >
        <View style={{ height: 40 }}></View>
        <View
          style={{ height: 180, justifyContent: "center", alignItems: "center" }}
        >
          <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 }}>
            {animateToNumbers.map((num, idx) => (
              <View key={idx} style={{ marginHorizontal: 8, marginVertical: 4 }}>
                <AnimatedNumbers
                  animateToNumber={num}
                  animationDuration={3000}
                  fontStyle={{
                    fontSize: animateToNumbers.length > 8 ? 24 : animateToNumbers.length > 4 ? 32 : 50,
                    fontWeight: "bold",
                    fontFamily: "Arial",
                    color: "#1E293B"
                  }}
                />
              </View>
            ))}
          </View>
        </View>
        <View style={{ width: "100%", height: 60, flexDirection: "row", paddingHorizontal: 5 }}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>From:</Text>
            <TextInput
              style={styles.textInput}
              placeholder={"0"}
              placeholderTextColor="rgba(30,41,59,0.4)"
              autoCorrect={false}
              returnKeyType={"done"}
              keyboardType={"numeric"}
              value={minValue}
              onChangeText={handleSetMin}
              onSubmitEditing={() => {}}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>To:</Text>
            <TextInput
              style={styles.textInput}
              placeholder={"100"}
              placeholderTextColor="rgba(30,41,59,0.4)"
              autoCorrect={false}
              returnKeyType={"done"}
              keyboardType={"numeric"}
              value={maxValue}
              onChangeText={handleSetMax}
              onSubmitEditing={() => {}}
            />
          </View>
        </View>
        <View style={{ width: "100%", height: 60, flexDirection: "row", paddingHorizontal: 5 }}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Quantity:</Text>
            <TextInput
              style={styles.textInput}
              placeholder={"1"}
              placeholderTextColor="rgba(30,41,59,0.4)"
              autoCorrect={false}
              returnKeyType={"done"}
              keyboardType={"numeric"}
              value={quantity}
              onChangeText={handleSetQuantity}
              onSubmitEditing={() => {}}
            />
          </View>
        </View>
        <View style={{ alignItems: "center", marginTop: 20 }}>
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
                color="#1E293B"
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
                color="#1E293B"
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      {!isKeyboardVisible && (
        <BottomAd containerStyle={{ position: 'absolute', bottom: getBottomSpace() || 10, left: 0, right: 0, height: 260, justifyContent: 'center', alignItems: 'center' }} />
      )}
      <StatusBar style="auto" />
    </View>
  );
};
export default RandomNumbers;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
  inputContainer: {
    height: 50,
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 10,
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgba(30,41,59,0.7)",
    marginRight: 8,
    fontFamily: "Arial",
  },
  textInput: {
    flex: 1,
    color: "#1E293B",
    fontSize: 16,
    height: "100%",
    fontFamily: "Arial",
  },
});
