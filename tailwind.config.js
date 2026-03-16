/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        accent: "var(--accent)",
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "code-bg": "var(--code-bg)",
        "sidebar-bg": "var(--sidebar-bg)",
        "card-bg": "var(--card-bg)",
        "input-bg": "var(--input-bg)",
        "tag-bg": "var(--tag-bg)",
        "border-color": "var(--border-color)",
        "hover-bg": "var(--hover-bg)",
        danger: "var(--danger)",
        success: "var(--success)",
        warning: "var(--warning)",
      },
      backgroundColor: {
        primary: "var(--bg-primary)",
        secondary: "var(--bg-secondary)",
        sidebar: "var(--sidebar-bg)",
        card: "var(--card-bg)",
        input: "var(--input-bg)",
        hover: "var(--hover-bg)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
      },
      borderColor: {
        DEFAULT: "var(--border-color)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
