import AsyncStorage from "@react-native-async-storage/async-storage";

const getLocal = async (key) => {
  if (!key) return null;
  const res = await AsyncStorage.getItem(key);
  if (res) {
    const JsonData = JSON.parse(res);
    return JsonData;
  } else {
    return null;
  }
};
const setLocal = (key, data) => {
  if (!key || !data) return null;
   AsyncStorage.setItem(key, JSON.stringify(data));
  return true;
};

export default {
  getLocal,
  setLocal,
};
