export const theme = {
  colors: {
    light: {
      background: '#F5F1E8', // paper-cream
      surface: '#FDFBF7',
      mantel: '#ece4d5',
      text: {
        primary: '#2C2C2C', // ink-black
        secondary: '#5A5A5A', // ink-light
      },
      border: 'rgba(90, 90, 90, 0.1)',
      overlay: 'rgba(18,18,18,0.10)',
    },
    dark: {
      background: '#1C1C1C', // charcoal
      surface: '#2A2A2A',
      mantel: '#434343',
      text: {
        primary: '#F5F1E8',
        secondary: '#F5F1E8',
      },
      border: 'rgba(245, 241, 232, 0.1)',
      overlay: 'rgba(245,241,232,0.08)',
    },
    accent: '#C41E3A', // hanko-red
  },

  typography: {
    fontFamily: {
      serif: 'serif', // replace with Expo font key if you load fonts
      sans: 'System',
      mono: 'monospace',
    },
    weights: {
      light: '300',
      regular: '400',
      medium: '500',
      bold: '700',
    } as const,
  },

  spacing: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    6: 24,
    8: 32,
    12: 48,
    16: 64,
  },

  radius: {
    sm: 2,
    md: 4,
    lg: 8,
    full: 9999,
  },

  shadows: {
    paper1: {
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 2 },
    },
    paper2: {
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
      },
      android: { elevation: 5 },
    },
    paper3: {
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 10 },
    },
    hover: {
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 12 },
      },
      android: { elevation: 14 },
    },
  },
};
