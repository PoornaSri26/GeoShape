<script lang="ts">
	import { onMount } from 'svelte';
	import { CATEGORIES, getCategory, type Shape } from '$server/data/shapes.js';
	import { missedDeck, type MissedPlaceItem } from '$lib/stores/missedDeck.svelte';
	import { i18n, t } from '$lib/i18n/index.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import CategorySelect from '$lib/components/game/CategorySelect.svelte';
	import { goto } from '$app/navigation';

	type Props = {
		initialCategory?: number;
		onSelectShape?: (shape: Shape) => void;
	};

	let { initialCategory = 8, onSelectShape }: Props = $props();

	let selectedCategoryId = $state(8);
	$effect(() => {
		selectedCategoryId = initialCategory;
	});

	const category = $derived(getCategory(selectedCategoryId) ?? CATEGORIES[8]);
	const shapes = $derived(category?.shapes ?? []);

	// Map of shapeId -> MissedPlaceItem
	const categoryDeckMap = $derived(missedDeck.getCategoryItems(selectedCategoryId));

	// Stats
	const totalShapes = $derived(shapes.length);

	const stats = $derived.by(() => {
		let mastered = 0;
		let learning = 0;
		let due = 0;
		let unexplored = 0;

		const now = Date.now();
		for (const s of shapes) {
			const item = categoryDeckMap[s.id];
			if (!item) {
				unexplored++;
			} else if (item.mastered) {
				mastered++;
			} else if (item.nextReviewAt <= now) {
				due++;
			} else {
				learning++;
			}
		}

		const masteredPercent = totalShapes > 0 ? Math.round((mastered / totalShapes) * 100) : 0;
		return { mastered, learning, due, unexplored, totalShapes, masteredPercent };
	});

	// Selected shape for modal inspector
	let inspectedShape = $state<Shape | null>(null);
	let hoverShape = $state<Shape | null>(null);

	// Zoom & Pan state
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isDragging = $state(false);
	let startX = 0;
	let startY = 0;

	function resetZoomPan() {
		zoom = 1;
		panX = 0;
		panY = 0;
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const zoomDelta = e.deltaY < 0 ? 1.15 : 0.85;
		zoom = Math.min(5, Math.max(0.8, zoom * zoomDelta));
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		isDragging = true;
		startX = e.clientX - panX;
		startY = e.clientY - panY;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging) return;
		panX = e.clientX - startX;
		panY = e.clientY - startY;
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function getShapeFill(shapeId: number): string {
		const item = categoryDeckMap[shapeId];
		if (!item) return 'var(--map-unexplored, #334155)'; // Unexplored
		if (item.mastered) return '#10b981'; // Vibrant Emerald Green
		if (item.nextReviewAt <= Date.now() || item.stage === 1) return '#ef4444'; // Red/Crimson (Due/Missed)
		return '#f59e0b'; // Gold/Amber (Learning Stage 2-4)
	}

	function getShapeStatusLabel(shapeId: number): string {
		const item = categoryDeckMap[shapeId];
		if (!item) return t('map.unexplored');
		if (item.mastered) return `${t('map.mastered')} (Stage ${item.stage})`;
		if (item.nextReviewAt <= Date.now()) return `${t('map.needsReview')} (Due)`;
		return `${t('map.learning')} (Stage ${item.stage})`;
	}

	const inspectedItem = $derived(
		inspectedShape ? (categoryDeckMap[inspectedShape.id] ?? null) : null
	);

	function toggleDeckForInspected() {
		if (!inspectedShape) return;
		const id = inspectedShape.id;
		if (missedDeck.has(selectedCategoryId, id)) {
			missedDeck.remove(`${selectedCategoryId}:${id}`);
		} else {
			missedDeck.addMissed({
				categoryId: selectedCategoryId,
				shapeId: id,
				name: inspectedShape.name,
				nameDe: inspectedShape.nameDe,
				path: inspectedShape.path,
				viewBox: category.viewBox,
				answers: inspectedShape.answers,
				info: inspectedShape.info,
				capital: inspectedShape.capital as [number, number] | null
			});
		}
	}
</script>

