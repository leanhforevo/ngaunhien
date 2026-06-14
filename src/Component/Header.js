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
} from "react-native";
import { Icon } from "react-native-elements";
import KeyboardSpacer from "react-native-keyboard-spacer";
import {
  getBottomSpace,
  getStatusBarHeight,
} from "react-native-iphone-x-helper-2";
import { navigationRef, pop } from "../Utils/RootNavigation";
export default function App({ title }) {
  return (
    <View style={styles.container}>
      <View style={{ height: getStatusBarHeight(true) }} />
      <View style={{ height: 50, flexDirection: "row" }}>
        <TouchableOpacity
          style={styles.containerIcon}
          onPress={() => {
            pop();
          }}
        >
          <Icon
            // reverse
            name="arrow-back-circle-outline"
            type="ionicon"
            color="#000"
          />
        </TouchableOpacity>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, fontWeight: "500" }}>{title || ""}</Text>
        </View>
        <View style={styles.containerIcon}></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // backgroundColor: "#fff",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
  },
  containerIcon: {
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  containerGroup: {
    backgroundColor: "#ffffff60",
    borderRadius: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 2,
    borderColor: "#617EAF",
    marginTop: 10,
    // overflow:'hidden',

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,

    elevation: 8,
  },
  containerRow: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 10,
  },
  containerBTNAdd: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    justifyContent: "center",
    borderRadius: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 2,
    borderColor: "#617EAF",
    marginHorizontal: 10,
    marginBottom: 10,
  },
});
