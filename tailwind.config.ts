import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Radio Milwaukee Brand Colors
        radiomke: {
          charcoal: {
            DEFAULT: "#1F2528",
            50: "#E5E6E7",
            100: "#D1D3D4",
            200: "#A9ACAE",
            300: "#818588",
            400: "#595E62",
            500: "#1F2528", // Main brand color
            600: "#191E20",
            700: "#131618",
            800: "#0D0F10",
            900: "#070708",
          },
          orange: {
            DEFAULT: "#F8971D",
            50: "#FEF5E7",
            100: "#FEECD0",
            200: "#FDD9A1",
            300: "#FBC671",
            400: "#FAB342",
            500: "#F8971D", // Main brand color
            600: "#D67A0A",
            700: "#A45E08",
            800: "#724205",
            900: "#402603",
          },
          cream: {
            DEFAULT: "#F7F1DB",
            50: "#FFFFFF",
            100: "#FFFFFF",
            200: "#FFFFFF",
            300: "#FEFDFB",
            400: "#FBF7EC",
            500: "#F7F1DB", // Main brand color
            600: "#EAD9A8",
            700: "#DDC175",
            800: "#D0A942",
            900: "#B38D23",
          },
          blue: {
            DEFAULT: "#32588E",
            50: "#E8EDF4",
            100: "#D7E1EC",
            200: "#B4C9DC",
            300: "#91B1CB",
            400: "#6E99BB",
            500: "#32588E", // Main brand color
            600: "#28466F",
            700: "#1E3450",
            800: "#142231",
            900: "#0A1012",
          },
        },
      },
    },
  },
  plugins: [],
};
export default config;
