import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        band: {
          50: '#f5f7fa',
          100: '#e4e7eb',
          200: '#cbd2d9',
          300: '#9aa5b1',
          400: '#616e7c',
          500: '#3e4c59',
          600: '#323f4b',
          700: '#1f2933',
          800: '#121a24',
          900: '#0b1017',
          accent: '#f59e0b',
          electric: '#3b82f6',
          jan: '#3b82f6',
          tom: '#10b981',
        },
      },
    },
  },
  plugins: [],
};
export default config;
