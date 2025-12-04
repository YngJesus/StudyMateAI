/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts,css,scss}'],
  theme: {
<<<<<<< HEAD
    extend: {
      colors: {
        // Ocean Blue Theme - Professional & Modern
        ocean: {
          50: '#e6f4f9', // Lightest - backgrounds
          100: '#cce9f3', // Very light
          200: '#99d3e7', // Light
          300: '#66bddb', // Medium light
          400: '#33a7cf', // Medium
          500: '#0891c3', // Primary - main brand color
          600: '#06749c', // Dark
          700: '#055775', // Darker
          800: '#033a4e', // Very dark
          900: '#021d27', // Darkest - text on light bg
        },
        navy: {
          50: '#e6f0ff',
          100: '#cce0ff',
          200: '#99c2ff',
          300: '#66a3ff',
          400: '#3385ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        ocean: '0 4px 6px -1px rgba(8, 145, 195, 0.1), 0 2px 4px -1px rgba(8, 145, 195, 0.06)',
        'ocean-lg':
          '0 10px 15px -3px rgba(8, 145, 195, 0.1), 0 4px 6px -2px rgba(8, 145, 195, 0.05)',
        'ocean-xl':
          '0 20px 25px -5px rgba(8, 145, 195, 0.1), 0 10px 10px -5px rgba(8, 145, 195, 0.04)',
      },
      backgroundImage: {
        'gradient-ocean': 'linear-gradient(135deg, #0891c3 0%, #0066ff 100%)',
        'gradient-ocean-dark': 'linear-gradient(135deg, #055775 0%, #002966 100%)',
      },
    },
=======
    extend: {},
>>>>>>> 00464d4ead25df3f8333cbe7d82ccf2e3ede44cc
  },
  plugins: [],
};
