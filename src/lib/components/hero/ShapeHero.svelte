<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap';
	import { ScrollTrigger } from 'gsap/ScrollTrigger';
	import { t } from '$lib/i18n/index.svelte';

	gsap.registerPlugin(ScrollTrigger);

	type Point = { x: number; y: number };
	type ShapeData = {
		id: string;
		name: string;
		region: string;
		points: Point[];
		funFact: string;
	};

	// Normalized (0–1) outline coordinates for a handful of recognisable shapes.
	const SHAPES: ShapeData[] = [
		{
			id: 'italy',
			name: 'Italy',
			region: 'Europe',
			points: [
				{ x: 0.42, y: 0.08 },
				{ x: 0.55, y: 0.10 },
				{ x: 0.60, y: 0.18 },
				{ x: 0.58, y: 0.26 },
				{ x: 0.52, y: 0.30 },
				{ x: 0.54, y: 0.40 },
				{ x: 0.58, y: 0.52 },
				{ x: 0.62, y: 0.64 },
				{ x: 0.66, y: 0.76 },
				{ x: 0.64, y: 0.84 },
				{ x: 0.56, y: 0.90 },
				{ x: 0.48, y: 0.88 },
				{ x: 0.42, y: 0.80 },
				{ x: 0.38, y: 0.70 },
				{ x: 0.40, y: 0.58 },
				{ x: 0.37, y: 0.46 },
				{ x: 0.36, y: 0.34 },
				{ x: 0.38, y: 0.22 },
				{ x: 0.42, y: 0.08 }
			],
			funFact: 'Italy is shaped like a high-heeled boot kicking a ball (Sicily)!'
		},
		{
			id: 'japan',
			name: 'Japan',
			region: 'Asia',
			points: [
				{ x: 0.50, y: 0.10 },
				{ x: 0.62, y: 0.14 },
				{ x: 0.70, y: 0.22 },
				{ x: 0.72, y: 0.32 },
				{ x: 0.68, y: 0.42 },
				{ x: 0.60, y: 0.50 },
				{ x: 0.56, y: 0.60 },
				{ x: 0.52, y: 0.72 },
				{ x: 0.46, y: 0.80 },
				{ x: 0.38, y: 0.84 },
				{ x: 0.30, y: 0.78 },
				{ x: 0.28, y: 0.66 },
				{ x: 0.32, y: 0.54 },
				{ x: 0.36, y: 0.44 },
				{ x: 0.34, y: 0.34 },
				{ x: 0.38, y: 0.24 },
				{ x: 0.44, y: 0.16 },
				{ x: 0.50, y: 0.10 }
			],
			funFact: 'Japan consists of 6,852 islands!'
		},
		{
			id: 'australia',
			name: 'Australia',
			region: 'Oceania',
			points: [
				{ x: 0.20, y: 0.30 },
				{ x: 0.28, y: 0.18 },
				{ x: 0.40, y: 0.12 },
				{ x: 0.54, y: 0.10 },
				{ x: 0.68, y: 0.16 },
				{ x: 0.78, y: 0.26 },
				{ x: 0.82, y: 0.40 },
				{ x: 0.80, y: 0.54 },
				{ x: 0.76, y: 0.66 },
				{ x: 0.68, y: 0.78 },
				{ x: 0.58, y: 0.86 },
				{ x: 0.46, y: 0.88 },
				{ x: 0.36, y: 0.82 },
				{ x: 0.28, y: 0.72 },
				{ x: 0.22, y: 0.60 },
				{ x: 0.18, y: 0.48 },
				{ x: 0.20, y: 0.30 }
			],
			funFact: 'Australia is the only country that is also a continent!'
		},
		{
			id: 'france',
			name: 'France',
			region: 'Europe',
			points: [
				{ x: 0.35, y: 0.25 },
				{ x: 0.45, y: 0.20 },
				{ x: 0.55, y: 0.22 },
				{ x: 0.65, y: 0.28 },
				{ x: 0.70, y: 0.38 },
				{ x: 0.68, y: 0.50 },
				{ x: 0.62, y: 0.62 },
				{ x: 0.55, y: 0.72 },
				{ x: 0.48, y: 0.78 },
				{ x: 0.40, y: 0.75 },
				{ x: 0.32, y: 0.68 },
				{ x: 0.28, y: 0.55 },
				{ x: 0.30, y: 0.42 },
				{ x: 0.35, y: 0.25 }
			],
			funFact: 'France is the largest country in the EU and known as "The Hexagon"!'
		},
		{
			id: 'brazil',
			name: 'Brazil',
			region: 'South America',
			points: [
				{ x: 0.35, y: 0.35 },
				{ x: 0.45, y: 0.28 },
				{ x: 0.58, y: 0.25 },
				{ x: 0.72, y: 0.30 },
				{ x: 0.80, y: 0.42 },
				{ x: 0.78, y: 0.55 },
				{ x: 0.70, y: 0.68 },
				{ x: 0.58, y: 0.78 },
				{ x: 0.45, y: 0.82 },
				{ x: 0.32, y: 0.75 },
				{ x: 0.25, y: 0.62 },
				{ x: 0.28, y: 0.48 },
				{ x: 0.35, y: 0.35 }
			],
			funFact: 'Brazil is home to 60% of the Amazon rainforest!'
		},
		{
			id: 'egypt',
			name: 'Egypt',
			region: 'Africa',
			points: [
				{ x: 0.55, y: 0.25 },
				{ x: 0.62, y: 0.28 },
				{ x: 0.68, y: 0.35 },
				{ x: 0.70, y: 0.45 },
				{ x: 0.68, y: 0.55 },
				{ x: 0.65, y: 0.65 },
				{ x: 0.60, y: 0.75 },
				{ x: 0.52, y: 0.78 },
				{ x: 0.45, y: 0.72 },
				{ x: 0.42, y: 0.60 },
				{ x: 0.45, y: 0.48 },
				{ x: 0.50, y: 0.38 },
				{ x: 0.55, y: 0.25 }
			],
			funFact: 'Egypt is home to the last remaining wonder of the ancient world!'
		},
		{
			id: 'usa',
			name: 'United States',
			region: 'North America',
			points: [
				{ x: 0.25, y: 0.25 },
				{ x: 0.35, y: 0.20 },
				{ x: 0.50, y: 0.18 },
				{ x: 0.65, y: 0.22 },
				{ x: 0.78, y: 0.30 },
				{ x: 0.85, y: 0.42 },
				{ x: 0.82, y: 0.55 },
				{ x: 0.75, y: 0.68 },
				{ x: 0.65, y: 0.78 },
				{ x: 0.52, y: 0.82 },
				{ x: 0.38, y: 0.78 },
				{ x: 0.28, y: 0.68 },
				{ x: 0.22, y: 0.55 },
				{ x: 0.20, y: 0.40 },
				{ x: 0.25, y: 0.25 }
			],
			funFact: 'The USA has 50 states and is the third-largest country by land area!'
		}
	];

	let {
		shapeIndex = 0,
		speed = 2.5
	}: {
		shapeIndex?: number;
		speed?: number;
	} = $props();

	// DOM refs
	let containerEl: HTMLElement;
	let canvasEl: HTMLCanvasElement;

	// Reactive UI state
	let animProgress = $state(0);
	let isDrawing = $state(false);
	let isComplete = $state(false);
	let prefersReducedMotion = $state(false);

	// Internal refs (not reactive — just mutable variables)
	let ctx: CanvasRenderingContext2D | null = null;
	let tween: gsap.core.Tween | null = null;
	let st: ScrollTrigger | null = null;
	let proxy = { p: 0 };

	function currentShape(): ShapeData {
		return SHAPES[Math.abs(shapeIndex) % SHAPES.length];
	}

	// ─── canvas helpers ────────────────────────────────────────────────────────

	function resize() {
		if (!canvasEl || !containerEl) return;
		canvasEl.width = containerEl.clientWidth || 400;
		canvasEl.height = containerEl.clientHeight || 400;
	}

	function pathLength(points: Point[], w: number, h: number): number {
		let len = 0;
		for (let i = 1; i < points.length; i++) {
			const dx = (points[i].x - points[i - 1].x) * w;
			const dy = (points[i].y - points[i - 1].y) * h;
			len += Math.sqrt(dx * dx + dy * dy);
		}
		return len;
	}

	function drawFrame(progress: number) {
		if (!ctx || !canvasEl) return;
		const w = canvasEl.width;
		const h = canvasEl.height;
		const shape = currentShape();
		const pts = shape.points;

		ctx.clearRect(0, 0, w, h);

		// Background gradient that shifts from deep blue → sage green as progress grows
		const bg = ctx.createLinearGradient(0, 0, 0, h);
		const r = Math.round(30 + (163 - 30) * progress);
		const g = Math.round(58 + (191 - 58) * progress);
		const b = Math.round(138 + (107 - 138) * progress);
		bg.addColorStop(0, `rgb(30,58,138)`);
		bg.addColorStop(1, `rgb(${r},${g},${b})`);
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, w, h);

		if (pts.length < 2) return;

		// How much of the path to draw
		const total = pathLength(pts, w, h);
		const drawLen = total * progress;

		ctx.save();
		ctx.strokeStyle = '#ea580c'; // terracotta orange
		ctx.lineWidth = Math.max(2, Math.min(4, w / 120));
		ctx.lineJoin = 'round';
		ctx.lineCap = 'round';

		// Glow when near complete
		if (progress >= 0.92) {
			ctx.shadowColor = 'rgba(255,255,255,0.55)';
			ctx.shadowBlur = 12;
		}

		ctx.beginPath();
		ctx.moveTo(pts[0].x * w, pts[0].y * h);

		let drawn = 0;
		for (let i = 1; i < pts.length; i++) {
			const sx = pts[i - 1].x * w;
			const sy = pts[i - 1].y * h;
			const ex = pts[i].x * w;
			const ey = pts[i].y * h;
			const seg = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2);

			if (drawn + seg <= drawLen) {
				ctx.lineTo(ex, ey);
				drawn += seg;
			} else {
				const ratio = (drawLen - drawn) / seg;
				ctx.lineTo(sx + (ex - sx) * ratio, sy + (ey - sy) * ratio);
				break;
			}
		}

		ctx.stroke();

		// Semi-transparent fill once complete
		if (progress >= 0.98) {
			ctx.beginPath();
			ctx.moveTo(pts[0].x * w, pts[0].y * h);
			for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * w, pts[i].y * h);
			ctx.closePath();
			ctx.fillStyle = 'rgba(234,88,12,0.12)';
			ctx.fill();
		}

		ctx.restore();
	}

	function drawStatic() {
		if (!ctx || !canvasEl) return;
		drawFrame(1);
	}

	// ─── animation lifecycle ───────────────────────────────────────────────────

	function teardown() {
		tween?.kill();
		tween = null;
		st?.kill();
		st = null;
	}

	function setup() {
		teardown();
		if (!canvasEl || !containerEl) return;

		resize();
		ctx = canvasEl.getContext('2d');
		if (!ctx) return;

		if (prefersReducedMotion) {
			drawStatic();
			animProgress = 1;
			isComplete = true;
			return;
		}

		proxy.p = 0;
		drawFrame(0);

		tween = gsap.to(proxy, {
			p: 1,
			duration: speed,
			ease: 'none',
			paused: true,
			onUpdate() {
				const p = proxy.p;
				drawFrame(p);
				animProgress = p;
				isDrawing = p > 0 && p < 0.95;
				isComplete = p >= 0.95;
			},
			onComplete() {
				isDrawing = false;
				isComplete = true;
			}
		});

		st = ScrollTrigger.create({
			trigger: containerEl,
			start: 'top 80%',
			end: 'bottom 20%',
			scrub: 0.4,
			onUpdate(self) {
				tween?.progress(self.progress);
			}
		});
	}

	// ─── mount / resize ────────────────────────────────────────────────────────

	onMount(() => {
		const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mq.matches;

		setup();
		_mounted = true;

		const onMotion = () => {
			prefersReducedMotion = mq.matches;
			setup();
		};
		const onResize = () => {
			resize();
			if (prefersReducedMotion) {
				drawStatic();
			} else {
				drawFrame(proxy.p);
			}
		};

		mq.addEventListener('change', onMotion);
		window.addEventListener('resize', onResize);

		return () => {
			teardown();
			mq.removeEventListener('change', onMotion);
			window.removeEventListener('resize', onResize);
		};
	});

	// Re-run when shapeIndex changes after mount — guarded so it doesn't
	// fire on the initial render before onMount has run.
	let _mounted = false;
	$effect(() => {
		const _ = shapeIndex;
		if (_mounted) setup();
	});
