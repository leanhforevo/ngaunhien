import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Platform,
  NativeModules,
  Modal,
  FlatList,
} from "react-native";
import { Icon } from "react-native-elements";
import { getStatusBarHeight, getBottomSpace } from "react-native-iphone-x-helper-2";
import { useIsFocused } from "@react-navigation/native";
import Utils from "../Utils/utils";
import { TopAd, BottomAd } from "../Component/AdBanner";
import { Text, GlassCard } from "../Component/Common";

const keyLocalConfigs = "@!keyLocalConfigs";

const gameModes = [
  { name: "Vòng xoay", screen: "WheelSpinning", icon: "aperture-outline", type: "ionicon" },
  { name: "Số ngẫu nhiên", screen: "NumberRandom", icon: "calculator-outline", type: "ionicon" },
  { name: "Tung đồng xu", screen: "CoinToss", icon: "logo-usd", type: "ionicon" },
  { name: "Lắc xúc xắc", screen: "DiceRoll", icon: "cube-outline", type: "ionicon" },
  { name: "Rút bài Tây", screen: "CardDraw", icon: "albums-outline", type: "ionicon" },
  { name: "Bốc thăm", screen: "LuckyDraw", icon: "gift-outline", type: "ionicon" },
  { name: "Chọn ngón tay", screen: "FingerChooser", icon: "finger-print-outline", type: "ionicon" },
];

const languageList = [
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português (Brasil)", flag: "🇧🇷" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
];

const translations = {
  vi: {
    soundOn: "Bật âm",
    soundOff: "Tắt âm",
    langTitle: "Chọn ngôn ngữ",
    modes: {
      WheelSpinning: "Vòng xoay",
      NumberRandom: "Số ngẫu nhiên",
      CoinToss: "Tung đồng xu",
      DiceRoll: "Lắc xúc xắc",
      CardDraw: "Rút bài Tây",
      LuckyDraw: "Bốc thăm",
      FingerChooser: "Chọn ngón tay",
    }
  },
  en: {
    soundOn: "Sound On",
    soundOff: "Muted",
    langTitle: "Select Language",
    modes: {
      WheelSpinning: "Lucky Wheel",
      NumberRandom: "Random Number",
      CoinToss: "Coin Toss",
      DiceRoll: "Dice Roll",
      CardDraw: "Card Draw",
      LuckyDraw: "Lucky Draw",
      FingerChooser: "Finger Chooser",
    }
  },
  de: {
    soundOn: "Ton Ein",
    soundOff: "Stumm",
    langTitle: "Sprache wählen",
    modes: {
      WheelSpinning: "Glücksrad",
      NumberRandom: "Zufallszahl",
      CoinToss: "Münzwurf",
      DiceRoll: "Würfelwurf",
      CardDraw: "Kartenziehen",
      LuckyDraw: "Glücksverlosung",
      FingerChooser: "Finger-Wähler",
    }
  },
  fr: {
    soundOn: "Son Activé",
    soundOff: "Muet",
    langTitle: "Choisir la langue",
    modes: {
      WheelSpinning: "Roue de la Fortune",
      NumberRandom: "Nombre Aléatoire",
      CoinToss: "Pile ou Face",
      DiceRoll: "Lancer de Dés",
      CardDraw: "Tirage de Cartes",
      LuckyDraw: "Tirage au Sort",
      FingerChooser: "Sélecteur de Doigt",
    }
  },
  pt: {
    soundOn: "Som Ativo",
    soundOff: "Mudo",
    langTitle: "Selecionar idioma",
    modes: {
      WheelSpinning: "Roda da Fortuna",
      NumberRandom: "Número Aleatório",
      CoinToss: "Cara ou Coroa",
      DiceRoll: "Lançar Dados",
      CardDraw: "Puxar Carta",
      LuckyDraw: "Sorteio",
      FingerChooser: "Escolha de Dedo",
    }
  },
  hi: {
    soundOn: "ध्वни चालू",
    soundOff: "म्यूट",
    langTitle: "भाषा चुनें",
    modes: {
      WheelSpinning: "भाग्य चक्र",
      NumberRandom: "यादृच्छिक संख्या",
      CoinToss: "सिक्का उछाल",
      DiceRoll: "पासा रोल",
      CardDraw: "कार्ड ड्रा",
      LuckyDraw: "लकी ड्रा",
      FingerChooser: "फिंगर चॉइस",
    }
  }
};

const detectDeviceLanguage = () => {
  try {
    const locale =
      Platform.OS === 'ios'
        ? NativeModules.SettingsManager?.settings?.AppleLocale ||
          NativeModules.SettingsManager?.settings?.AppleLanguages?.[0]
        : NativeModules.I18nManager?.localeIdentifier;

    if (!locale) return 'en';
    
    const cleanLocale = locale.toLowerCase().replace('_', '-');
    if (cleanLocale.startsWith('vi')) return 'vi';
    if (cleanLocale.startsWith('de')) return 'de';
    if (cleanLocale.startsWith('fr')) return 'fr';
    if (cleanLocale.startsWith('pt')) return 'pt'; // Portuguese (Brazil)
    if (cleanLocale.startsWith('hi')) return 'hi'; // Hindi (India)
    return 'en'; // default to English
  } catch (e) {
    console.log("Detect locale error:", e);
    return 'en';
  }
};

