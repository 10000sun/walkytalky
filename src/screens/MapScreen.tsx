import {
  NaverMapMarkerOverlay,
  NaverMapPathOverlay,
  NaverMapView,
} from '@mj-studio/react-native-naver-map';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  generateRoundTripRoute,
  type Coordinate,
  type RoundTripRoute,
} from '../lib/walkingRoute';

const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

interface Props {
  minutes: number;
  onBack: () => void;
}

export default function MapScreen({ minutes, onBack }: Props) {
  const [start, setStart] = useState<Coordinate | null>(null);
  const [route, setRoute] = useState<RoundTripRoute | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('산책로를 찾으려면 위치 권한이 필요해요.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setStart({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    if (!start) return;
    generateRoundTripRoute(start, minutes, KAKAO_REST_API_KEY).then(setRoute);
  }, [start, minutes]);

  if (errorMessage) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>다시 입력하기</Text>
        </Pressable>
      </View>
    );
  }

  if (!start || !route) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>왕복 산책로를 계산하는 중...</Text>
      </View>
    );
  }

  const turnaround = route.path[Math.floor(route.path.length / 2)]!;

  return (
    <View style={styles.container}>
      <NaverMapView
        style={styles.map}
        camera={{ latitude: start.latitude, longitude: start.longitude, zoom: 15 }}
      >
        <NaverMapPathOverlay coords={route.path} width={6} color="#2E7D32" />
        <NaverMapMarkerOverlay
          latitude={start.latitude}
          longitude={start.longitude}
          caption={{ text: '출발/도착' }}
        />
        <NaverMapMarkerOverlay
          latitude={turnaround.latitude}
          longitude={turnaround.longitude}
          caption={{ text: '반환점' }}
        />
      </NaverMapView>

      <View style={styles.summary}>
        {route.isFallback && (
          <Text style={styles.fallbackNotice}>
            실제 도보 경로를 불러오지 못해 직선 거리로 추정한 경로예요.
          </Text>
        )}
        <Text style={styles.summaryText}>
          {minutes}분 왕복 · 편도 약 {Math.round(route.oneWayDistanceMeters)}m
        </Text>
        <Pressable style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>다시 입력하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#555',
  },
  errorText: {
    fontSize: 16,
    color: '#c62828',
    textAlign: 'center',
    marginBottom: 16,
  },
  summary: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
    gap: 8,
  },
  fallbackNotice: {
    fontSize: 13,
    color: '#b26a00',
  },
  summaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 999,
    marginTop: 4,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
