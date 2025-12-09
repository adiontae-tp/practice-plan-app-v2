/**
 * Tailwind CSS Configuration for Web App
 *
 * Uses the shared branding preset from @ppa/ui for consistent
 * colors, typography, and design tokens across all apps.
 *
 * Note: This is a Tailwind v4 configuration that works alongside
 * the CSS-based config in globals.css
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    // Include shared UI package
    '../../ui/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('@ppa/ui/branding/tailwind.preset')],
};
