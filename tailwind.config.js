

/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
      "./src/**/*.css"
  ],

    theme: {
        
    },
    plugins: [
      require('tailwind-scrollbar'),
    ],

    variants: {
      scrollbar: ['rounded']
    }
};
