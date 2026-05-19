// Auto-generated from tokens.json — Nexti Design System
// Single source of truth for design tokens.
// Components should consume via Tailwind classes or CSS vars; only use this for runtime/JS contexts (charts, animations).

export const tokens = {
  "color": {
    "orange": {
      "50": "#FFF2EC",
      "100": "#FFDDCB",
      "200": "#FFBA99",
      "300": "#FF9266",
      "400": "#F87344",
      "500": "#F05B24",
      "600": "#D84B18",
      "700": "#B23A10",
      "800": "#812908",
      "900": "#4D1704"
    },
    "navy": {
      "50": "#EEF1F6",
      "100": "#D3DAE6",
      "200": "#A5B1C7",
      "300": "#6E7E9B",
      "400": "#3F4F6D",
      "500": "#1F2D47",
      "600": "#15213A",
      "700": "#0F1A30",
      "800": "#0A1124",
      "900": "#060A17"
    },
    "ink": {
      "0": "#FFFFFF",
      "50": "#F8F9FB",
      "100": "#F1F3F7",
      "200": "#E4E7EE",
      "300": "#CBD1DC",
      "400": "#9AA2B2",
      "500": "#6B7284",
      "600": "#4A5060",
      "700": "#2F3442",
      "800": "#1A1D28",
      "900": "#0F111A"
    },
    "white": "#FFFFFF",
    "success": "#2DB47A",
    "successBg": "#E4F6EE",
    "warning": "#F5A524",
    "warningBg": "#FEF4E1",
    "danger": "#E5484D",
    "dangerBg": "#FCE8E9",
    "info": "#3B82C4",
    "infoBg": "#E4EFF8",
    "series": [
      "#F05B24",
      "#3B82C4",
      "#2DB47A",
      "#9C5BD0",
      "#F5A524",
      "#0F1A30",
      "#E5484D",
      "#6B7284"
    ]
  },
  "semantic": {
    "bg": "var(--nx-white)",
    "bgSubtle": "var(--nx-ink-50)",
    "bgMuted": "var(--nx-ink-100)",
    "bgInverse": "var(--nx-navy-700)",
    "fg": "var(--nx-ink-800)",
    "fgStrong": "var(--nx-navy-700)",
    "fgMuted": "var(--nx-ink-500)",
    "fgSubtle": "var(--nx-ink-400)",
    "fgOnbrand": "var(--nx-white)",
    "fgBrand": "var(--nx-orange-500)",
    "border": "var(--nx-ink-200)",
    "borderStrong": "var(--nx-ink-300)",
    "borderBrand": "var(--nx-orange-500)"
  },
  "typography": {
    "fontSans": "'Nunito', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    "fontDisplay": "'Nunito', system-ui, sans-serif",
    "fontMono": "ui-monospace, 'Menlo', monospace",
    "sizes": {
      "xs": "12px",
      "sm": "14px",
      "base": "16px",
      "md": "18px",
      "lg": "20px",
      "xl": "24px",
      "2xl": "30px",
      "3xl": "38px",
      "4xl": "48px",
      "5xl": "60px",
      "6xl": "76px"
    },
    "lineHeights": {
      "tight": 1.12,
      "snug": 1.28,
      "normal": 1.5,
      "relaxed": 1.65
    },
    "weights": {
      "light": 300,
      "regular": 400,
      "semi": 600,
      "bold": 700,
      "xbold": 800,
      "black": 900
    }
  },
  "radius": {
    "sm": "6px",
    "md": "10px",
    "lg": "16px",
    "xl": "24px",
    "2xl": "32px",
    "pill": "999px"
  },
  "shadow": {
    "xs": "0 1px 2px rgba(15, 26, 48, 0.06)",
    "sm": "0 2px 4px rgba(15, 26, 48, 0.06), 0 1px 2px rgba(15, 26, 48, 0.04)",
    "md": "0 6px 16px rgba(15, 26, 48, 0.08), 0 2px 4px rgba(15, 26, 48, 0.04)",
    "lg": "0 16px 32px rgba(15, 26, 48, 0.10), 0 4px 8px rgba(15, 26, 48, 0.04)",
    "xl": "0 28px 56px rgba(15, 26, 48, 0.12)",
    "brand": "0 12px 28px rgba(240, 91, 36, 0.28)"
  },
  "spacing": {
    "1": "4px",
    "2": "8px",
    "3": "12px",
    "4": "16px",
    "5": "20px",
    "6": "24px",
    "8": "32px",
    "10": "40px",
    "12": "48px",
    "16": "64px",
    "20": "80px",
    "24": "96px"
  },
  "motion": {
    "ease": "cubic-bezier(0.22, 0.61, 0.36, 1)",
    "easeOut": "cubic-bezier(0.16, 1, 0.3, 1)",
    "durFast": "120ms",
    "dur": "200ms",
    "durSlow": "360ms"
  }
} as const;

export type ColorScale = keyof typeof tokens.color.orange;
export type Tokens = typeof tokens;
