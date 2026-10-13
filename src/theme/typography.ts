export const typography = {
  hero: {
    hero32: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 32,
      lineHeight: 40,
      letterSpacing: 0,
    }
  },
  cardTitle: {
    title48: {
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 48,
      lineHeight: 100,
      letterSpacing: -2,
    },
    title32: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 32,
      lineHeight: 100,
      letterSpacing: -2,
    },
    title20: {
      fontFamily: 'PlayfairDisplay_600SemiBold',
      fontSize: 20,
      lineHeight: 28,
      letterSpacing: 0,
    },
  },
  section: {
    section24: {
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 24,
      lineHeight: 32,
      letterSpacing: 0,
    },
  },
  body: {
    large16: {
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
    },
    default14: {
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    }
  },
  interface: {
    button14: {
      fontFamily: 'PlusJakartaSans_600SemiBold',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
    label14: {
      fontFamily: 'PlusJakartaSans_500Medium',
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
    },
    label12: {
      fontFamily: 'PlusJakartaSans_400Regular',
      fontSize: 12,
      lineHeight: 16,
      // Note: Figma letter spacing was -2%. Converted below to standard numeric points.
      letterSpacing: -0.2, 
    },
    eyebrow11: {
      fontFamily: 'PlusJakartaSans_700Bold',
      fontSize: 11,
      lineHeight: 16,
      // Note: Figma letter spacing was 8%.
      letterSpacing: 0.8,
      textTransform: 'uppercase' as const,
    },
  },
} as const;
