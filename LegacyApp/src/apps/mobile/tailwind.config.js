/**
 * Tailwind CSS Configuration for Mobile App
 *
 * Uses the shared branding preset from @ppa/ui for consistent
 * colors, typography, and design tokens across all apps.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{html,js,jsx,ts,tsx,mdx}',
    './components/**/*.{html,js,jsx,ts,tsx,mdx}',
    // Include shared UI package (exclude node_modules)
    '../../ui/!(node_modules)/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [
    require('nativewind/preset'),
    require('@ppa/ui/branding/tailwind.preset'),
  ],
  important: 'html',
};
