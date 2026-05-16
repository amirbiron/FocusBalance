/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // פלטה ראשית — מתוך docs/FocusBalance.md סעיף 6
        brand: {
          DEFAULT: '#6B46C1', // סגול עמוק - רוגע, מקצועיות
          50: '#F5F2FB',
          100: '#E8E0F5',
          200: '#CFBDEC',
          300: '#B299DD',
          400: '#9275CC',
          500: '#6B46C1',
          600: '#5938A0',
          700: '#472D80',
          800: '#36225F',
          900: '#241740',
        },
        accent: {
          DEFAULT: '#0D9488', // טורקיז - התקדמות, חיוב
          50: '#EFFBF9',
          100: '#D4F4F0',
          500: '#0D9488',
          600: '#0B7A70',
          700: '#08605A',
        },
        warm: {
          DEFAULT: '#EA580C', // כתום חם - פעולה (לא אדום!)
          50: '#FEF3EC',
          100: '#FCE0CC',
          500: '#EA580C',
          600: '#C2480A',
        },
        // מצבי "מעל יעד" — כתום-זהב, לא אדום
        warning: {
          50: '#FEF7E6',
          500: '#D97706',
          600: '#B45309',
        },
        surface: {
          DEFAULT: '#FDFBFF', // לבן שבור
          muted: '#F4F1F8', // אפור-סגול בהיר
        },
      },
      fontFamily: {
        sans: [
          'Heebo',
          'Assistant',
          'Rubik',
          'Noto Sans Hebrew',
          'system-ui',
          'sans-serif',
        ],
      },
      boxShadow: {
        'soft': '0 4px 16px -4px rgba(107, 70, 193, 0.12)',
        'soft-lg': '0 8px 32px -8px rgba(107, 70, 193, 0.18)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
