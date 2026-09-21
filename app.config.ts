import type { ExpoConfig } from 'expo/config';

const NAVER_MAP_CLIENT_ID = process.env.NAVER_MAP_CLIENT_ID ?? '';

const config: ExpoConfig = {
  name: 'walkytalky',
  slug: 'walkytalky',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  ios: {
    supportsTablet: true,
  },
  android: {
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
  ],
};

export default config;
