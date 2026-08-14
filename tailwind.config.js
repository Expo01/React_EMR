/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // all React/TS components in /src
  ],

  theme: {
    extend: {
      colors: {
        'emr-background': '#DCE7E7',
        'emr-surface': '#F4F8F8',
        'emr-primary': '#0F777A',
        'emr-primary-hover': '#0A6264',
        'emr-nav': '#B9D0D0',
        'emr-nav-hover': '#A8C4C4',
        'emr-border': '#97B5B5',
        'emr-text': '#183234',
        'emr-text-secondary': '#536C6E',
        'emr-row-hover': '#C9E0E0',
        'emr-error': '#AD4E4E',
      },
    },
  },

  plugins: [],
};
