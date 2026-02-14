// tailwind.config.js

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: '#1a202c',
      },
    },
  },
  plugins: [
    require(' @tailwindcss/forms'),
    require(' @tailwindcss/typography'),
    require(' @tailwindcss/aspect-ratio'),
  ],
};