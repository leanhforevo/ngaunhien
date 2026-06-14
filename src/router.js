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
import CoinTossScreen from "./Views/CoinToss";
import DiceRollScreen from "./Views/DiceRoll";
import CardDrawScreen from "./Views/CardDraw";
import LuckyDrawScreen from "./Views/LuckyDraw";

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
        <Stack.Screen name="CoinToss" component={CoinTossScreen}  options={{headerShown:null}}/>
        <Stack.Screen name="DiceRoll" component={DiceRollScreen}  options={{headerShown:null}}/>
        <Stack.Screen name="CardDraw" component={CardDrawScreen}  options={{headerShown:null}}/>
        <Stack.Screen name="LuckyDraw" component={LuckyDrawScreen}  options={{headerShown:null}}/>
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Router;
