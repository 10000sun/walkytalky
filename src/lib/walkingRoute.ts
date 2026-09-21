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

const KAKAO_WALKING_DIRECTIONS_URL = 'https://dapi.kakao.com/v2/routing/walk';

interface KakaoRoutingResponse {
  status: string;
  route?: {
    properties: {
      totalDistance: number;
      totalTime: number;
    };
    legs: {
      steps: {
        path: {
          points: [number, number][];
        };
      }[];
    }[];
  };
}

interface KakaoWalkingLeg {
  path: Coordinate[];
  distanceMeters: number;
  timeSeconds: number;
}

async function fetchKakaoWalkingLeg(
  origin: Coordinate,
  destination: Coordinate,
  restApiKey: string
): Promise<KakaoWalkingLeg> {
  const params = new URLSearchParams({
    start_x: String(origin.longitude),
    start_y: String(origin.latitude),
    end_x: String(destination.longitude),
    end_y: String(destination.latitude),
  });

  const response = await fetch(
    `${KAKAO_WALKING_DIRECTIONS_URL}?${params.toString()}`,
    {
      headers: {
        Authorization: `KakaoAK ${restApiKey}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`카카오 도보 경로 API 요청 실패: HTTP ${response.status}`);
  }

  const data: KakaoRoutingResponse = await response.json();

  if (data.status !== 'OK' || !data.route) {
    throw new Error(`카카오 도보 경로 API 응답 오류: ${data.status}`);
  }

  const path: Coordinate[] = data.route.legs.flatMap((leg) =>
    leg.steps.flatMap((step) =>
      step.path.points.map(([longitude, latitude]) => ({
        latitude,
        longitude,
      }))
    )
  );

  if (path.length === 0) {
    throw new Error('카카오 도보 경로 API 응답에 경로 좌표가 없습니다.');
  }

  return {
    path,
    distanceMeters: data.route.properties.totalDistance,
    timeSeconds: data.route.properties.totalTime,
  };
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
    const outboundLeg = await fetchKakaoWalkingLeg(
      start,
      targetPoint,
      kakaoRestApiKey
    );
    const returnPath = [...outboundLeg.path].reverse().slice(1);

    return {
      path: [...outboundLeg.path, ...returnPath],
      oneWayDistanceMeters: outboundLeg.distanceMeters,
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