<div class="flex flex-col gap-4 w-full">
	<!-- Top Bar Controls & Stats -->
	<div class="flex flex-wrap items-center justify-between gap-3 rounded-base border-2 border-border bg-surface p-4 shadow-shadow">
		<div class="flex items-center gap-3 min-w-[220px]">
			<span class="text-xs font-black uppercase tracking-wider text-ink/60">Category:</span>
			<div class="w-48">
				<CategorySelect
					value={selectedCategoryId}
					onpick={(id) => {
						selectedCategoryId = id;
						resetZoomPan();
						inspectedShape = null;
					}}
				/>
			</div>
		</div>

		<!-- Progress Bar & Mastery Counters -->
		<div class="flex flex-1 flex-wrap items-center justify-end gap-4 text-xs font-bold">
			<div class="flex items-center gap-1.5">
				<span class="inline-block h-3 w-3 rounded-full bg-[#10b981]"></span>
				<span>{t('map.mastered')}: <strong class="font-extrabold">{stats.mastered}</strong></span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="inline-block h-3 w-3 rounded-full bg-[#f59e0b]"></span>
				<span>{t('map.learning')}: <strong class="font-extrabold">{stats.learning}</strong></span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="inline-block h-3 w-3 rounded-full bg-[#ef4444]"></span>
				<span>{t('review.dueNow')}: <strong class="font-extrabold">{stats.due}</strong></span>
			</div>
			<div class="flex items-center gap-1.5">
				<span class="inline-block h-3 w-3 rounded-full bg-[#334155]"></span>
				<span>{t('map.unexplored')}: <strong class="font-extrabold">{stats.unexplored}</strong></span>
			</div>

			<!-- Percentage Badge -->
			<div class="flex items-center rounded-base border-2 border-border bg-main px-3 py-1 text-sm font-black shadow-shadow">
				{t('map.completion', { percent: stats.masteredPercent })}
			</div>
		</div>
	</div>

	<!-- Interactive Map Canvas Container -->
	<div
		class="relative h-[520px] w-full overflow-hidden rounded-base border-2 border-border bg-[#0f172a] shadow-shadow select-none cursor-grab active:cursor-grabbing"
		onwheel={handleWheel}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
		role="region"
		aria-label="Interactive map progress tracker"
	>
		<!-- Zoom / Pan Floating Controls -->
		<div class="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
			<button
				type="button"
				onclick={() => (zoom = Math.min(5, zoom * 1.25))}
				class="flex h-8 w-8 items-center justify-center rounded-base border-2 border-border bg-surface font-extrabold shadow-shadow transition-transform hover:scale-105"
				title="Zoom In"
			>
				+
			</button>
			<button
				type="button"
				onclick={() => (zoom = Math.max(0.8, zoom / 1.25))}
				class="flex h-8 w-8 items-center justify-center rounded-base border-2 border-border bg-surface font-extrabold shadow-shadow transition-transform hover:scale-105"
				title="Zoom Out"
			>
				−
			</button>
			<button
				type="button"
				onclick={resetZoomPan}
				class="flex h-8 w-8 items-center justify-center rounded-base border-2 border-border bg-surface text-xs font-black shadow-shadow transition-transform hover:scale-105"
				title="Reset View"
			>
				⟲
			</button>
		</div>

		<!-- Hover Tooltip -->
		{#if hoverShape}
			<div class="pointer-events-none absolute top-3 left-3 z-10 flex items-center gap-2 rounded-base border-2 border-border bg-surface px-3 py-1.5 text-xs font-black shadow-shadow animate-fade-in">
				<span class="h-2.5 w-2.5 rounded-full" style:background-color={getShapeFill(hoverShape.id)}></span>
				<span>{i18n.locale === 'de' ? hoverShape.nameDe : hoverShape.name}</span>
				<span class="text-ink/60">({getShapeStatusLabel(hoverShape.id)})</span>
			</div>
		{/if}

		<!-- SVG Renderer -->
		<svg
			viewBox={category?.viewBox ?? '0 0 1000 1000'}
			class="h-full w-full transition-transform duration-75 ease-out"
			style="transform: translate({panX}px, {panY}px) scale({zoom}); transform-origin: center center;"
		>
			<g>
				{#each shapes as shape (shape.id)}
					{@const fill = getShapeFill(shape.id)}
					{@const isInspected = inspectedShape?.id === shape.id}
					<path
						d={shape.path}
						fill={fill}
						stroke={isInspected ? '#ffffff' : '#000000'}
						stroke-width={isInspected ? '3' : '1'}
						stroke-opacity="0.6"
						class="cursor-pointer transition-all hover:opacity-90 hover:stroke-white hover:stroke-[2px]"
						onmouseenter={() => (hoverShape = shape)}
						onmouseleave={() => (hoverShape = null)}
						onclick={(e) => {
							e.stopPropagation();
							inspectedShape = shape;
							if (onSelectShape) onSelectShape(shape);
						}}
					/>
				{/each}
			</g>
		</svg>

		<!-- Watermark Hint -->
		<div class="pointer-events-none absolute bottom-3 left-3 text-[11px] font-bold text-white/40">
			💡 Scroll to zoom • Drag to pan • Click country to inspect
		</div>
	</div>
</div>

<!-- Country Inspector Dialog Modal -->
{#if inspectedShape}
	<Dialog open={true} onclose={() => (inspectedShape = null)}>
		<div class="flex flex-col gap-4 p-2">
			<div class="flex items-center justify-between border-b-2 border-border pb-3">
				<div>
					<h3 class="text-xl font-black">
						{i18n.locale === 'de' ? inspectedShape.nameDe : inspectedShape.name}
					</h3>
					<p class="text-xs font-bold text-ink/60">
						{t(`category.${selectedCategoryId}` as 'category.0')}
					</p>
				</div>
				<span
					class="rounded-base border-2 border-border px-3 py-1 text-xs font-black uppercase shadow-shadow text-white"
					style:background-color={getShapeFill(inspectedShape.id)}
				>
					{getShapeStatusLabel(inspectedShape.id)}
				</span>
			</div>

			<!-- Shape Preview Canvas -->
			<div class="flex h-44 w-full items-center justify-center rounded-base border-2 border-border bg-[#0f172a] p-4 shadow-shadow">
				<svg viewBox={category.viewBox} class="h-full max-h-full w-full max-w-full drop-shadow-md">
					<path
						d={inspectedShape.path}
						fill={getShapeFill(inspectedShape.id)}
						stroke="#ffffff"
						stroke-width="2"
					/>
				</svg>
			</div>

			<!-- Country Meta Info -->
			<div class="grid grid-cols-2 gap-2 text-xs">
				{#if inspectedShape.info?.capital}
					<div class="rounded border border-border bg-surface/50 p-2 font-bold">
						<span class="text-ink/60">🏛️ {t('info.capital')}:</span>
						<p class="font-extrabold text-sm">{inspectedShape.info.capital}</p>
					</div>
				{/if}
				{#if inspectedShape.info?.population}
					<div class="rounded border border-border bg-surface/50 p-2 font-bold">
						<span class="text-ink/60">👥 {t('info.population')}:</span>
						<p class="font-extrabold text-sm">
							{new Intl.NumberFormat().format(inspectedShape.info.population)}
						</p>
					</div>
				{/if}
				{#if inspectedShape.info?.areaKm2}
					<div class="rounded border border-border bg-surface/50 p-2 font-bold">
						<span class="text-ink/60">📐 {t('info.area')}:</span>
						<p class="font-extrabold text-sm">
							{new Intl.NumberFormat().format(inspectedShape.info.areaKm2)} km²
						</p>
					</div>
				{/if}
				<div class="rounded border border-border bg-surface/50 p-2 font-bold">
					<span class="text-ink/60">📊 SRS Status:</span>
					<p class="font-extrabold text-sm">
						{inspectedItem ? `Stage ${inspectedItem.stage} (${inspectedItem.mastered ? 'Mastered' : 'Learning'})` : 'Unexplored'}
					</p>
				</div>
			</div>

			{#if inspectedItem}
				<div class="flex items-center justify-between rounded border-2 border-border bg-surface p-2.5 text-xs font-bold shadow-shadow">
					<span>Missed: <strong class="text-red-500 font-extrabold">{inspectedItem.timesMissed}x</strong></span>
					<span>Reviewed: <strong class="font-extrabold">{inspectedItem.timesReviewed}x</strong></span>
					<span>Correct: <strong class="text-emerald-500 font-extrabold">{inspectedItem.timesCorrect}x</strong></span>
				</div>
			{/if}

			<!-- Modal Action Buttons -->
			<div class="flex items-center justify-end gap-2 pt-2">
				<Button
					variant="neutral"
					onclick={toggleDeckForInspected}
				>
					{missedDeck.has(selectedCategoryId, inspectedShape.id) ? '❌ Remove from Deck' : '➕ Add to Missed Deck'}
				</Button>
				<Button
					variant="default"
					onclick={() => {
						inspectedShape = null;
						goto('/review?tab=session');
					}}
				>
					⚡ Practice in Session
				</Button>
			</div>
		</div>
	</Dialog>
{/if}
