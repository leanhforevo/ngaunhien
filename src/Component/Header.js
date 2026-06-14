import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Switch,
  FlatList,
  TextInput,
  ScrollView,
  LayoutAnimation,
  Platform,
} from "react-native";
import { Icon } from "react-native-elements";
import {
  getBottomSpace,
  getStatusBarHeight,
} from "react-native-iphone-x-helper-2";
import { navigationRef, pop } from "../Utils/RootNavigation";
export default function App({ title }) {
  return (
    <View style={styles.container}>
      <View style={{ height: getStatusBarHeight(true) }} />
      <View style={{ height: 50, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={styles.containerHeaderIconLeft}
          onPress={() => {
            pop();
          }}
        >
          <Icon
            name="arrow-back-circle-outline"
            type="ionicon"
            color="#1E293B"
          />
        </TouchableOpacity>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "500",
              color: "#1E293B",
              fontFamily: "Arial",
            }}
          >
            {title || ""}
          </Text>
        </View>
        <View style={styles.containerHeaderIconRight}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  containerHeaderIconLeft: {
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 15,
  },
  containerHeaderIconRight: {
    height: 50,
    width: 50,
  },
});
