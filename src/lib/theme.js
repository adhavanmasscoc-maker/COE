/**
 * Aknex COE Examination Portal - Central Design Tokens & Theme Specification
 * WCAG AA Compliant · Mobile-First · Touch-Friendly
 */

export const themeTokens = {
  colors: {
    // Dark Theme (Default)
    dark: {
      background: "#0d0d1a",
      surface: "#12122a",
      elevated: "#1a1a38",
      overlay: "rgba(18, 18, 42, 0.85)",
      foreground: "#f0f0ff",
      foregroundSecondary: "#a8a8d0",
      foregroundMuted: "#7a7aa8", // Elevated for WCAG AA 4.5:1 ratio against #0d0d1a
      border: "rgba(124, 58, 237, 0.25)",
      borderSubtle: "rgba(124, 58, 237, 0.14)",
      borderStrong: "rgba(167, 139, 250, 0.45)",
      primary: "#7c3aed",
      primaryHover: "#6d28d9",
      accentCyan: "#06b6d4",
      accentEmerald: "#10b981",
      accentAmber: "#f59e0b",
      accentRose: "#f43f5e",
    },
    // Warm Slate Light Theme (Eye-friendly, no harsh white)
    light: {
      background: "#EDEAE3",
      surface: "#F5F3ED",
      elevated: "#FFFFFF",
      overlay: "rgba(237, 234, 227, 0.92)",
      foreground: "#1c1917",
      foregroundSecondary: "#44403c",
      foregroundMuted: "#57534e", // Meets WCAG AA against #EDEAE3
      border: "#D6D1C4",
      borderSubtle: "#E4E0D7",
      borderStrong: "#A8A29E",
      primary: "#4f46e5",
      primaryHover: "#4338ca",
      accentCyan: "#0891b2",
      accentEmerald: "#059669",
      accentAmber: "#d97706",
      accentRose: "#e11d48",
    },
  },
  typography: {
    fontSans: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontTamil: '"Noto Sans Tamil", system-ui, sans-serif',
    fontMono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  radii: {
    sm: "0.375rem",  // 6px
    md: "0.5rem",    // 8px
    lg: "0.75rem",   // 12px
    xl: "1rem",      // 16px
    full: "9999px",
  },
  touchTarget: {
    minSize: "44px", // Minimum touch target per Apple HIG & Material Design
  },
  breakpoints: {
    xs: "360px",
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
};

export default themeTokens;
