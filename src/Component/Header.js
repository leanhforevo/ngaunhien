import React from "react";
import { StyleSheet, View } from "react-native";
import { getStatusBarHeight } from "react-native-iphone-x-helper-2";
import { pop } from "../Utils/RootNavigation";
import { Text, AppIconButton } from "./Common";

export default function Header({ title, onBack, navigation }) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (navigation) {
      navigation.pop();
    } else {
      pop();
    }
  };

  return (
    <View style={styles.container}>
      <View style={{ height: getStatusBarHeight(true) }} />
      <View style={{ height: 50, flexDirection: "row", alignItems: "center" }}>
        <AppIconButton
          name="arrow-back-circle-outline"
          onPress={handleBack}
          style={styles.containerHeaderIconLeft}
        />
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text size={18} medium style={styles.titleText}>
            {title || ""}
          </Text>
        </View>
        <View style={styles.containerHeaderIconRight} />
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
  titleText: {
    color: "#1E293B",
  },
});
