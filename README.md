# WalkyTalky

원하는 산책 시간을 입력하면 현재 위치를 기준으로 왕복 산책 경로(같은 길로 갔다가 돌아오는 경로)를
지도 위에 보여주는 앱입니다. React Native(Expo) + TypeScript로 만들었습니다.

- **지도 표시(마커, 경로선)**: 네이버 지도 SDK
- **실제 도보 경로 계산**: 카카오맵 도보 길찾기 REST API
- **광고**: 구글 애드몹(AdMob) 배너 광고

두 서비스를 조합해서 씁니다. 지도를 그리는 건 네이버 SDK가 더 성숙해서 쓰고, 실제 걸을 수 있는
경로 계산은 카카오가 2026년 7월에 새로 공개한 도보 길찾기 API로 처리합니다.

## 지금 단계

**Android Studio로 로컬 빌드 → 지인 테스트 → Play 스토어 정식 출시**를 목표로 합니다. iOS
빌드/배포는 나중으로 미뤄둡니다 (맨 아래 "나중에 할 것" 참고).

## 준비물

- [Node.js](https://nodejs.org) (LTS 버전)
- [Android Studio](https://developer.android.com/studio) — 설치하면 Android SDK, 에뮬레이터가
  같이 깔립니다. 설치 후 SDK Manager에서 최신 Android SDK Platform 하나는 받아두세요.
- 네이버 클라우드 플랫폼 Maps API Client ID
- 카카오 Developers REST API 키

## 1. API 키 발급

### 네이버 지도 Client ID

1. [Naver Cloud Platform](https://www.ncloud.com) 가입 및 로그인
2. 콘솔 → AI·NAVER API → Application 등록 → "Maps" 선택
3. Android 패키지명에 `com.walkytalky.app` 등록 (iOS는 나중에 할 때 등록해도 됨)
4. 발급된 **Client ID** 복사

### 카카오 REST API 키

1. [Kakao Developers](https://developers.kakao.com) 가입 및 로그인
2. 애플리케이션 추가 → [앱] → [제품 설정] → [카카오맵]에서 사용 설정 활성화
3. [앱 키]에서 **REST API 키** 복사

> **보안 주의**: 이 REST API 키는 앱 JS 코드에서 직접 호출하는 방식이라 클라이언트에
> 노출됩니다. Kakao Developers 콘솔의 플랫폼 설정에서 Android 패키지명(`com.walkytalky.app`)으로
> 키 사용을 제한해서 오남용을 막는 걸 권장해요. 더 안전하게 하려면 이 호출을 내 서버(또는
> 서버리스 함수)를 거치게 만들어서 키를 서버에만 두는 방법도 있어요 (지금 버전엔 없음).

### AdMob App ID / 광고 유닛 ID

개발 중에는 발급받지 않아도 됩니다 (구글 공식 샘플 ID로 자동 대체돼서 테스트 광고가 떠요).
**Play 스토어에 실제로 올리기 직전에만** 발급받으면 됩니다.

1. [AdMob](https://admob.google.com) 가입 및 로그인 → 앱 추가 (아직 스토어에 없는 앱으로 등록)
2. 추가하면 **App ID**(`ca-app-pub-xxxxxxxx~xxxxxxxx` 형식)가 발급됩니다
3. 그 앱 안에 배너 광고 단위를 만들면 **광고 유닛 ID**(`ca-app-pub-xxxxxxxx/xxxxxxxx` 형식,
   App ID와 헷갈리지 않게 구분)가 발급됩니다

## 2. 프로젝트 설정

```bash
npm install
cp .env.example .env
```

`.env` 파일에 키를 넣습니다. AdMob 쪽은 운영 출시 직전까지는 비워둬도 됩니다.

```
NAVER_MAP_CLIENT_ID=여기에_네이버_client_id
EXPO_PUBLIC_KAKAO_REST_API_KEY=여기에_카카오_REST_API_키
ADMOB_ANDROID_APP_ID=여기에_AdMob_App_ID (비워두면 구글 샘플 ID 사용)
EXPO_PUBLIC_ADMOB_BANNER_AD_UNIT_ID=여기에_배너_광고_유닛_ID (비워두면 구글 테스트 ID 사용)
```

## 3. Android Studio로 로컬 빌드 + 실행

네이버 지도 SDK가 네이티브 코드라서 일반 Expo Go 앱으로는 실행이 안 됩니다. 대신 로컬에서
네이티브 프로젝트를 만들어서 직접 빌드합니다.

```bash
npx expo prebuild --platform android
```

처음 한 번 실행하면 `android/` 폴더가 생성됩니다 (이 폴더는 자동 생성 결과물이라 git에는
안 올라가요). 이후 두 가지 방법 중 편한 걸로 실행하면 됩니다.

**방법 A — 커맨드로 바로 실행 (제일 간단)**

에뮬레이터를 켜두거나 USB로 안드로이드 폰을 연결한 상태에서:

```bash
npx expo run:android
```

빌드 후 자동으로 기기에 설치되고 실행됩니다. 이후 코드를 수정하면 실시간으로 반영돼요.

**방법 B — Android Studio에서 직접 열기**

Android Studio 실행 → `Open` → 생성된 `android/` 폴더 선택 → 상단 재생(▶) 버튼으로 실행.
디버깅이나 로그를 더 자세히 보고 싶을 때 이 방법이 편해요.

> `app.config.ts`를 수정했다면(예: 권한, 아이콘 설정 변경) `npx expo prebuild --platform android`를
> 다시 실행해서 `android/` 폴더에 반영해야 합니다.

## 4. 지인 테스트용 APK 만들기

개발 중엔 `npx expo run:android`로 충분하지만, 지인들에게 설치 파일만 보내서 테스트하게
하려면 독립 실행되는 APK가 필요합니다 (내 컴퓨터가 켜져 있지 않아도 동작하는 버전).

```bash
cd android
./gradlew assembleRelease
```

빌드가 끝나면 `android/app/build/outputs/apk/release/app-release.apk` 파일이 생깁니다. 이
파일을 카카오톡/구글 드라이브 등으로 지인들에게 보내주면 됩니다. 받는 사람은 설치할 때
"출처를 알 수 없는 앱" 설치를 허용해야 해요 (안드로이드가 스토어 밖 설치라 경고를 띄우는
정상적인 절차입니다).

## 프로젝트 구조

```
App.tsx                    화면 전환(입력 화면 ↔ 지도 화면), 앱 시작 시 광고 SDK 초기화
src/screens/HomeScreen.tsx 산책 시간(분) 입력 화면
src/screens/MapScreen.tsx  현재 위치 기반 왕복 경로 지도 화면 (네이버 지도로 렌더링)
src/lib/walkingRoute.ts    왕복 경로 계산 로직 — 카카오 도보 길찾기 API 연동, 실패 시 직선 추정 폴백
src/ads/adUnitIds.ts       광고 유닛 ID 결정 (개발 빌드는 항상 구글 테스트 ID)
src/ads/AdBanner.tsx       배너 광고 컴포넌트 — 광고 관련 코드는 전부 이 디렉터리에 모여 있음
app.config.ts              Expo 설정 + 네이버 지도 SDK / 위치 권한 / AdMob 설정
```

## Play 스토어 출시 체크리스트

지인 테스트가 끝나고 정식 출시할 때 손봐야 할 것들을 정리했어요. 코드로 되는 부분은 이미
반영해뒀고, 나머지는 Play Console 웹사이트에서 직접 해야 하는 작업이에요.

### 코드/빌드 쪽 (이미 준비됨 또는 할 일)

- [x] Android 패키지명 고정 (`com.walkytalky.app`) — 출시 후에는 **변경 불가**이니 지금 확정해두는 게 좋아요
- [x] `android.versionCode` 설정 — **업로드할 때마다 1씩 올려야** 해요 (같은 값 재업로드는 거부됨). `app.config.ts`에서 수정
- [ ] **APK가 아니라 AAB(Android App Bundle)로 빌드해야 함** — 신규 앱은 AAB만 허용돼요. 로컬에서는:
  ```bash
  cd android
  ./gradlew bundleRelease
  ```
  결과물: `android/app/build/outputs/bundle/release/app-release.aab`
- [ ] **릴리즈용 서명 키(keystore) 만들기** — 테스트용 APK는 디버그 키로 서명되는데, 스토어
  업로드용은 release keystore가 따로 필요해요. (`keytool -genkeypair ...`로 생성하거나
  Android Studio의 Build > Generate Signed App Bundle 기능 사용). **이 키스토어 파일과
  비밀번호를 잃어버리면 같은 앱으로 업데이트를 올릴 수 없으니 꼭 안전하게 백업**해두세요.
- [ ] 실제 앱 아이콘/스플래시 이미지로 교체 — 지금은 Expo 기본 템플릿 아이콘이 들어가 있어요
  (`assets/` 폴더)
- [ ] AdMob App ID / 광고 유닛 ID를 실제 값으로 `.env`에 채우기 (위 "AdMob" 항목 참고)

### Play Console 쪽 (웹사이트에서 직접 해야 함)

- [ ] [Play Console](https://play.google.com/console) 개발자 계정 등록 — **1회성 $25**
- [ ] **개인정보처리방침(Privacy Policy) 페이지 준비하고 URL 등록** — 필수입니다. 위치 정보와
  광고(AdMob이 광고 ID 등을 수집)를 쓰기 때문에 더더욱 빠뜨리면 바로 반려돼요. 간단한 정적
  페이지 하나면 충분해요 (예: GitHub Pages, Notion 공개 페이지 등). 내용 작성은 제가 도와드릴
  수 있어요 (법률 자문은 아니지만 표준 양식에 맞춰 초안을 써드릴 수 있어요).
- [ ] **데이터 보안(Data safety) 설문 작성** — 앱 콘텐츠 메뉴에서, "위치 정보 수집(앱 기능
  제공 목적)"과 "광고 ID 수집(AdMob)"을 정확히 표시해야 해요
- [ ] **콘텐츠 등급 설문** 작성
- [ ] **비공개 테스트(Closed testing) 선행 필수** — 최근 정책상 신규 개인 개발자 계정은
  프로덕션 출시 전에 테스터 12명을 모아 14일 연속 비공개 테스트를 거쳐야 해요. 앞서 만든
  지인 테스트용 APK/AAB를 이 단계에 그대로 활용하면 돼요
- [ ] 스토어 등록 정보: 앱 이름, 설명, 스크린샷(최소 2장), 아이콘, 카테고리 등 작성
- [ ] 타깃 API 레벨 확인 — 2026년 8월 31일부터 신규 앱은 **Android 16(API 36) 이상**을
  타깃해야 해요. `npx expo prebuild`로 생성된 `android/app/build.gradle`의
  `targetSdkVersion` 값을 확인해서, 쓰고 있는 Expo SDK 버전이 이 기준을 만족하는지
  체크하세요 (보통 최신 Expo SDK는 자동으로 맞춰줘요)
- [ ] 개발자 본인 인증(Developer verification) — 2026년 9월 30일부터 일부 국가에서 시작된
  새 요건이라 계정 등록 과정에서 요구할 수 있어요

위 Play Console 항목들은 웹 UI에서 진행하셔야 해서 제가 대신 해드릴 순 없지만, 개인정보처리방침
초안 작성이나 데이터 보안 설문에 뭐라고 답해야 할지 같은 건 같이 준비해드릴 수 있어요.

참고: [앱 출시 준비 - Android Developers](https://developer.android.com/studio/publish/preparing)

## 나중에 할 것 (지금은 보류)

### iOS 빌드

Mac 없이도 가능하지만 Apple Developer Program(연 $99) 가입이 필요해요. 그때 가서 EAS 클라우드
빌드로 진행하면 됩니다.

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform ios --profile development
```

빌드가 끝나면 QR코드/링크로 아이폰에 바로 설치할 수 있어요 (Mac 불필요, 클라우드에서 빌드됨).

### App Store 정식 출시

Apple Developer Program 가입 상태에서 App Store Connect에 앱 등록 + 심사 제출이 필요해요.
iOS 빌드를 진행할 때 다시 자세히 안내해드릴게요.
