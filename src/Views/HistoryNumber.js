import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState, useRef } from "react";
import { StyleSheet, Text, View, Image, FlatList,TouchableOpacity } from "react-native";
import {
  getBottomSpace,
  getStatusBarHeight,
} from "react-native-iphone-x-helper-2";
import moment from "moment";
import Utils from "../Utils/utils";
import { Icon } from "react-native-elements";
const keyLocalhistory = "@!cacheDataHistory2";
export default function App({ navigation, route }) {
  const [arrData, setArrData] = useState([]);

  useEffect(() => {
    getData();
  }, []);
  const getData = async () => {
    const dataHistoryLocal = await Utils.getLocal(keyLocalhistory);
    if (dataHistoryLocal) {
      setArrData(dataHistoryLocal);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />

      <View style={{ height: getStatusBarHeight(true) }} />
      <View style={{ height: 50, flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity style={styles.containerIcon} onPress={()=>navigation.pop()}>
          <Icon
            name="arrow-back-circle-outline"
            type="ionicon"
            color="#FFF"
          />
        </TouchableOpacity>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ fontSize: 18, fontWeight: "500", color: "#FFF" }}>
            Lịch sử lượt quay
          </Text>
        </View>
        <View style={styles.containerIcon}></View>
      </View>
      <View style={{flex:1, padding: 15, marginBottom: getBottomSpace() }}>
        {/* <Text style={{ fontSize: 18, fontWeight: "500" }}>
          Lịch sử lượt quay
        </Text> */}
        <View style={styles.containerGroup}>
          {arrData && arrData.length > 0 ? (
            <FlatList
              data={[...arrData]}
              keyExtractor={(e, i) => `itemList${i}`}
              ItemSeparatorComponent={() => (
                <View
                  style={{
                    marginHorizontal: 15,
                    height: StyleSheet.hairlineWidth,
                    backgroundColor: "rgba(255,255,255,0.12)",
                  }}
                />
              )}
              renderItem={({ item, index }) => {
                return (
                  <View style={styles.containerRow}>
                    <Text style={{ flex: 1, fontSize: 15, fontWeight: "500", color: "#FFF" }}>
                      {index + 1 + ". " + item?.title}
                    </Text>
                    <View style={styles.containerIcon}>
                      <Text style={{ fontSize: 15, fontWeight: "500", color: "#FFF" }}>
                        {moment(item?.time).format("DD/MM/YYYY hh:mm:ss")}
                      </Text>
                    </View>
                  </View>
                );
              }}
            />
          ) : (
            <View style={styles.containerRow}>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: "500", color: "#FFF" }}>
                {`Không có dữ liệu`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerIcon: {
    minWidth: 50,
    height: 50,
    justifyContent: "center",
  },
  containerGroup: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    marginTop: 10,
  },
  containerRow: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    borderRadius: 10,
  },
});
