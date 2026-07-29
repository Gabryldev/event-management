/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#14213D',
          light: '#1F2E52',
          dark: '#0C1529',
        },
        paper: '#FBF9F5',
        amber: {
          DEFAULT: '#F2A93B',
          dark: '#D98F1F',
        },
        slate: {
          muted: '#5C6470',
        },
        success: '#2F855A',
        danger: '#C0392B',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        perforation:
          'radial-gradient(circle, transparent 0, transparent 3px, #FBF9F5 3.5px)',
      },
    },
  },
  plugins: [],
};
