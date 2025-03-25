/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#CE3246",
          light: "#F15B6F",
          dark: "#CC1028",
          "rose-soft": "#f9e6e8",
        },
        secondary: {
          DEFAULT: "#32CF52",
          light: "#7BD78D",
          dark: "#13C236",
        },
        white: {
          DEFAULT: "#FFF8F8",
          light: "#FFFDFD",
          dark: "#FBEBED",
        },
        black: {
          DEFAULT: "#211415",
          light: "#251E1F",
          dark: "#140406",
        },
        gray: {
          100: "#F3F3F3",
          200: "#E5E5E5",
          300: "#D9D6D6",
          400: "#CECECE",
          500: "#B1AFAF",
          600: "#9D9797",
          700: "#766E6E",
        },
      },
      fontSize: {
        title1: ["72px", { lineHeight: "110%", fontWeight: "600" }],
        title2: ["48px", { lineHeight: "110%", fontWeight: "600" }],
        title3: ["32px", { lineHeight: "110%", fontWeight: "600" }],
        title4: ["24px", { lineHeight: "110%", fontWeight: "600" }],
        title5: ["20px", { lineHeight: "110%", fontWeight: "600" }],
        title6: ["18px", { lineHeight: "110%", fontWeight: "600" }],
        text1: ["24px", { lineHeight: "130%", fontWeight: "400" }], // Regular
        text2: ["20px", { lineHeight: "130%" }], // Regular & Medium
        text3: ["18px", { lineHeight: "130%", fontWeight: "400" }], // Regular
        text4: ["16px", { lineHeight: "130%", fontWeight: "400" }], // Regular
        text5: ["14px", { lineHeight: "130%", fontWeight: "400" }], // Regular
        text6: ["12px", { lineHeight: "130%", fontWeight: "400" }], // Regular
      },
    },
  },
  plugins: [],
};
