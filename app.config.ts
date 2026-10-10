import type { ExpoConfig } from 'expo/config';

const NAVER_MAP_CLIENT_ID = process.env.NAVER_MAP_CLIENT_ID ?? '';
// 구글이 공개한 샘플(테스트용) AdMob App ID. 본인 AdMob 계정을 만들기 전까지는 이걸로
// 개발하면 되고, 실제 출시 전에는 .env의 ADMOB_ANDROID_APP_ID를 꼭 본인 값으로 채워야 한다.
const SAMPLE_ADMOB_ANDROID_APP_ID = 'ca-app-pub-3940256099942544~3347511713';
const ADMOB_ANDROID_APP_ID =
  process.env.ADMOB_ANDROID_APP_ID || SAMPLE_ADMOB_ANDROID_APP_ID;

const config: ExpoConfig = {
  name: 'walkytalky',
  slug: 'walkytalky',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.walkytalky.app',
  },
  android: {
    package: 'com.walkytalky.app',
    // Play 스토어에 올릴 때마다 1씩 올려야 한다 (같은 값으로는 업로드가 거부됨).
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundImage: './assets/android-icon-background.png',
      monochromeImage: './assets/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-location',
      {
        locationWhenInUsePermission:
          '현재 위치를 기준으로 왕복 산책로를 계산하기 위해 위치 정보를 사용합니다.',
      },
    ],
    [
      '@mj-studio/react-native-naver-map',
      {
        client_id: NAVER_MAP_CLIENT_ID,
        ios: {
          NSLocationWhenInUseUsageDescription:
            '현재 위치를 기준으로 왕복 산책로를 계산하기 위해 위치 정보를 사용합니다.',
        },
        android: {
          ACCESS_FINE_LOCATION: true,
        },
      },
    ],
    [
      'react-native-google-mobile-ads',
      {
        androidAppId: ADMOB_ANDROID_APP_ID,
      },
    ],
  ],
};

export default config;
