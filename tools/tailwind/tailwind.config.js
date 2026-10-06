// Same theme the pages used to define inline for the Tailwind CDN script (superset of the per-page copies).
// Rebuild after adding Tailwind classes to any page or script:  cd tools/tailwind && npm run build
module.exports = {
  content: ['../../src/pages/**/*.html', '../../src/components/*.html', '../../src/assets/js/**/*.js'],
  theme: {
    extend: {
      colors: { void: '#000000', midnight: '#0D0D12', edge: '#1E1E28', signal: '#FFFFFF', labBlue: '#0066FF', labCyan: '#00E5FF' },
      fontFamily: { heading: ['Barlow Condensed', 'sans-serif'], body: ['Barlow', 'sans-serif'] },
      boxShadow: { 'oled-blue': '0 0 20px rgba(0, 102, 255, 0.4)', 'oled-cyan': '0 0 20px rgba(0, 229, 255, 0.3)' },
    },
  },
};
