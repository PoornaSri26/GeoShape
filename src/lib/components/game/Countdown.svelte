<script lang="ts">
	import { onMount } from 'svelte';
	import { scale } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { t } from '$lib/i18n/index.svelte';
	import { playTick, playGo, unlockAudio } from '$lib/sound';

	let { until }: { until: number } = $props();

	let now = $state(Date.now());

	onMount(() => {
		unlockAudio();
		const id = setInterval(() => (now = Date.now()), 100);
		return () => clearInterval(id);
	});

	const secs = $derived(Math.max(0, Math.ceil((until - now) / 1000)));
	const label = $derived(secs > 0 ? String(secs) : t('game.go'));

	// Track previous value to detect each tick.
	// Initialise to -1 so the first run (which just records the baseline) never fires a sound.
	let prevSecs = -1;
	$effect(() => {
		if (prevSecs === -1) {
			prevSecs = secs;
			return;
		}
		if (prevSecs === secs) return;
		if (secs === 0) playGo();
		else playTick();
		prevSecs = secs;
	});
</script>

<div class="flex flex-1 flex-col items-center justify-center gap-4" aria-live="assertive" role="status">
	<p class="text-lg font-bold text-ink/50">{t('game.getReady')}</p>
	{#key label}
		<div
			in:scale={{ duration: 320, start: 0.3, easing: backOut }}
			class="flex h-36 w-36 items-center justify-center rounded-base border-4 border-border bg-main text-7xl font-extrabold shadow-shadow-lg animate-pulse"
		>
			{label}
		</div>
	{/key}
	<span class="sr-only">{t('game.getReady')}: {label}</span>
</div>
