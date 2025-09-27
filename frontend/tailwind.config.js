/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#0B1220",
          900: "#0A0F1A",
          800: "#0F172A",
        },
        card: "#111827",
        border: "#1F2937",
        primary: "#2563EB",
      },
      boxShadow: {
        card: "0 6px 18px rgba(0,0,0,0.35)",
        glow: "0 6px 16px rgba(37, 99, 235, 0.4)",
      },
    },
  },
  plugins: [],
};
