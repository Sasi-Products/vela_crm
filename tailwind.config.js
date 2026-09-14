/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 14px 40px rgba(15, 23, 42, 0.08)",
        lift: "0 20px 50px rgba(30, 41, 59, 0.14)"
      }
    }
  },
  plugins: []
};
