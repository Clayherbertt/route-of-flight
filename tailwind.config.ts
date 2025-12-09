import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				aviation: {
					blue: 'hsl(var(--aviation-blue))',
					sky: 'hsl(var(--aviation-sky))',
					navy: 'hsl(var(--aviation-navy))',
					light: 'hsl(var(--aviation-light))',
					// Figma homepage primary color variants
					primary: 'rgb(10, 46, 118)',
					'primary-70': 'rgba(10, 46, 118, 0.7)',
					'primary-50': 'rgba(10, 46, 118, 0.5)',
					'primary-20': 'rgba(10, 46, 118, 0.2)',
					'primary-15': 'rgba(10, 46, 118, 0.15)',
					'primary-10': 'rgba(10, 46, 118, 0.1)',
					'primary-8': 'rgba(10, 46, 118, 0.08)',
					'primary-5': 'rgba(10, 46, 118, 0.05)',
					'primary-2': 'rgba(10, 46, 118, 0.02)'
				}
			},
			backgroundImage: {
				'aviation-gradient': 'var(--gradient-aviation)',
				'sky-gradient': 'var(--gradient-sky)',
				'subtle-gradient': 'var(--gradient-subtle)',
				// Figma homepage gradients
				'figma-primary': 'linear-gradient(to right, rgb(10, 46, 118), rgba(10, 46, 118, 0.7))',
				'figma-primary-soft': 'linear-gradient(to bottom right, rgba(10, 46, 118, 0.05), rgba(10, 46, 118, 0.1))',
				'figma-white-to-slate': 'linear-gradient(to bottom, white, rgb(248, 250, 252))',
				'figma-slate-to-white': 'linear-gradient(to bottom, rgb(248, 250, 252), white)'
			},
			boxShadow: {
				'aviation': 'var(--shadow-aviation)',
				'card-hover': 'var(--shadow-card)'
			},
			fontFamily: {
				sans: ['Inter', 'system-ui', 'sans-serif']
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Figma homepage border radius values (already covered by Tailwind defaults)
				// rounded-full, rounded-2xl, rounded-xl, rounded-lg are standard Tailwind
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;