import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        
        'test-red': '#b91c1c',
        'theme-dark': '#020617',
        'theme-dark-secondary': '#1e293b',
        'theme-primary': {
          DEFAULT: '#8b5cf6', 
          light: '#a78bfa', 
          dark: '#7c3aed',   
        },
        'theme-secondary': {
          DEFAULT: '#3b82f6', 
          light: '#60a5fa', 
          dark: '#2563eb',   
        },
        'theme-success': {
          light: '#4ade80',
          dark: '#166534', 
        },
        'theme-error': {
            light: '#f87171', 
            dark: '#b91c1c',   
        }
      },
      boxShadow: {
        'theme-glow': '0 0 15px 0 rgba(139, 92, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
export default config