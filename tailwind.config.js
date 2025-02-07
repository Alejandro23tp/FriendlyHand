/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}", // add this line
    "./node_modules/flowbite/**/*.js" // add this line
  ],
  theme: {
    extend: {
      colors: {
        primary: {"50":"#eff6ff","100":"#dbeafe","200":"#bfdbfe","300":"#93c5fd","400":"#60a5fa","500":"#3b82f6","600":"#2563eb","700":"#1d4ed8","800":"#1e40af","900":"#1e3a8a","950":"#172554"},
        "black-color": {
          "50": "#eaebeb",
          "100": "#d6d7d7",
          "200": "#adafae",
          "300": "#838886",
          "400": "#5a605d",
          "450": "#0b0b0b",
          "500": "#313835",
          "600": "#272d2a",
          "700": "#1d2220",
          "800": "#141615",
          "900": "#0a0b0b"
        },
        "celeste-color": {
          "50": "#e9f6f9",
          "100": "#d3eef2",
          "200": "#a8dde5",
          "300": "#7ccbd8",
          "400": "#51bacb",
          "500": "#25a9be",
          "600": "#1e8798",
          "700": "#166572",
          "800": "#0f444c",
          "900": "#072226"
        }
      },
      fontFamily: {
        'body': [
      'Inter', 
      'ui-sans-serif', 
      'system-ui', 
      '-apple-system', 
      'system-ui', 
      'Segoe UI', 
      'Roboto', 
      'Helvetica Neue', 
      'Arial', 
      'Noto Sans', 
      'sans-serif', 
      'Apple Color Emoji', 
      'Segoe UI Emoji', 
      'Segoe UI Symbol', 
      'Noto Color Emoji'
    ],
        'sans': [
      'Inter', 
      'ui-sans-serif', 
      'system-ui', 
      '-apple-system', 
      'system-ui', 
      'Segoe UI', 
      'Roboto', 
      'Helvetica Neue', 
      'Arial', 
      'Noto Sans', 
      'sans-serif', 
      'Apple Color Emoji', 
      'Segoe UI Emoji', 
      'Segoe UI Symbol', 
      'Noto Color Emoji'
    ]
      }
    },
  },
  plugins: [
    require('flowbite/plugin') // add this line
  ],
}

