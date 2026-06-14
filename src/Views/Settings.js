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
import KeyboardSpacer from "../Component/KeyboardSpacer";
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
      <View style={{ height: 50, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          style={styles.containerHeaderIconLeft}
          onPress={() => navigation.pop()}
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
            Cài đặt
          </Text>
        </View>
        <View style={styles.containerHeaderIconRight}></View>
      </View>

      <ScrollView
        ref={refScroll}
        contentContainerStyle={{
          paddingTop: 30,
          paddingBottom: getBottomSpace() || 15,
        }}
      >
        <View style={{ padding: 15, paddingTop: 15 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "500",
              color: "#1E293B",
              fontFamily: "Arial",
              marginBottom: 8,
            }}
          >
            Âm thanh
          </Text>
          <View style={styles.containerGroup}>
            <View style={styles.containerRow}>
              <Text
                style={{
                  flex: 1,
                  fontSize: 15,
                  fontWeight: "500",
                  color: "#1E293B",
                  fontFamily: "Arial",
                }}
              >
                Hiệu ứng âm thanh
              </Text>
              <View style={{height:'100%',justifyContent:'center'}}>
<Switch
                trackColor={{ false: "#3e3e3e", true: "#81b0ff" }}
                thumbColor={isEnabled ? "#f5dd4b" : "#f4f3f4"}
                ios_backgroundColor="#3e3e3e"
                onValueChange={_evtPressedSound}
                value={isEnabled}
                style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
              />
              </View>
            </View>
          </View>
        </View>
        <View style={{ padding: 15 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "500",
              color: "#1E293B",
              fontFamily: "Arial",
              marginBottom: 8,
            }}
          >
            Danh sách
          </Text>
          <View style={styles.containerGroup}>
            {arrData.map((item, index) => (
              <View key={`itemList${index}`}>
                <View style={[styles.containerRow, { paddingRight: 0 }]}>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: "500",
                      color: "#1E293B",
                      fontFamily: "Arial",
                    }}
                  >
                    {index + 1 + ". " + item}
                  </Text>
                  <TouchableOpacity
                    style={styles.containerRowButtonRight}
                    onPress={() => _evtRemove(index)}
                  >
                    <Icon
                      name="close-circle-outline"
                      type="ionicon"
                      color="#1E293B"
                    />
                  </TouchableOpacity>
                </View>
                {index < arrData.length - 1 && (
                  <View
                    style={{
                      marginHorizontal: 15,
                      height: StyleSheet.hairlineWidth,
                      backgroundColor: "rgba(0,0,0,0.1)",
                    }}
                  />
                )}
              </View>
            ))}

            {showAdd ? (
              <View
                style={[
                  styles.containerRow,
                  {
                    paddingRight: 0,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: "rgba(0,0,0,0.1)",
                  },
                ]}
              >
                <TextInput
                  ref={refTxt}
                  style={{
                    flex: 1,
                    color: "#1E293B",
                    fontSize: 15,
                    height: "100%",
                    fontFamily: "Arial",
                  }}
                  placeholder={"Nhập nội dung"}
                  placeholderTextColor="rgba(30,41,59,0.4)"
                  autoCorrect={false}
                  returnKeyType={"done"}
                  value={txtAdd}
                  onChangeText={(txt) => settxtAdd(txt)}
                  onSubmitEditing={_evtSubmit}
                />
                <TouchableOpacity
                  style={styles.containerRowButtonRight}
                  onPress={_evtSubmit}
                >
                  <Icon
                    name="checkmark-circle-outline"
                    type="ionicon"
                    color="#1E293B"
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.containerRow,
                  {
                    paddingRight: 0,
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: "rgba(0,0,0,0.1)",
                  },
                ]}
                onPress={_evtShowAdd}
              >
                <Text
                  style={{
                    flex: 1,
                    fontSize: 15,
                    fontWeight: "500",
                    color: "#1E293B",
                    fontFamily: "Arial",
                  }}
                >
                  Thêm mới
                </Text>
                <View style={styles.containerRowButtonRight}>
                  <Icon name="add-circle-outline" type="ionicon" color="#1E293B" />
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
  containerHeaderIconLeft: {
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  containerHeaderIconRight: {
    height: 50,
    width: 50,
  },
  containerGroup: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    marginTop: 5,
  },
  containerRow: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 15,
    borderRadius: 10,
  },
  containerRowButtonRight: {
    height: 60,
    width: 50,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 15,
  },
});
