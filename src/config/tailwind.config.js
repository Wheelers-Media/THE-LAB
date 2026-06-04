/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        void: '#000000',
        midnight: '#0D0D12',
        edge: '#1E1E28',
        signal: '#FFFFFF',
        labBlue: '#0066FF',
        labCyan: '#00E5FF'
      },
      fontFamily: {
        heading: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'oled-blue': '0 0 20px rgba(0, 102, 255, 0.4)',
        'oled-cyan': '0 0 20px rgba(0, 229, 255, 0.3)',
      },
      screens: {
        '3xl': '1920px',
      }
    }
  },
  plugins: [],
}
