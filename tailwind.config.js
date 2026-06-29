/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-page)",
        surface: {
          DEFAULT: "var(--card-bg)",
          solid: "var(--surface-solid)",
          hover: "var(--surface-hover)",
          border: "var(--surface-border)",
          glow: "rgba(var(--accent-rgb), 0.08)",
        },
        primary: {
          DEFAULT: "#8B5CF6", // Primary Purple
          hover: "#A855F7",
          neon: "#F97316", // Neon Orange
        },
        secondary: {
          DEFAULT: "#181818", // Elevated Surface
          hover: "#222222",
        },
        accent: {
          purple: "#8B5CF6",
          purpleSecondary: "#A855F7",
          orange: "#F97316",
          cyan: "#22D3EE",
          emerald: "#10B981",
          warning: "#F59E0B",
          danger: "#EF4444",
        }
      },
      fontFamily: {
        sans: ["Inter", "SF Pro Display", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      boxShadow: {
        'glass': '0 10px 40px rgba(0, 0, 0, 0.5)',
        'glass-glowing': '0 8px 32px 0 rgba(139, 92, 246, 0.08), 0 0 15px 0 rgba(139, 92, 246, 0.15)',
        'neon-purple': '0 0 30px rgba(139, 92, 246, 0.35)',
        'neon-orange': '0 0 30px rgba(249, 115, 22, 0.35)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