const App = ({ navigation }) => {
  const isFocused = useIsFocused();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lang, setLang] = useState("en"); // Default to English, detected on mount
  const [langModalVisible, setLangModalVisible] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadConfigs();
    }
  }, [isFocused]);

  const loadConfigs = async () => {
    const configs = await Utils.getLocal(keyLocalConfigs);
    if (configs) {
      if (configs.sound !== undefined) {
        setSoundEnabled(configs.sound);
      }
      if (configs.lang !== undefined) {
        setLang(configs.lang);
      } else {
        const detected = detectDeviceLanguage();
        setLang(detected);
        configs.lang = detected;
        await Utils.setLocal(keyLocalConfigs, configs);
      }
    } else {
      const detected = detectDeviceLanguage();
      setLang(detected);
      const initialConfigs = { sound: true, lang: detected };
      await Utils.setLocal(keyLocalConfigs, initialConfigs);
    }
  };

  const toggleSound = async () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    const configs = (await Utils.getLocal(keyLocalConfigs)) || {};
    configs.sound = nextSound;
    await Utils.setLocal(keyLocalConfigs, configs);
  };

  const selectLanguage = async (selectedCode) => {
    setLang(selectedCode);
    setLangModalVisible(false);
    const configs = (await Utils.getLocal(keyLocalConfigs)) || {};
    configs.lang = selectedCode;
    await Utils.setLocal(keyLocalConfigs, configs);
  };

  const currentLangObj = languageList.find((l) => l.code === lang) || languageList[1];
  const t = translations[lang] || translations.en;

  const getModeName = (item) => {
    return t.modes[item.screen] || item.name;
  };

  return (
    <View style={styles.container}>
      <Image
        style={{ width: "100%", height: "100%", position: "absolute" }}
        source={require("../../assets/background.jpeg")}
      />
      <TopAd containerStyle={{ marginTop: getStatusBarHeight(true) + 10, alignItems: 'center' }} />
      
      {/* Controls row (Language and Sound toggle) */}
      <View style={styles.controlsRow}>
        <GlassCard
          style={styles.controlButton}
          onPress={() => setLangModalVisible(true)}
          activeOpacity={0.7}
        >
          <Text style={{ fontSize: 16 }}>{currentLangObj.flag}</Text>
          <Text bold style={styles.controlText}>{currentLangObj.label}</Text>
        </GlassCard>

        <GlassCard
          style={styles.controlButton}
          onPress={toggleSound}
          activeOpacity={0.7}
        >
          <Icon
            name={soundEnabled ? "volume-medium-outline" : "volume-mute-outline"}
            type="ionicon"
            size={20}
            color={soundEnabled ? "#1E293B" : "#94A3B8"}
          />
          <Text bold style={[styles.controlText, !soundEnabled && { color: "#94A3B8" }]}>
            {soundEnabled ? t.soundOn : t.soundOff}
          </Text>
        </GlassCard>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.gridContainer}>
          {gameModes.map((item, idx) => (
            <GlassCard
              key={idx}
              style={styles.gridItem}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <Icon
                name={item.icon}
                type={item.type}
                size={34}
                color="#1E293B"
              />
              <Text bold style={styles.gridItemText}>{getModeName(item)}</Text>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
      <BottomAd containerStyle={{ height: 260, marginBottom: getBottomSpace() || 10, justifyContent: 'center', alignItems: 'center' }} />

      {/* Language Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={langModalVisible}
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text size={18} bold>{t.langTitle}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Icon name="close-outline" type="ionicon" color="#1E293B" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={languageList}
              keyExtractor={(item) => item.code}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.langItemRow}
                  onPress={() => selectLanguage(item.code)}
                >
                  <View style={styles.langItemLeft}>
                    <Text style={styles.langFlag}>{item.flag}</Text>
                    <Text
                      size={16}
                      bold={item.code === lang}
                      style={[
                        styles.langLabel,
                        item.code === lang && styles.langLabelActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </View>
                  {item.code === lang && (
                    <Icon name="checkmark-outline" type="ionicon" color="#3B82F6" size={20} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 5,
  },
  controlButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.45)",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.6)",
    marginLeft: 10,
  },
  controlText: {
    fontSize: 12,
    fontFamily: "Arial",
    color: "#1E293B",
    marginLeft: 5,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  gridItem: {
    width: "42%",
    height: 100,
    margin: "4%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gridItemText: {
    marginTop: 8,
    fontSize: 14,
    fontFamily: "Arial",
    color: "#1E293B",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#F8FAFC",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "65%",
    padding: 20,
    paddingBottom: getBottomSpace() || 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  langItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  langItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  langFlag: {
    fontSize: 22,
    marginRight: 12,
  },
  langLabel: {
    fontSize: 16,
    color: "#1E293B",
    fontFamily: "Arial",
  },
  langLabelActive: {
    color: "#3B82F6",
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
});
