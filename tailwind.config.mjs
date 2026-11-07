/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				// Brand navy — the club's core colour (logo, kit)
				primary: '#002b3a',
				'primary-light': '#003C52',
				ink: {
					DEFAULT: '#002b3a',
					900: '#00161f',
					800: '#001f2b',
					700: '#002b3a',
					600: '#0b3d4f',
					500: '#2a5566',
					400: '#56778a',
				},
				// Jersey blue from the 2025 club kit
				kit: '#1e5078',
				// Warm off-white used for content surfaces
				paper: {
					DEFAULT: '#f4f2ec',
					50: '#fbfaf7',
					100: '#f4f2ec',
					200: '#e8e4da',
					300: '#d6d0c2',
				},
				// Hi-vis accent — think safety vests & bar tape
				signal: {
					DEFAULT: '#d4ff3f',
					600: '#b8e61e',
				},
				secondary: '#B6B8B9',
				steel: '#B6B8B9',
				accent: '#000000',
				light: '#ffffff',
				text: '#000000',
			},
			fontFamily: {
				sans: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				display: ['Archivo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			letterSpacing: {
				tightest: '-0.04em',
			},
			maxWidth: {
				site: '84rem',
			},
		},
	},
	plugins: [],
}
