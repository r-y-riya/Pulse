/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F8FBFF',
        surface: {
          DEFAULT: '#FFFFFF',
          hover: '#F1F7FF',
          light: '#F8FBFF',
        },
        primary: {
          DEFAULT: '#5CB8FF',
          hover: '#42A8FF',
          light: 'rgba(92, 184, 255, 0.08)',
        },
        secondary: {
          DEFAULT: '#8FD3FF',
          hover: '#79C7FF',
        },
        mint: '#8CE6C9',
        lavender: '#B7B5FF',
        peach: '#FFD6A5',
        pink: '#FFC7D9',
        warning: '#FFD166',
        danger: '#FF7A7A',
        success: '#6DDCCF',
        border: {
          DEFAULT: '#E5EEF7',
        },
        text: {
          heading: '#1F2937',
          body: '#4B5563',
          muted: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(148, 163, 184, 0.08)',
      },
      backdropBlur: {
        'xs': '2px',
      }
    },
  },
  plugins: [],
}
