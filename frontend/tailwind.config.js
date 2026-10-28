/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand Primary - Deep Navy
        navy: {
          50: "#F2F5F7",
          100: "#E6ECF0",
          200: "#C6D3DC",
          300: "#9FB3C3",
          400: "#6B89A3",
          500: "#3D6B8C",
          600: "#2C4F69",
          700: "#213B4E",
          800: "#172B3A", // Primary Brand Deep Navy
          900: "#11202B",
          950: "#0C161E",
          DEFAULT: "#172B3A",
        },
        // Brand Secondary - Forest Green
        forest: {
          50: "#F0F6F3",
          100: "#E4EFEA",
          200: "#C3DCD0",
          300: "#97C2B0",
          400: "#6FA590",
          500: "#519479",
          600: "#407761",
          700: "#315C4B", // Primary Forest Green
          800: "#254538",
          900: "#193027",
          DEFAULT: "#315C4B",
        },
        // Brand Accent - Muted Gold
        gold: {
          50: "#FAF5EB",
          100: "#F7EEDB",
          200: "#EEDBB8",
          300: "#E5C793",
          400: "#DFC08E",
          500: "#D5AD72", // Primary Muted Gold
          600: "#BA9459",
          700: "#9E7E4B",
          800: "#7A6137",
          900: "#544222",
          DEFAULT: "#D5AD72",
        },
        // Brand Surface - Warm Ivory
        ivory: {
          50: "#FDFCFB",
          100: "#F7F5F0", // Primary Warm Ivory Background
          200: "#EDE8DE",
          300: "#DCD4C4",
          400: "#C7BCA8",
          500: "#B0A28B",
          DEFAULT: "#F7F5F0",
        },
        // Semantic Token Mapping for High-Contrast Accessibility
        brand: {
          navy: "#172B3A",
          forest: "#315C4B",
          ivory: "#F7F5F0",
          gold: "#D5AD72",
          surface: "#FFFFFF",
          textMain: "#24313A",
          textSecondary: "#596873",
          textDark: "#FFFFFF",
          textDarkMuted: "#D5DDE2",
          borderLight: "#DCE2E5",
        },
      },
      fontFamily: {
        heading: ["Manrope", "sans-serif"],
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 1px 3px 0 rgba(23, 43, 58, 0.06), 0 1px 2px -1px rgba(23, 43, 58, 0.04)",
        card: "0 4px 14px 0 rgba(23, 43, 58, 0.07)",
        dropdown: "0 10px 25px -5px rgba(23, 43, 58, 0.1), 0 8px 10px -6px rgba(23, 43, 58, 0.08)",
        elevated: "0 20px 35px -10px rgba(23, 43, 58, 0.15)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
    },
  },
  plugins: [],
};