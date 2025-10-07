module.exports = {
  content: [
    "./src/html/**/*.{html,js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(function({ addUtilities }) {
      addUtilities({
        // This is your custom utility class
        '.slide-out-left': { 
          transform: 'translateX(-100%)',
          opacity: '0',
          transition: 'transform 0.5s ease, opacity 0.5s ease',
        }
      })
    })
  ],
};
