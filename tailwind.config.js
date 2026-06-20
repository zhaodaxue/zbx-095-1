/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
      },
    },
    extend: {
      colors: {
        forest: {
          50: '#f0f7f4',
          100: '#dcebe2',
          200: '#b9d7c6',
          300: '#8cbc9f',
          400: '#5e9c79',
          500: '#3d7f5c',
          600: '#2D6A4F',
          700: '#255540',
          800: '#1f4434',
          900: '#1a382b',
        },
        cream: {
          50: '#FEFAE0',
          100: '#fdf6cc',
          200: '#faec99',
          300: '#f7de5c',
        },
        amber: {
          400: '#E9C46A',
        },
        danger: {
          500: '#E63946',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(45, 106, 79, 0.08), 0 1px 3px rgba(45, 106, 79, 0.06)',
        'soft-hover': '0 8px 24px rgba(45, 106, 79, 0.12), 0 2px 6px rgba(45, 106, 79, 0.08)',
      },
      animation: {
        'bounce-subtle': 'bounce-subtle 0.5s ease-in-out',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
      },
      keyframes: {
        'bounce-subtle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-down': {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
