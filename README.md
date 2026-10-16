# WalkyTalky

원하는 산책 시간(분)을 입력하면 현재 위치를 기준으로 왕복 산책 경로(같은 길로 갔다가 돌아오는 경로)를 지도 위에 보여주는 앱입니다. React Native(Expo) + TypeScript로 만들었고, 현재는 **Android 빌드를 기준**으로 합니다.

## 기능
- 산책 시간(분) 입력 (기본값 30분, 0보다 큰 숫자만 허용)
- 평균 보행 속도 4.5km/h로 총 거리를 계산하고, 그 절반을 편도 거리로 삼아 **정북 방향**으로 떨어진 지점을 반환점으로 잡음
- 카카오 도보 길찾기 REST API로 출발지 → 반환점의 실제 도보 경로를 받아, 같은 경로를 되돌아오는 왕복 경로를 만듦
- 네이버 지도에 경로선, 출발/도착 마커, 반환점 마커 표시. 편도 거리(m) 표시
- 화면 하단 AdMob 배너 광고 (입력 화면, 지도 화면)

## 기술 스택
- Expo ~57 / React Native 0.86 / React 19 / TypeScript(strict)
- 지도: `@mj-studio/react-native-naver-map` (네이티브 모듈이라 Expo Go로는 실행 불가)
- 경로: 카카오 도보 길찾기 REST API (`https://dapi.kakao.com/v2/routing/walk`)
- 위치: `expo-location` (앱 사용 중 위치만)
- 광고: `react-native-google-mobile-ads`

## 필요한 키와 넣는 곳
키는 소스에 넣지 않고 **`.env`** 에 둡니다. `.env`는 `.gitignore` 대상이라 커밋되지 않습니다.

```bash
npm install
cp .env.example .env   # 값을 채웁니다
```

| 변수 | 용도 | 읽는 곳 | 비워두면 |
|---|---|---|---|
| `NAVER_MAP_CLIENT_ID` | 네이버 클라우드 플랫폼 Maps Client ID | `app.config.ts` → 네이티브 설정(**prebuild 시점**에 반영) | 앱은 빌드·실행되지만 네이버 지도 인증이 되지 않아 지도가 정상 표시되지 않을 수 있음 (SDK 동작이라 코드로는 확인 불가) |
| `EXPO_PUBLIC_KAKAO_REST_API_KEY` | 카카오 REST API 키 | `src/screens/MapScreen.tsx` (JS에서 직접 호출) | 도보 경로 API를 호출하지 않고 **직선 추정 경로**(출발지 → 정북 방향 반환점 → 출발지)로 대체하며, 화면에 "직선 거리로 추정한 경로" 안내가 표시됨. API 요청이 실패해도 같은 방식으로 대체됨 |
| `ADMOB_ANDROID_APP_ID` | AdMob Android 앱 ID | `app.config.ts` → 네이티브 설정(prebuild 시점) | 구글 공식 샘플 앱 ID로 대체 |
| `EXPO_PUBLIC_ADMOB_BANNER_AD_UNIT_ID` | 배너 광고 단위 ID | `src/ads/adUnitIds.ts` | 구글 테스트 배너 ID. 개발 빌드(`__DEV__`)에서는 값이 있어도 항상 테스트 ID를 사용 |

즉 **키가 하나도 없어도** 타입 검사·prebuild·빌드는 되고, 기능만 위 표처럼 줄어듭니다. 광고는 키가 없어도 테스트 광고로 동작합니다.

> **보안 주의**: `EXPO_PUBLIC_` 변수는 앱 번들에 그대로 포함되므로 카카오 REST API 키는 앱을 받은 사람이 꺼내 볼 수 있습니다. Kakao Developers 콘솔에서 Android 패키지명(`com.walkytalky.app`) 등으로 사용을 제한하는 것을 권장합니다. 키를 서버에만 두려면 호출을 서버(또는 서버리스 함수)로 옮겨야 하며, 현재 버전에는 없습니다. 네이버 Client ID와 AdMob ID도 앱에 포함되는 식별자입니다.

