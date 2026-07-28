/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*.{js,jsx,ts,tsx}","./App.tsx", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Sky blue — primary brand / calm & trustworthy
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },
        // Sunshine yellow — playful accent for kid-friendly CTAs/highlights
        secondary: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
        // Mint green — success / positive status
        mint: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        // Soft coral — warm alerts, softer than pure red
        coral: {
          50: "#fff1f2",
          100: "#ffe4e6",
          200: "#fecdd3",
          300: "#fda4af",
          400: "#fb7185",
          500: "#f43f5e",
          600: "#e11d48",
        },
        // Warm cream — friendly off-white backgrounds
        cream: {
          50: "#fffdf9",
          100: "#fef9f0",
          200: "#fdf3e0",
        },
      },
      fontFamily: {
        heading: ["Baloo2_700Bold"],
        "heading-semibold": ["Baloo2_600SemiBold"],
        "heading-medium": ["Baloo2_500Medium"],
        body: ["Nunito_400Regular"],
        "body-semibold": ["Nunito_600SemiBold"],
        "body-bold": ["Nunito_700Bold"],
        "body-extrabold": ["Nunito_800ExtraBold"],
      },
    },
  },
  plugins: [],
}