</script>

<div bind:this={containerEl} class="hero-wrap" aria-label="Shape drawing animation" role="img">
	<canvas bind:this={canvasEl} class="hero-canvas" aria-hidden="true"></canvas>

	<!-- Overlay text -->
	<div class="hero-overlay">
		<span class="hero-badge">
			{t('hero.guess')}
		</span>
		<h2 class="hero-title">
			{#if !isComplete}
				{t('hero.whatIsThis')}
			{:else}
				{currentShape().name}
			{/if}
		</h2>

		<p class="hero-sub">
			{#if animProgress < 0.05}
				{t('hero.watchOutline')}
			{:else if !isComplete}
				{#if animProgress < 0.35}
					{t('hero.isItFrance')}
				{:else if animProgress < 0.65}
					{t('hero.orMaybe')}
				{:else}
					{t('hero.gettingCloser')}
				{/if}
			{:else}
				{currentShape().region}
			{/if}
		</p>

		{#if isComplete}
			<p class="hero-fact">💡 {currentShape().funFact}</p>
		{/if}
	</div>

	<!-- Screen-reader live region -->
	<div aria-live="polite" class="sr-only">
		{#if isComplete}
			{currentShape().name}, {currentShape().region}.
		{:else if isDrawing}
			{Math.round(animProgress * 100)}%
		{/if}
	</div>
</div>

<style>
	.hero-wrap {
		position: relative;
		width: 100%;
		height: 260px;
		overflow: hidden;
		border-radius: var(--radius-md);
		border: 2px solid var(--color-border);
		box-shadow: var(--shadow-shadow);
	}

	.hero-canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.hero-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 1.25rem;
		text-align: center;
		pointer-events: none;
		color: #fff;
	}

	.hero-badge {
		font-size: 0.7rem;
		font-weight: 900;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		background: rgba(255, 205, 0, 0.25);
		border: 1px solid rgba(255, 255, 255, 0.4);
		color: #fff;
		padding: 2px 10px;
		border-radius: var(--radius-full);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.hero-title {
		font-size: clamp(1.25rem, 5vw, 2rem);
		font-weight: 800;
		text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
		margin: 0;
		line-height: 1.2;
	}

	.hero-sub {
		font-size: clamp(0.8rem, 3vw, 1rem);
		font-weight: 600;
		opacity: 0.88;
		margin: 0;
		text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
	}

	.hero-fact {
		font-size: 0.78rem;
		font-weight: 500;
		opacity: 0.78;
		max-width: 30ch;
		margin: 0.25rem 0 0;
		text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
		line-height: 1.4;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
</style>
