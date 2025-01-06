import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',

    '../../packages/app/**/*',
    '../../packages/pages/**/*',
    '../../packages/widgets/**/*',
    '../../packages/features/**/*',
    '../../packages/entities/**/*',
    '../../packages/shared/**/*',
  ],
  corePlugins: {
    preflight: true,
  },
  theme: {
    screens: {
      xs: { max: '640px' },
      sm: { min: '641px', max: '1024px' },
      md: { min: '1025px', max: '1366px' },
      lg: { min: '1367px' },
    },
    extend: {
      colors: {
        primary: {
          light: '#6d28d9',
          DEFAULT: '#5b21b6',
        },
        secondary: {
          light: '#38bdf8',
          DEFAULT: '#0ea5e9',
        },
        neutral: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
      },
      spacing: {
        '72': '18rem',
        '84': '21rem',
        '96': '24rem',
      },
      maxWidth: {
        '8xl': '90rem',
      },
      minHeight: {
        'screen-75': '75vh',
      },
      transitionDuration: {
        750: '750ms',
        1000: '1000ms',
        1500: '1500ms',
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'translateX(0%)' },
          '15%': { transform: 'translateX(-25%) rotate(-5deg)' },
          '30%': { transform: 'translateX(20%) rotate(3deg)' },
          '45%': { transform: 'translateX(-15%) rotate(-3deg)' },
          '60%': { transform: 'translateX(10%) rotate(2deg)' },
          '75%': { transform: 'translateX(-5%) rotate(-1deg)' },
        },
      },
      fontSize: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '5': '1.25rem',
        '6': '1.5rem',
        '7': '1.75rem',
        '8': '2rem',
        '9': '2.25rem',
        '10': '2.5rem',
        '11': '2.75rem',
        '12': '3rem',
      },
      fontFamily: {
        'helvetica-neue': ['"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
};

export default config;
