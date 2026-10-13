export const effects = {
  elevation: {
    card: {
      shadowColor: '#1A1A1A',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08, // Translated from #1A1A1A14
      shadowRadius: 10,
      elevation: 4, // Android equivalent
    }
  },
  blur: {
    // Note: Background/Foreground blur effects are tricky in pure React Native.
    // Expo provides 'expo-glass-effect' or BlurView for background blurs.
    // These constants can be passed to those components as radii/intensities.
    backdropBlur: {
      type: 'BACKGROUND_BLUR',
      radius: 16,
    },
    foregroundBlur: {
      type: 'FOREGROUND_BLUR',
      radius: 8,
    }
  }
} as const;
