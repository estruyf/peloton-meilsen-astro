/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#342c3b',
				'primary-light': '#463d50',
				'primary-dark': '#221d26',
				accent: '#ddcca8',
			},
		},
	},
	plugins: [],
}
