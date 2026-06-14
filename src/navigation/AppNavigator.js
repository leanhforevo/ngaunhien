import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "../screens/HomeScreen";
import SettingsScreen from "../screens/SettingsScreen";
import HistoryScreen from "../screens/HistoryScreen";
import HistoryNumberScreen from "../screens/HistoryNumberScreen";
import WheelSpinningScreen from "../screens/WheelSpinningScreen";
import NumberRandomScreen from "../screens/NumberRandomScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="HistoryNumber" component={HistoryNumberScreen} />
      <Stack.Screen name="WheelSpinning" component={WheelSpinningScreen} />
      <Stack.Screen name="NumberRandom" component={NumberRandomScreen} />
    </Stack.Navigator>
  );
}
