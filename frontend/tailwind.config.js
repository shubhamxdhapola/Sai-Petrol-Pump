export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
      },
      colors: {
        ink: '#050b3f',
        muted: '#44517c',
        brand: '#0068ff',
      },
      boxShadow: {
        panel: '0 8px 28px rgba(10, 28, 80, 0.08)',
      },
    },
  },
  plugins: [],
};
