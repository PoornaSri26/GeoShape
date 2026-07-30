import { browser } from '$app/environment';

type AnimationType = 
	| 'fade-up' 
	| 'fade-in' 
	| 'scale-up' 
	| 'slide-left' 
	| 'slide-right'
	| 'pulse';

interface AnimateOnScrollOptions {
	animationType?: AnimationType;
	delay?: number;
	duration?: number;
	once?: boolean;
	start?: string;
	end?: string;
	scrub?: boolean;
}

export function animateOnScroll(
	node: HTMLElement,
	options: AnimateOnScrollOptions = {}
) {
	// Only run in browser environment
	if (!browser) {
		return { destroy: () => {} };
	}

	// Dynamic import for GSAP (browser-only)
	let animation: any = null;
	let scrollTrigger: any = null;

	const {
		animationType = 'fade-up',
		delay = 0,
		duration = 0.6,
		once = true,
		start = 'top 85%',
		end = 'bottom 20%',
		scrub = false
	} = options;

	async function init() {
		try {
			const { default: gsap } = await import('gsap');
			const { ScrollTrigger } = await import('gsap/ScrollTrigger');
			
			gsap.registerPlugin(ScrollTrigger);

			// Check for reduced motion preference
			const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			if (prefersReducedMotion) {
				// Skip animation for users who prefer reduced motion
				gsap.set(node, { opacity: 1, y: 0, x: 0, scale: 1 });
				return;
			}

			// Define animation configurations
			const animationConfigs: Record<AnimationType, () => any> = {
				'fade-up': () =>
					gsap.fromTo(node,
						{ y: 30, opacity: 0 },
						{ y: 0, opacity: 1, duration, ease: 'power3.out', delay }
					),
				'fade-in': () =>
					gsap.fromTo(node,
						{ opacity: 0 },
						{ opacity: 1, duration, ease: 'power2.out', delay }
					),
				'scale-up': () =>
					gsap.fromTo(node,
						{ scale: 0.8, opacity: 0 },
						{ scale: 1, opacity: 1, duration, ease: 'back.out(1.7)', delay }
					),
				'slide-left': () =>
					gsap.fromTo(node,
						{ x: -50, opacity: 0 },
						{ x: 0, opacity: 1, duration, ease: 'power4.out', delay }
					),
				'slide-right': () =>
					gsap.fromTo(node,
						{ x: 50, opacity: 0 },
						{ x: 0, opacity: 1, duration, ease: 'power4.out', delay }
					),
				'pulse': () =>
					gsap.to(node,
						{ scale: 1.05, duration, ease: 'elastic.out(1, 0.5)', repeat: -1, repeatDelay: 3 }
					)
			};

			animation = animationConfigs[animationType]();

			// Determine appropriate toggleActions based on animation type
			const getToggleActions = (): string => {
				// For continuous animations like pulse, we want to pause when not in view
				if (animationType === 'pulse') {
					return once ? 'play pause resume none' : 'play pause resume none';
				}
				// For entrance animations, we want to play on enter and reverse on leave back
				return once ? 'play none none reverse' : 'play none none reverse';
			};

			const scrollTriggerOptions: any = {
				trigger: node,
				start,
				onInit: () => animation?.progress(0),
				toggleActions: getToggleActions()
			};

			if (scrub) {
				scrollTriggerOptions.scrub = true;
				scrollTriggerOptions.end = end;
			}

			scrollTrigger = ScrollTrigger.create(scrollTriggerOptions);
		} catch (error) {
			console.error('Failed to initialize GSAP animation:', error);
		}
	}

	function destroy() {
		if (animation) animation.kill();
		if (scrollTrigger) scrollTrigger.kill();
		animation = null;
		scrollTrigger = null;
	}

	// Defer initialization to ensure browser context
	requestAnimationFrame(() => init());

	return {
		destroy,
		update(newOptions: AnimateOnScrollOptions) {
			destroy();
			Object.assign(options, newOptions);
			init();
		}
	};
}
