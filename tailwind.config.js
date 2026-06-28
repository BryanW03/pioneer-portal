/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        pioneer: {
          purple: '#392B6F',
          'purple-light': '#5A4B9A',
          'purple-pale': '#EAE6F5',
          'purple-mid': '#7B6AAD',
          black: '#010101',
          gray: '#989898',
          'gray-light': '#F4F4F6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Georgia', 'serif'],
      },
      animation: {
        'slide-in': 'slideIn 0.5s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'pioneer-gradient': 'linear-gradient(135deg, #392B6F 0%, #5A4B9A 50%, #010101 100%)',
      },
    },
  },
  plugins: [],
}
