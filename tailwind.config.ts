import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
			transitionDelay: {
				'8000': '8000ms'
			},
			keyframes: {
				yap: {
					'from': { transform: 'scale(1.01, 0.99) translateY(2%)' },
					'to': { transform: 'scale(0.99, 1.01) translateY(0%)' }
				},
				slide_in_right: {
					'0%': { transform: 'translateX(100px)' },
					'100%': { transform: 'translateX(-10px)', opacity: '1' }
				},
				slide_in_left: {
					'0%': { transform: 'translateX(-100px)' },
					'100%': { transform: 'translateX(10px)', opacity: '1' }
				},
				trumpet1: {
					'0%': { transform: 'rotate(-2deg)' },
					'25%': { transform: 'rotate(2deg)' },
					'50%': { transform: 'rotate(-2.5deg)' },
					'75%': { transform: 'rotate(3.5deg)' },
					'100%': { transform: 'rotate(-2deg)' }
				},
				trumpet2: {
					'0%': { transform: 'rotate(-1deg)' },
					'50%': { transform: 'rotate(3.5deg)' },
					'100%': { transform: 'rotate(-1deg)' }
				},
				trumpet3: {
					'0%': { transform: 'rotate(-4deg)' },
					'45%': { transform: 'rotate(3.5deg)' },
					'50%': { transform: 'rotate(3.5deg)' },
					'95%': { transform: 'rotate(-4deg)' },
					'100%': { transform: 'rotate(-4deg)' }
				}
			},
			animation: {
				'trumpet1': 'trumpet1 1.5s alternate infinite',
				'trumpet2': 'trumpet2 1.5s alternate infinite',
				'trumpet3': 'trumpet3 1.25s alternate infinite',
				'trumpet4': 'animate-wiggle 1s animate-infinite animate-ease-in-out',
				'quick_yapping': 'yap 0.25s alternate infinite',
				'slide_in_right': 'slide_in_right 0.5s ease-in-out',
				'slide_in_left': 'slide_in_left 0.5s ease-in-out',
			},
  		colors: {
        	green: '#10B981',
			pink: '#F567D7',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
