export interface Coordinate {
  latitude: number;
  longitude: number;
}

export const AVERAGE_WALKING_SPEED_KMH = 4.5;

export function metersFromMinutes(
  minutes: number,
  speedKmh: number = AVERAGE_WALKING_SPEED_KMH
): number {
  const speedMetersPerMinute = (speedKmh * 1000) / 60;
  return minutes * speedMetersPerMinute;
}

const EARTH_RADIUS_METERS = 6371000;

export function destinationPoint(
  start: Coordinate,
  distanceMeters: number,
  bearingDegrees: number
): Coordinate {
  const bearing = (bearingDegrees * Math.PI) / 180;
  const lat1 = (start.latitude * Math.PI) / 180;
  const lon1 = (start.longitude * Math.PI) / 180;
  const angularDistance = distanceMeters / EARTH_RADIUS_METERS;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
    );

  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (((lon2 * 180) / Math.PI + 540) % 360) - 180,
  };
}

export interface RoundTripRoute {
  path: Coordinate[];
  oneWayDistanceMeters: number;
  /** true면 카카오 도보 경로 API 대신 직선 추정 경로로 대체된 결과다. */
  isFallback: boolean;
}

/**
 * 카카오맵 도보 경로 조회 REST API 연동 자리.
 *
 * TODO: 정확한 엔드포인트/요청 파라미터/응답 필드는 Kakao Developers 공식 문서를 보고
 * 채워 넣어야 한다 (이 환경에서는 kakao.com 도메인 접근이 막혀 있어 직접 확인이 불가능했다).
 * 문서를 확인하는 즉시 아래 fetch 호출부만 채우면 된다 — 이 함수의 인터페이스(입력/출력)는
 * 이미 앱 전체와 맞춰서 설계해뒀다.
 */
async function fetchKakaoWalkingPath(
  _origin: Coordinate,
  _destination: Coordinate,
  _restApiKey: string
): Promise<Coordinate[]> {
  throw new Error(
    '카카오 도보 경로 API 연동이 아직 설정되지 않았습니다 (src/lib/walkingRoute.ts의 fetchKakaoWalkingPath 참고).'
  );
}

function buildStraightLineRoundTrip(
  start: Coordinate,
  minutes: number,
  bearingDegrees: number
): RoundTripRoute {
  const totalDistanceMeters = metersFromMinutes(minutes);
  const oneWayDistanceMeters = totalDistanceMeters / 2;
  const turnaroundPoint = destinationPoint(
    start,
    oneWayDistanceMeters,
    bearingDegrees
  );

  return {
    path: [start, turnaroundPoint, start],
    oneWayDistanceMeters,
    isFallback: true,
  };
}

/**
 * 입력한 시간(분)에 맞는 왕복 산책 경로를 만든다.
 * 카카오 REST API 키가 있으면 실제 도보 경로(같은 길로 왕복)를 시도하고,
 * API 연동이 안 돼있거나 요청이 실패하면 직선 추정 경로로 대체한다.
 */
export async function generateRoundTripRoute(
  start: Coordinate,
  minutes: number,
  kakaoRestApiKey: string | undefined,
  bearingDegrees: number = 0
): Promise<RoundTripRoute> {
  const totalDistanceMeters = metersFromMinutes(minutes);
  const oneWayDistanceMeters = totalDistanceMeters / 2;
  const targetPoint = destinationPoint(
    start,
    oneWayDistanceMeters,
    bearingDegrees
  );

  if (!kakaoRestApiKey) {
    return buildStraightLineRoundTrip(start, minutes, bearingDegrees);
  }

  try {
    const outboundPath = await fetchKakaoWalkingPath(
      start,
      targetPoint,
      kakaoRestApiKey
    );
    const returnPath = [...outboundPath].reverse().slice(1);

    return {
      path: [...outboundPath, ...returnPath],
      oneWayDistanceMeters,
      isFallback: false,
    };
  } catch (error) {
    console.warn(
      '카카오 도보 경로 조회에 실패해서 직선 경로로 대체합니다:',
      error
    );
    return buildStraightLineRoundTrip(start, minutes, bearingDegrees);
  }
}
