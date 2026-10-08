# WalkyTalky

원하는 산책 시간을 입력하면 현재 위치를 기준으로 왕복 산책 경로(같은 길로 갔다가 돌아오는 경로)를
지도 위에 보여주는 앱입니다. React Native(Expo) + TypeScript로 만들었습니다.

- **지도 표시(마커, 경로선)**: 네이버 지도 SDK
- **실제 도보 경로 계산**: 카카오맵 도보 길찾기 REST API

두 서비스를 조합해서 씁니다. 지도를 그리는 건 네이버 SDK가 더 성숙해서 쓰고, 실제 걸을 수 있는
경로 계산은 카카오가 2026년 7월에 새로 공개한 도보 길찾기 API로 처리합니다.

## 지금 단계

우선 **Android Studio로 로컬 빌드해서 지인들과 테스트**하는 걸 목표로 합니다. iOS 빌드/배포와
Play 스토어·App Store 정식 출시는 나중으로 미뤄둡니다 (맨 아래 "나중에 할 것" 참고).

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

## 2. 프로젝트 설정

```bash
npm install
cp .env.example .env
```

`.env` 파일에 두 키를 넣습니다.

```
NAVER_MAP_CLIENT_ID=여기에_네이버_client_id
EXPO_PUBLIC_KAKAO_REST_API_KEY=여기에_카카오_REST_API_키
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
App.tsx                    화면 전환(입력 화면 ↔ 지도 화면)
src/screens/HomeScreen.tsx 산책 시간(분) 입력 화면
src/screens/MapScreen.tsx  현재 위치 기반 왕복 경로 지도 화면 (네이버 지도로 렌더링)
src/lib/walkingRoute.ts    왕복 경로 계산 로직 — 카카오 도보 길찾기 API 연동, 실패 시 직선 추정 폴백
app.config.ts              Expo 설정 + 네이버 지도 SDK / 위치 권한 설정
```

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

### 정식 출시 (Play 스토어 / App Store)

- Android: Play Console 개발자 등록(1회성 $25) + 서명된 빌드(`assembleRelease`를 release
  키스토어로 서명) + 스토어 등록 정보 작성
- iOS: Apple Developer Program 가입 상태에서 App Store Connect에 앱 등록 + 심사 제출

지인 테스트가 끝나고 정식으로 배포하고 싶을 때 다시 안내해드릴게요.
