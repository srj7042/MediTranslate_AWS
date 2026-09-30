/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        aws: {
          orange: '#FF9900',
          navy: '#232F3E',
          dark: '#161E2D',
          blue: '#146EB4',
          bg: '#F7F8FA',
          border: '#D5DBDB',
          success: '#1D8102',
          warning: '#FFB000',
          danger: '#D13212',
          muted: '#EEF2F4',
          textMuted: '#5F6B7A'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Amazon Ember', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
