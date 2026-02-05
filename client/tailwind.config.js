/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['"DM Sans"', 'sans-serif'],
            },
            colors: {
                brand: {
                    DEFAULT: '#6366F1',
                    hover: '#4F46E5',
                },
                'page-bg': '#FFF9F0',
                'text-primary': '#1E293B',
                'text-secondary': '#64748B',
                'border-main': '#000000',
                'accent-yellow': '#FCD34D',
                'accent-pink': '#EC4899',
            },
            boxShadow: {
                'neo': '1px 1px 0px 0px rgba(0, 0, 0, 1)',
                'neo-hover': '2px 2px 0px 0px rgba(0, 0, 0, 1)',
            },
        },
    },
    plugins: [],
}
