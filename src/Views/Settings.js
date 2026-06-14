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
import Utils from "../Utils/utils";
const keyLocalCache = "@!cacheData";
const keyLocalConfigs = "@!keyLocalConfigs";
export default function App({ navigation, route }) {
  const { data: dataList, callback = () => {} } = route.params;
  const refTxt = useRef(null);
  const refScroll = useRef(null);

  const [isEnabled, setIsEnabled] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [arrData, setArrData] = useState([]);
  const [txtAdd, settxtAdd] = useState("");

  useEffect(() => {
    getData();
    return () => {
      // alert(arrData.length)
      callback()
    };
  }, []);
  const getData = async () => {
    setArrData(dataList);

    const configsLocal = await Utils.getLocal(keyLocalConfigs);
    if (configsLocal) {
      setIsEnabled(configsLocal.sound)
    }
  };

  const _evtShowAdd = () => {
    settxtAdd("");
    setShowAdd(true);
    setTimeout(() => {
      refTxt.current.focus();
    }, 10);
    setTimeout(() => {
      refScroll.current.scrollToEnd();
    }, 350);
  };

  const _evtSubmit = () => {
    setShowAdd(false);
    const newData = [...arrData, txtAdd];
    Utils.setLocal(keyLocalCache, newData);
    setArrData(newData);
    callback(newData);
  };

  const _evtRemove = (index) => {
    LayoutAnimation.spring();
    const newData = [...arrData];
    newData.splice(index, 1);
    Utils.setLocal(keyLocalCache, newData);
    setArrData(newData);
    callback(newData);
  };

  const _evtPressedSound=async()=>{
    const configsLocal = await Utils.getLocal(keyLocalConfigs);
    if (configsLocal) {

      Utils.setLocal(keyLocalConfigs, {
        ...configsLocal,
        sound:!isEnabled
      });
    } else {
      Utils.setLocal(keyLocalConfigs, {
        ...configsLocal,
        sound:!isEnabled
      });
    }
    setIsEnabled(!isEnabled)
  }
  return (
    <View style={styles.container}>
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />

      <View style={{ height: getStatusBarHeight(true) }} />
      <View style={{ height: 50, flexDirection: "row" }}>
        <TouchableOpacity
          style={styles.containerIcon}
          onPress={() => navigation.pop()}
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
          <Text style={{ fontSize: 18, fontWeight: "500" }}>Cài đặt</Text>
        </View>
        <View style={styles.containerIcon}></View>
      </View>

      <ScrollView
        ref={refScroll}
        contentContainerStyle={{ paddingBottom: getBottomSpace() || 15 }}
      >
        <View style={{ padding: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "500" }}>Cài đặt</Text>
          <View style={styles.containerGroup}>
            <View style={styles.containerRow}>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: "500" }}>
                Âm thanh
              </Text>
              <Switch
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={_evtPressedSound}
                value={isEnabled}
              />
            </View>
          </View>
        </View>
        <View style={{ padding: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: "500" }}> Danh sách</Text>
          <View style={styles.containerGroup}>
            <FlatList
              data={[...arrData]}
              keyExtractor={(e, i) => `itemList${i}`}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    marginHorizontal: 15,
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: "#000",
                  }}
                />
              )}
              renderItem={({ item, index }) => {
                return (
                  <View style={styles.containerRow}>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: "500" }}>
                      {index + 1 + ". " + item}
                    </Text>
                    <TouchableOpacity
                      style={styles.containerIcon}
                      onPress={() => _evtRemove(index)}
                    >
                      <Icon
                        name="close-circle-outline"
                        type="ionicon"
                        color="#000"
                      />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
            {showAdd ? (
              <View style={styles.containerBTNAdd}>
                <TextInput
                  ref={refTxt}
                  style={{ flex: 1 }}
                  placeholder={"Nhập nội dung"}
                  //  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType={"done"}
                  value={txtAdd}
                  onChangeText={(txt) => settxtAdd(txt)}
                  onSubmitEditing={_evtSubmit}
                />
              </View>
            ) : (
              <TouchableOpacity
                style={{
                  ...styles.containerRow,
                  borderTopWidth: StyleSheet.hairlineWidth,
                  justifyContent: "center",
                }}
                onPress={_evtShowAdd}
              >
                <Text style={{ fontSize: 15, fontWeight: "500" }}>
                  Thêm mới
                </Text>
                <View style={styles.containerIcon}>
                  <Icon name="add-circle-outline" type="ionicon" color="#000" />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <KeyboardSpacer topSpacing={0} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
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
