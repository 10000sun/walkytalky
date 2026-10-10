import mobileAds from 'react-native-google-mobile-ads';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';

export default function App() {
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    mobileAds().initialize();
  }, []);

  return (
    <SafeAreaProvider>
      {minutes === null ? (
        <HomeScreen onSubmit={setMinutes} />
      ) : (
        <MapScreen minutes={minutes} onBack={() => setMinutes(null)} />
      )}
    </SafeAreaProvider>
  );
}
