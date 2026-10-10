import { TestIds } from 'react-native-google-mobile-ads';

/**
 * 광고 유닛 ID를 한곳에 모아둔 파일.
 * 개발 중(__DEV__)에는 항상 구글 공식 테스트 ID를 쓰고, 운영 빌드에서만 .env에 넣은
 * 실제 광고 유닛 ID를 쓴다. 실수로 테스트 빌드에 실제 광고 ID를 넣어 노출하는 걸 방지한다.
 */
export const bannerAdUnitId = __DEV__
  ? TestIds.BANNER
  : (process.env.EXPO_PUBLIC_ADMOB_BANNER_AD_UNIT_ID ?? TestIds.BANNER);