### 키 발급
- **네이버**: [Naver Cloud Platform](https://www.ncloud.com) 콘솔에서 Maps 애플리케이션을 등록하고 Android 패키지명 `com.walkytalky.app`을 등록 → Client ID
- **카카오**: [Kakao Developers](https://developers.kakao.com)에서 앱을 만들고 카카오맵 사용 설정을 활성화 → [앱 키]의 REST API 키
- **AdMob**: 출시 직전에만 필요. [AdMob](https://admob.google.com)에서 앱 ID(`ca-app-pub-...~...`)와 배너 광고 단위 ID(`ca-app-pub-.../...`) 발급

## 실행 방법 (Android)
준비물: Node.js(LTS), Android Studio(Android SDK, 에뮬레이터 또는 USB 연결 기기)

```bash
npx expo prebuild --platform android   # android/ 폴더 생성 (.gitignore 대상)
npx expo run:android                    # 빌드·설치·실행
```
Android Studio에서 열려면 생성된 `android/` 폴더를 `Open` 하면 됩니다. `app.config.ts`나 `.env`의 `NAVER_MAP_CLIENT_ID`, `ADMOB_ANDROID_APP_ID`를 바꿨다면 `prebuild`를 다시 실행해야 반영됩니다.

타입 검사: `npx tsc --noEmit`

### 지인 테스트용 APK
```bash
cd android && ./gradlew assembleRelease
# 결과: android/app/build/outputs/apk/release/app-release.apk
```
받는 사람은 "출처를 알 수 없는 앱" 설치를 허용해야 합니다.

## 프로젝트 구조
```
App.tsx                    입력 화면 ↔ 지도 화면 전환, 광고 SDK 초기화
src/screens/HomeScreen.tsx 산책 시간(분) 입력
src/screens/MapScreen.tsx  위치 권한 요청, 현재 위치, 경로 생성, 네이버 지도 렌더링
src/lib/walkingRoute.ts    거리 계산, 카카오 도보 경로 호출, 실패/키 없음 시 직선 추정 경로
src/ads/adUnitIds.ts       광고 단위 ID 결정 (개발 빌드는 항상 테스트 ID)
src/ads/AdBanner.tsx       배너 광고 컴포넌트
app.config.ts              Expo 설정 + 네이버 지도 / 위치 권한 / AdMob 플러그인 설정
.env.example               환경변수 템플릿
```

## 권한 / 개인정보
- **위치 (앞에 있을 때만)**: 현재 위치를 기준으로 경로를 계산하기 위해 사용합니다. Android는 `ACCESS_FINE_LOCATION`을 선언합니다. 거부하면 "위치 권한이 필요해요" 안내가 표시되고 경로를 만들 수 없습니다.
- **외부 전송**: 키가 설정돼 있으면 출발지와 반환점 좌표가 카카오 도보 길찾기 API로 전송됩니다. 지도는 네이버 지도 SDK가, 광고는 AdMob이 각자 처리합니다(광고는 비맞춤 광고만 요청: `requestNonPersonalizedAdsOnly`).
- 개발자 서버는 없고, 앱이 위치를 저장하는 코드는 없습니다.

## 상태 / 한계
- 초기 개발 단계의 앱이며 Play 스토어에는 출시되지 않았습니다.
- 반환점은 항상 **정북 방향**(bearing 0)으로 잡으므로 북쪽이 강·바다·도로 밖이면 가까운 도보 경로가 부정확하거나 실패(직선 추정으로 대체)할 수 있습니다. 순환 경로나 방향 선택은 없습니다.
- 카카오 도보 경로 API 요청이 실패하면 안내 문구와 함께 직선 추정 경로로 대체됩니다.
- 경로 계산 실패 시의 재시도, 지도 SDK 오류 화면, 자동화 테스트는 없습니다.
- iOS: `app.config.ts`에 `bundleIdentifier`는 있으나 AdMob iOS 앱 ID가 설정돼 있지 않아(`expo config` 경고) iOS 빌드는 아직 지원하지 않습니다.

## Play 스토어 출시 전 체크리스트
정책은 바뀔 수 있으니 Play Console 안내를 함께 확인하세요.
- [ ] `android.versionCode`(`app.config.ts`)를 업로드마다 증가, 패키지명 `com.walkytalky.app`은 출시 후 변경 불가
- [ ] AAB 빌드: `cd android && ./gradlew bundleRelease` (`android/app/build/outputs/bundle/release/app-release.aab`)
- [ ] 릴리스 서명 키스토어 생성·백업 (`*.jks`는 `.gitignore` 대상. 커밋 금지)
- [ ] `assets/`의 아이콘·스플래시를 실제 이미지로 교체
- [ ] AdMob 실제 앱 ID / 배너 ID를 `.env`에 입력 (테스트 ID로 출시 금지)
- [ ] 개인정보처리방침 URL 준비 (위치, 광고 ID 사용 명시), 데이터 보안 양식, 콘텐츠 등급
- [ ] 스토어 등록 정보(설명, 스크린샷, 아이콘), 필요한 경우 비공개 테스트
- [ ] 카카오 REST API 키 사용 제한 설정

## 라이선스
저장소의 `LICENSE`는 MIT 라이선스 전문이며 저작권 표기가 Expo 템플릿(650 Industries)으로 되어 있습니다. 본인 저작권 표기로 바꿀지 확인하세요.
