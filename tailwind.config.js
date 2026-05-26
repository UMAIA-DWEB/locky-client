/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f3f6fb',
          100: '#e6edf6',
          500: '#3b82c4',
          600: '#2c6aa8',
          700: '#1f4d7e',
        },
      },
    },
  },
  plugins: [],
};
