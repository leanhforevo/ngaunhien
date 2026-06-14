// In App.js in a new project

import * as React from "react";
import { View, Text } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { navigationRef } from "./Utils/RootNavigation";
import HomeScreen from "./Views/Home";
import SettingsScreen from "./Views/Settings";
import HistoryScreen from "./Views/History";
import HistoryNumberScreen from "./Views/HistoryNumber";

import WheelSpinningScreen from "./Views/WheelSpinning";
import NumberRandomScreen from "./Views/NumberRandom";
const Stack = createStackNavigator();

function Router() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{headerShown:null}}/>
        <Stack.Screen name="Settings" component={SettingsScreen}  options={{headerShown:null}}/>
        <Stack.Screen name="History" component={HistoryScreen}  options={{headerShown:null}}/>

        <Stack.Screen name="HistoryNumber" component={HistoryNumberScreen}  options={{headerShown:null}}/>

        <Stack.Screen name="WheelSpinning" component={WheelSpinningScreen}  options={{headerShown:null}}/>
        <Stack.Screen name="NumberRandom" component={NumberRandomScreen}  options={{headerShown:null}}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Router;
