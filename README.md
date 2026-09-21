# WalkyTalky

원하는 산책 시간을 입력하면 현재 위치를 기준으로 왕복 산책 경로(같은 길로 갔다가 돌아오는 경로)를
지도 위에 보여주는 앱입니다. React Native(Expo) + TypeScript로 만들었습니다.

- **지도 표시(마커, 경로선)**: 네이버 지도 SDK
- **실제 도보 경로 계산**: 카카오맵 도보 길찾기 REST API

두 서비스를 조합해서 씁니다. 지도를 그리는 건 네이버 SDK가 더 성숙해서 쓰고, 실제 걸을 수 있는
경로 계산은 카카오가 2026년 7월에 새로 공개한 도보 길찾기 API로 처리합니다.

## 준비물

- [Node.js](https://nodejs.org) (LTS 버전)
- [Expo 계정](https://expo.dev/signup) (무료)
- 네이버 클라우드 플랫폼 Maps API Client ID
- 카카오 Developers REST API 키
- (안드로이드 로컬 테스트를 원한다면) Android Studio — 필수는 아니고, 클라우드 빌드로도 가능
- **iOS 실기기 테스트에는 Mac 없이도 가능하지만, Apple Developer Program(연 $99) 가입은 필요합니다.**
  네이버 지도 SDK가 네이티브 코드라서 일반 Expo Go 앱으로는 실행이 안 되고, 아래에서 설명하는
  "개발용 빌드(Dev Client)"를 클라우드에서 만들어 설치해야 하는데, 이 설치 자체가 애플 정책상
  유료 개발자 계정을 요구합니다.

## 1. API 키 발급

### 네이버 지도 Client ID

1. [Naver Cloud Platform](https://www.ncloud.com) 가입 및 로그인
2. 콘솔 → AI·NAVER API → Application 등록 → "Maps" 선택
3. iOS/Android Bundle ID·패키지명 등록
4. 발급된 **Client ID** 복사

### 카카오 REST API 키

1. [Kakao Developers](https://developers.kakao.com) 가입 및 로그인
2. 애플리케이션 추가 → [앱] → [제품 설정] → [카카오맵]에서 사용 설정 활성화
3. [앱 키]에서 **REST API 키** 복사

> **보안 주의**: 이 REST API 키는 앱 JS 코드에서 직접 호출하는 방식이라 클라이언트에
> 노출됩니다. Kakao Developers 콘솔의 플랫폼 설정에서 iOS 번들 ID / Android 패키지명으로
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

## 3. 개발용 빌드(Dev Client) 만들기

네이버 지도 SDK 때문에 일반 Expo Go로는 실행할 수 없고, 내 프로젝트 전용 "Dev Client"를
한 번 빌드해서 설치해야 합니다. (이후 코드 수정은 실시간으로 반영되고, 이 빌드는 새 네이티브
모듈을 추가할 때만 다시 하면 됩니다.)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### 안드로이드 (무료로 먼저 테스트하기 좋음)

```bash
eas build --platform android --profile development
```

빌드가 끝나면 나오는 링크로 APK를 다운받아 안드로이드 기기에 설치하면 됩니다.

### iOS

```bash
eas build --platform ios --profile development
```

- Apple Developer Program 계정 로그인을 요청하면 진행합니다 (연 $99 유료 계정 필요).
- 빌드가 끝나면 QR코드/링크로 본인 아이폰에 바로 설치할 수 있습니다 (Mac 불필요, 클라우드에서 빌드됨).

## 4. 앱 실행

Dev Client를 기기에 설치한 뒤:

```bash
npx expo start --dev-client
```

터미널에 뜨는 QR코드를 기기에 설치된 Dev Client 앱으로 스캔하면 앱이 뜹니다.

## 프로젝트 구조

```
App.tsx                    화면 전환(입력 화면 ↔ 지도 화면)
src/screens/HomeScreen.tsx 산책 시간(분) 입력 화면
src/screens/MapScreen.tsx  현재 위치 기반 왕복 경로 지도 화면 (네이버 지도로 렌더링)
src/lib/walkingRoute.ts    왕복 경로 계산 로직 — 카카오 도보 길찾기 API 연동, 실패 시 직선 추정 폴백
app.config.ts              Expo 설정 + 네이버 지도 SDK / 위치 권한 설정
```
