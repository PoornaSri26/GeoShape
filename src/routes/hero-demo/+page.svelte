<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import ShapeHero from '$lib/components/hero/ShapeHero.svelte';

	let currentShape = $state(0);

	function changeShape() {
		currentShape = (currentShape + 1) % 3;
	}

	const SHAPE_NAMES = ['Italy', 'Japan', 'Australia'];

	let intervalId: ReturnType<typeof setInterval> | undefined;

	onMount(() => {
		intervalId = setInterval(changeShape, 5000);
	});

	onDestroy(() => {
		if (intervalId !== undefined) clearInterval(intervalId);
	});
</script>

<div class="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto py-2">
	<div class="text-center">
		<h1 class="text-2xl font-extrabold">GeoShape Hero Demo</h1>
		<p class="mt-1 text-sm font-medium text-ink/60">
			Watch the outline appear as you scroll — then guess the country.
		</p>
	</div>

	<!-- Shape Hero -->
	<ShapeHero shapeIndex={currentShape} speed={3} />

	<!-- Controls -->
	<div class="flex flex-col items-center gap-3 text-center">
		<div class="flex gap-2">
			{#each SHAPE_NAMES as name, i (name)}
				<button
					type="button"
					class="rounded-base border-2 border-border px-3 py-1.5 text-sm font-bold transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none {currentShape === i
						? 'bg-main shadow-shadow'
						: 'bg-surface shadow-shadow'}"
					onclick={() => (currentShape = i)}
				>
					{name}
				</button>
			{/each}
		</div>

		<p class="text-xs font-medium text-ink/40">
			Auto-cycles every 5 s · scroll to animate
		</p>
	</div>
</div>
