import { Stack } from 'expo-router';
import { Platform, View, Text, TouchableOpacity, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { 
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold 
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_600SemiBold,
  PlayfairDisplay_700Bold
} from '@expo-google-fonts/playfair-display';

import { useState } from 'react';
import { ResponsiveDimensionsProvider } from '@/context/ResponsiveDimensionsContext';

const PRESET_DEVICES = [
  { id: '320', label: 'Compact 320', width: 320, height: 568 },
  { id: '360', label: 'Compact 360', width: 360, height: 640 },
  { id: '375', label: 'Standard 375', width: 375, height: 667 },
  { id: '393', label: 'Standard 393', width: 393, height: 852 },
  { id: '430', label: 'Large 430', width: 430, height: 932 },
  { id: 'short', label: 'Short 375×500', width: 375, height: 500 },
];

const WebPhoneWrapper = ({ children }: { children: React.ReactNode }) => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [selectedDevice, setSelectedDevice] = useState(PRESET_DEVICES[3]); // Default iPhone 17 (393pt)

  if (Platform.OS !== 'web' || windowWidth < 460 || windowHeight < 550) {
    return (
      <ResponsiveDimensionsProvider value={{ width: windowWidth, height: windowHeight }}>
        <View style={{ flex: 1, width: '100%', height: '100%' }}>{children}</View>
      </ResponsiveDimensionsProvider>
    );
  }

  const casingWidth = selectedDevice.width + 24;
  const casingHeight = Math.min(selectedDevice.height + 24, windowHeight - 90);

  return (
    <View style={styles.webContainer}>
      {/* Device Viewport Switcher Toolbar */}
      <View style={styles.deviceToolbar}>
        {PRESET_DEVICES.map(dev => {
          const isActive = selectedDevice.id === dev.id;
          return (
            <TouchableOpacity
              key={dev.id}
              style={[styles.devicePill, isActive && styles.devicePillActive]}
              onPress={() => setSelectedDevice(dev)}
              activeOpacity={0.8}
            >
              <Text style={[styles.devicePillText, isActive && styles.devicePillTextActive]}>
                {dev.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Outer Phone Casing */}
      <View style={[styles.phoneCasing, { width: casingWidth, height: casingHeight }]}>
        {/* Inner Black Bezel */}
        <View style={styles.phoneBezel}>
          {/* Dynamic Island (only for modern tall devices with dynamic island) */}
          {selectedDevice.height >= 800 && <View style={styles.dynamicIsland} />}
          {/* Actual App Screen Content */}
          <View style={styles.screenContent}>
            <ResponsiveDimensionsProvider value={{ width: selectedDevice.width, height: selectedDevice.height }}>
              {children}
            </ResponsiveDimensionsProvider>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_600SemiBold,
    PlayfairDisplay_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Or a splash screen
  }

  return (
    <SafeAreaProvider>
      <WebPhoneWrapper>
        <Stack screenOptions={{ headerShown: false }} />
      </WebPhoneWrapper>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    backgroundColor: '#EBEBF0', // Light gray background to contrast with the phone
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  phoneCasing: {
    width: 393 + 28, // Standard iPhone width + 14px bezel on each side
    height: 852 + 28, // Standard iPhone height + bezel
    backgroundColor: '#E1D4E5', // Beautiful iPhone 17 Lavender finish
    borderRadius: 55, 
    padding: 3, // Metallic rim thickness
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 20, // For android web
  },
  phoneBezel: {
    flex: 1,
    backgroundColor: '#111', // Deep black bezel
    borderRadius: 52, // Inner corner radius
    padding: 12, // Bezel thickness
    alignItems: 'center',
  },
  dynamicIsland: {
    position: 'absolute',
    top: 20,
    width: 110,
    height: 28,
    backgroundColor: '#000',
    borderRadius: 14,
    zIndex: 100,
  },
  screenContent: {
    flex: 1,
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 40, // Screen corners
    overflow: 'hidden', // Clips the app content to the rounded corners
  },
  deviceToolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  devicePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#D8D8E0',
  },
  devicePillActive: {
    backgroundColor: '#259E56',
    borderColor: '#259E56',
  },
  devicePillText: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    color: '#555',
  },
  devicePillTextActive: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#FFF',
  },
});
