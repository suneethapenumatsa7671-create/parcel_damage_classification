// Global design tokens shared across all screens

export const COLORS = {
  // Brand (Red & Dark gray matching the web app)
  primary: "#B01E23",        // deep red to match 'Parcel Damage' text
  primaryDark: "#87151A",
  primaryLight: "#FDEAEA",
  accent: "#333333",         // dark gray for accents like web app buttons
  accentLight: "#EFEFEF",

  // Backgrounds
  bg: "#FFFFFF",             // pure white light bg
  card: "#FFFFFF",           // white card bg
  cardBorder: "#EAEAEA",     // light border
  surface: "#F7F7F7",

  // Text
  textPrimary: "#333333",    // dark text
  textSecondary: "#666666",
  textMuted: "#999999",

  // Status
  success: "#27AE60",
  warning: "#F29C12",
  error: "#C0392B",
  info: "#2980B9",

  // Misc
  white: "#FFFFFF",
  transparent: "transparent",
};

export const FONTS = {
  regular: "System",
  medium: "System",
  bold: "System",
};

export const RADIUS = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const SHADOW = {
  card: {
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  button: {
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
};
