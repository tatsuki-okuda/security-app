import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'SFMono-Regular', 'SFMono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 20px 60px -25px rgba(15, 23, 42, 0.25)',
      },
      backdropBlur: {
        12: '12px',
      },
    },
  },
  plugins: [],
};

export default config;
