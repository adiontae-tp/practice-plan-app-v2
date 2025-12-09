/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../ui/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('@ppa/ui/branding/tailwind.preset')],
  theme: {
    extend: {
      // Framework7 specific overrides if needed
    },
  },
  plugins: [],
};
