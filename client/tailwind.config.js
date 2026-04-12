/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        shell: {
          sidebar: '#111827',
          header: '#0f172a',
          background: '#f8fafc'
        }
      }
    }
  },
  plugins: []
};
