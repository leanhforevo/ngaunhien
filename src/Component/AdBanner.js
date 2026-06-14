import React from "react";
import { View, Platform } from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { getBottomSpace, getStatusBarHeight } from "react-native-iphone-x-helper-2";

const ad_id_IOS = "ca-app-pub-4249582158718282/2906946274";
const ad_id_Android = "ca-app-pub-4249582158718282/4024586823";
const adUnitId = __DEV__
  ? TestIds.BANNER
  : Platform.OS === "ios"
  ? ad_id_IOS
  : ad_id_Android;

export const TopAd = React.memo(({ containerStyle }) => {
  const defaultStyle = {
    marginTop: getStatusBarHeight(true) + 10,
    alignItems: 'center',
  };
  
  const combinedStyle = {
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    ...(containerStyle || defaultStyle),
  };
  
  return (
    <View style={combinedStyle}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}, () => true);

export const BottomAd = React.memo(({ containerStyle }) => {
  const defaultStyle = {
    height: 260,
    marginBottom: getBottomSpace() || 10,
    justifyContent: 'center',
    alignItems: 'center',
  };

  const combinedStyle = {
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    ...(containerStyle || defaultStyle),
  };

  return (
    <View style={combinedStyle}>
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.MEDIUM_RECTANGLE}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}, () => true);
