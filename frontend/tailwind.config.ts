import type { Config } from 'tailwindcss';

const config: Config = {
    content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        extend: {
            colors: {
                sat: {
                    bg: '#09090b',
                    surface: '#111113',
                    card: '#18181b',
                    'card-hover': '#1f1f23',
                    border: '#27272a',
                    'border-light': '#3f3f46',
                    text: '#fafafa',
                    'text-secondary': '#a1a1aa',
                    'text-muted': '#71717a',
                    blue: '#3b82f6',
                    'blue-hover': '#2563eb',
                    orange: '#f7931a',
                    green: '#22c55e',
                    red: '#ef4444',
                    purple: '#a855f7',
                    sidebar: '#0f0f11',
                },
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
                mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'monospace'],
            },
        },
    },
    plugins: [],
};

export default config;
