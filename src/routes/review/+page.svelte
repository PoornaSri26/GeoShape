<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import CategorySelect from '$lib/components/game/CategorySelect.svelte';
	import ProgressMap from '$lib/components/map/ProgressMap.svelte';
	import { missedDeck, type MissedPlaceItem, type Rating } from '$lib/stores/missedDeck.svelte';
	import { SHAPE_FAMILIES, type ShapeFamilyCluster } from '$lib/data/shapeFamilies';
	import { CATEGORIES, getCategory, type Category, type Shape } from '$server/data/shapes.js';
	import { judgeGuess } from '$server/match.js';
	import { Verdict } from '$server/protocol.js';
	import { i18n, t } from '$lib/i18n/index.svelte';
	import { unlockAudio } from '$lib/sound';

	const categoriesList = Object.values(CATEGORIES) as Category[];

	// Active tab
	let activeTab = $state<'map' | 'deck' | 'session' | 'families'>('map');

	$effect(() => {
		const paramTab = page.url.searchParams.get('tab');
		if (paramTab === 'deck' || paramTab === 'session' || paramTab === 'families' || paramTab === 'map') {
			activeTab = paramTab;
		}
	});

	function setTab(tab: 'map' | 'deck' | 'session' | 'families') {
		activeTab = tab;
		const url = new URL(window.location.href);
		url.searchParams.set('tab', tab);
		window.history.replaceState({}, '', url);
	}

	// Filter & Search in Deck tab
	let searchQuery = $state('');
	let categoryFilter = $state<number | 'all'>('all');

	const filteredDeckItems = $derived.by(() => {
		const query = searchQuery.trim().toLowerCase();
		return missedDeck.items.filter((item) => {
			if (categoryFilter !== 'all' && item.categoryId !== categoryFilter) return false;
			if (!query) return true;
			const nameEn = item.name.toLowerCase();
			const nameDe = (item.nameDe ?? item.name).toLowerCase();
			return nameEn.includes(query) || nameDe.includes(query);
		});
	});

	// --- SRS SESSION STATE ---
	let sessionQueue = $state<MissedPlaceItem[]>([]);
	let currentIndex = $state(0);
	let revealedAnswer = $state(false);
	let typedGuess = $state('');
	let guessVerdict = $state<Verdict | null>(null);
	let sessionComplete = $state(false);
	let sessionCorrectCount = $state(0);
	let practiceAllMode = $state(false);
	let showHintClue = $state(false);
	let sessionNegativeSpace = $state(false);

	const currentCard = $derived(sessionQueue[currentIndex] ?? null);

	function startSrsSession(all = false) {
		unlockAudio();
		practiceAllMode = all;
		const pool = all ? [...missedDeck.items] : missedDeck.dueItems;
		if (pool.length === 0) {
			sessionQueue = [];
			return;
		}
		// Shuffle queue slightly
		sessionQueue = [...pool].sort(() => Math.random() - 0.5);
		currentIndex = 0;
		revealedAnswer = false;
		typedGuess = '';
		guessVerdict = null;
		sessionComplete = false;
		sessionCorrectCount = 0;
		showHintClue = false;
		sessionNegativeSpace = false;
		setTab('session');
	}

	function handleTypedGuess() {
		if (!currentCard || !typedGuess.trim() || revealedAnswer) return;
		const answers = currentCard.answers?.length ? currentCard.answers : [currentCard.name];
		const verdict = judgeGuess(typedGuess, answers, []);
		guessVerdict = verdict;

		if (verdict === Verdict.CORRECT) {
			revealedAnswer = true;
			sessionCorrectCount++;
		}
	}

	function handleRating(rating: Rating) {
		if (!currentCard) return;
		missedDeck.recordReview(currentCard.id, rating);
		nextCard();
	}

	function nextCard() {
		revealedAnswer = false;
		typedGuess = '';
		guessVerdict = null;
		showHintClue = false;

		if (currentIndex + 1 < sessionQueue.length) {
			currentIndex++;
		} else {
			sessionComplete = true;
		}
	}

	function addClusterToDeck(cluster: ShapeFamilyCluster) {
		const cat = getCategory(cluster.categoryId);
		if (!cat) return;
		for (const shapeInfo of cluster.shapes) {
			const foundShape = cat.shapes.find(
				(s: Shape) => s.name.toLowerCase() === shapeInfo.name.toLowerCase()
			);
			if (foundShape) {
				missedDeck.addMissed({
					categoryId: cluster.categoryId,
					shapeId: foundShape.id,
					name: foundShape.name,
					nameDe: foundShape.nameDe,
					path: foundShape.path,
					viewBox: cat.viewBox,
					answers: foundShape.answers,
					info: foundShape.info,
					capital: foundShape.capital as [number, number] | null
				});
			}
		}
		startSrsSession(true);
	}

	function formatNextDue(timestamp: number): string {
		const diffMin = Math.round((timestamp - Date.now()) / (1000 * 60));
		if (diffMin <= 0) return t('review.dueNow');
		if (diffMin < 60) return t('review.dueIn', { time: `${diffMin}m` });
		const diffHours = Math.round(diffMin / 60);
		if (diffHours < 24) return t('review.dueIn', { time: `${diffHours}h` });
		const diffDays = Math.round(diffHours / 24);
		return t('review.dueIn', { time: `${diffDays}d` });
	}
</script>

<div class="flex w-full flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col gap-2">
		<div class="flex items-center justify-between">
			<h1 class="text-3xl font-black tracking-tight">{t('review.title')}</h1>
			{#if missedDeck.dueCount > 0 && activeTab !== 'session'}
				<Button variant="default" onclick={() => startSrsSession(false)}>
					⚡ {t('review.startSession', { count: missedDeck.dueCount })}
				</Button>
			{/if}
		</div>
		<p class="text-sm font-bold text-ink/60">{t('review.subtitle')}</p>
	</div>

	<!-- Navigation Tabs -->
	<div class="flex flex-wrap gap-2 border-b-2 border-border pb-3">
		<button
			type="button"
			onclick={() => setTab('map')}
			class="rounded-base border-2 border-border px-4 py-2 text-sm font-extrabold shadow-shadow transition-all hover:translate-x-[1px] hover:translate-y-[1px]
				{activeTab === 'map' ? 'bg-main text-ink' : 'bg-surface text-ink/70'}"
		>
			{t('review.tabMap')}
		</button>
		<button
			type="button"
			onclick={() => setTab('deck')}
			class="relative rounded-base border-2 border-border px-4 py-2 text-sm font-extrabold shadow-shadow transition-all hover:translate-x-[1px] hover:translate-y-[1px]
				{activeTab === 'deck' ? 'bg-main text-ink' : 'bg-surface text-ink/70'}"
		>
			{t('review.tabDeck')}
			{#if missedDeck.totalCount > 0}
				<span class="ml-1.5 rounded-full bg-border px-2 py-0.5 text-xs text-white">
					{missedDeck.totalCount}
				</span>
			{/if}
		</button>
		<button
			type="button"
			onclick={() => setTab('session')}
			class="relative rounded-base border-2 border-border px-4 py-2 text-sm font-extrabold shadow-shadow transition-all hover:translate-x-[1px] hover:translate-y-[1px]
				{activeTab === 'session' ? 'bg-main text-ink' : 'bg-surface text-ink/70'}"
		>
			{t('review.tabSession')}
			{#if missedDeck.dueCount > 0}
				<span class="ml-1.5 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
					{missedDeck.dueCount}
				</span>
			{/if}
		</button>
		<button
			type="button"
			onclick={() => setTab('families')}
			class="rounded-base border-2 border-border px-4 py-2 text-sm font-extrabold shadow-shadow transition-all hover:translate-x-[1px] hover:translate-y-[1px]
				{activeTab === 'families' ? 'bg-main text-ink' : 'bg-surface text-ink/70'}"
		>
			{t('review.tabFamilies')}
		</button>
	</div>

	<!-- ================= TAB 1: MAP PROGRESS TRACKER ================= -->
	{#if activeTab === 'map'}
		<Card class="p-4">
			<ProgressMap />
		</Card>
	{/if}

	<!-- ================= TAB 2: MISSED DECK DASHBOARD ================= -->
	{#if activeTab === 'deck'}
		<div class="flex flex-col gap-6">
			<!-- Dashboard Stats Cards -->
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
				<Card class="p-4">
					<span class="text-xs font-bold uppercase tracking-wider text-ink/60">{t('review.dueNow')}</span>
					<div class="flex items-baseline justify-between pt-1">
						<span class="text-3xl font-black text-red-500">{missedDeck.dueCount}</span>
						{#if missedDeck.dueCount > 0}
							<Button size="sm" variant="default" onclick={() => startSrsSession(false)}>⚡ Review</Button>
						{/if}
					</div>
				</Card>
				<Card class="p-4">
					<span class="text-xs font-bold uppercase tracking-wider text-ink/60">{t('review.learning')}</span>
					<div class="pt-1">
						<span class="text-3xl font-black text-amber-500">{missedDeck.learningCount}</span>
					</div>
				</Card>
				<Card class="p-4">
					<span class="text-xs font-bold uppercase tracking-wider text-ink/60">{t('review.mastered')}</span>
					<div class="flex items-baseline justify-between pt-1">
						<span class="text-3xl font-black text-emerald-500">{missedDeck.masteredCount}</span>
						{#if missedDeck.masteredCount > 0}
							<Button size="sm" variant="neutral" onclick={() => missedDeck.clearMastered()}>Clean</Button>
						{/if}
					</div>
				</Card>
				<Card class="p-4">
					<span class="text-xs font-bold uppercase tracking-wider text-ink/60">{t('review.totalPlaces')}</span>
					<div class="flex items-baseline justify-between pt-1">
						<span class="text-3xl font-black">{missedDeck.totalCount}</span>
						{#if missedDeck.totalCount > 0}
							<Button size="sm" variant="neutral" onclick={() => startSrsSession(true)}>Practice All</Button>
						{/if}
					</div>
				</Card>
			</div>

			<!-- Filter & Search Bar -->
			<div class="flex flex-wrap items-center gap-3">
				<div class="w-full flex-1 sm:w-64">
					<Input
						placeholder="Search missed places…"
						bind:value={searchQuery}
					/>
				</div>
				<div class="w-48">
					<select
						class="w-full cursor-pointer appearance-none rounded-base border-2 border-border bg-surface px-3 py-2 text-sm font-bold shadow-shadow"
						value={categoryFilter}
						onchange={(e) => (categoryFilter = e.currentTarget.value === 'all' ? 'all' : Number(e.currentTarget.value))}
					>
						<option value="all">All Categories</option>
						{#each categoriesList as cat (cat.id)}
							<option value={cat.id}>{t(`category.${cat.id}` as 'category.0')}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Deck Cards Grid -->
			{#if filteredDeckItems.length === 0}
				<Card class="p-12 text-center">
					<p class="text-lg font-extrabold text-ink/60">
						{missedDeck.totalCount === 0
							? '🎉 No missed places in your deck! Play rounds or add places to start studying.'
							: 'No matching missed places found.'}
					</p>
				</Card>
			{:else}
				<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each filteredDeckItems as item (item.id)}
						<Card class="flex flex-col justify-between p-4 transition-transform hover:-translate-y-0.5">
							<div class="flex flex-col gap-3">
								<div class="flex items-start justify-between">
									<div>
										<h4 class="text-lg font-black">{i18n.locale === 'de' ? item.nameDe : item.name}</h4>
										<span class="text-xs font-bold text-ink/60">{t(`category.${item.categoryId}` as 'category.0')}</span>
									</div>
									<span
										class="rounded-base border-2 border-border px-2.5 py-0.5 text-xs font-black uppercase text-white shadow-shadow"
										class:bg-emerald-500={item.mastered}
										class:bg-red-500={!item.mastered && item.nextReviewAt <= Date.now()}
										class:bg-amber-500={!item.mastered && item.nextReviewAt > Date.now()}
									>
										{item.mastered ? 'Mastered' : item.nextReviewAt <= Date.now() ? 'Due' : `Stage ${item.stage}`}
									</span>
								</div>

								<!-- SVG Thumbnail -->
								<div class="flex h-32 w-full items-center justify-center rounded-base border-2 border-border bg-[#0f172a] p-2 shadow-shadow">
									<svg viewBox={item.viewBox} class="h-full w-full max-h-full max-w-full drop-shadow">
										<path d={item.path} fill={item.mastered ? '#10b981' : '#f59e0b'} stroke="#ffffff" stroke-width="2" />
									</svg>
								</div>

								<!-- Stats row -->
								<div class="flex items-center justify-between text-xs font-bold text-ink/70">
									<span>Missed: <strong class="text-red-500">{item.timesMissed}x</strong></span>
									<span>Due: <strong>{formatNextDue(item.nextReviewAt)}</strong></span>
								</div>
							</div>

							<!-- Card Action Footer -->
							<div class="mt-4 flex items-center justify-between border-t-2 border-border pt-3">
								<button
									type="button"
									onclick={() => missedDeck.resetItem(item.id)}
									class="text-xs font-bold text-ink/60 hover:underline"
								>
									Reset Stage
								</button>
								<Button size="sm" variant="neutral" onclick={() => missedDeck.remove(item.id)}>
									Remove
								</Button>
							</div>
						</Card>
					{/each}
				</div>
			{/if}
		</div>
	{/if}

	<!-- ================= TAB 3: SRS PRACTICE SESSION ================= -->
	{#if activeTab === 'session'}
		{#if sessionQueue.length === 0 || sessionComplete}
			<Card class="flex flex-col items-center justify-center gap-4 p-12 text-center">
				<div class="text-5xl">🎉</div>
				<h2 class="text-2xl font-black">
					{sessionComplete ? 'Session Complete!' : 'No Due Review Cards'}
				</h2>
				<p class="max-w-md text-sm font-bold text-ink/70">
					{sessionComplete
						? `Great job! You reviewed ${sessionQueue.length} cards with ${sessionCorrectCount} correct guesses.`
						: 'You have no missed places due for review right now. All caught up!'}
				</p>

				<div class="flex flex-wrap justify-center gap-3 pt-2">
					{#if missedDeck.totalCount > 0}
						<Button variant="default" onclick={() => startSrsSession(true)}>
							⚡ Practice All Deck Cards
						</Button>
					{/if}
					<Button variant="neutral" onclick={() => setTab('map')}>
						🗺️ View Map Progress
					</Button>
				</div>
			</Card>
		{:else if currentCard}
			<div class="flex flex-col gap-6 max-w-2xl mx-auto w-full">
				<!-- Session Header Progress -->
				<div class="flex items-center justify-between text-sm font-extrabold">
					<span>Card {currentIndex + 1} of {sessionQueue.length}</span>
					<span class="rounded-base border-2 border-border bg-surface px-3 py-1 text-xs shadow-shadow">
						Stage {currentCard.stage} ({currentCard.mastered ? 'Mastered' : 'Learning'})
					</span>
				</div>

				<!-- Interactive SVG Shape Display -->
				<Card class="flex flex-col items-center gap-4 p-6 text-center">
					<div class="flex h-64 w-full items-center justify-center rounded-base border-2 border-border bg-[#0f172a] p-4 shadow-shadow">
						<svg viewBox={currentCard.viewBox} class="h-full w-full max-h-full max-w-full drop-shadow-lg">
							<defs>
								<mask id="session-neg-mask">
									<rect x="-2000" y="-2000" width="6000" height="6000" fill="white" />
									<path d={currentCard.path} fill="black" />
								</mask>
							</defs>

							{#if sessionNegativeSpace && !revealedAnswer}
								<!-- Negative space land block with target shape cutout -->
								<rect
									x="-2000"
									y="-2000"
									width="6000"
									height="6000"
									fill="#334155"
									mask="url(#session-neg-mask)"
								/>
								<path
									d={currentCard.path}
									fill="#0f172a"
									stroke="#ffffff"
									stroke-width="2.5"
									stroke-dasharray="6,4"
								/>
							{:else}
								<path
									d={currentCard.path}
									fill={revealedAnswer ? '#10b981' : '#38bdf8'}
									stroke="#ffffff"
									stroke-width="2.5"
								/>
							{/if}
						</svg>
					</div>

					<!-- Hint & Negative Space Mode Toggle Buttons -->
					{#if !revealedAnswer}
						<div class="flex items-center gap-2">
							<button
								type="button"
								onclick={() => (showHintClue = !showHintClue)}
								class="rounded border border-border bg-secondary px-3 py-1 text-xs font-black transition-transform hover:scale-105"
							>
								💡 {showHintClue ? 'Hide Hint' : 'Show Hint'}
							</button>

							<button
								type="button"
								onclick={() => (sessionNegativeSpace = !sessionNegativeSpace)}
								class="rounded border border-border px-3 py-1 text-xs font-black transition-transform hover:scale-105 {sessionNegativeSpace ? 'bg-main text-ink' : 'bg-surface text-ink/70'}"
								title="View shape as a hole in surrounding land (Negative Space)"
							>
								🕳️ {sessionNegativeSpace ? 'Standard Mode' : 'Negative Space Hole'}
							</button>
						</div>
					{/if}

					{#if showHintClue && !revealedAnswer}
						<div class="flex flex-wrap items-center justify-center gap-3 rounded border-2 border-border bg-surface p-3 text-xs font-bold shadow-shadow">
							<span>Category: <strong>{t(`category.${currentCard.categoryId}` as 'category.0')}</strong></span>
							<span>First letter: <strong>{currentCard.name.charAt(0).toUpperCase()}</strong></span>
							{#if currentCard.capital}
								<span>Capital: <strong>{currentCard.info?.capital ?? 'Yes'}</strong></span>
							{/if}
						</div>
					{/if}

					<!-- Reveal / Answer Area -->
					{#if revealedAnswer}
						<div class="flex flex-col gap-1 animate-fade-in">
							<h3 class="text-2xl font-black text-emerald-500">
								{i18n.locale === 'de' ? currentCard.nameDe : currentCard.name}
							</h3>
							{#if currentCard.info?.capital}
								<p class="text-xs font-bold text-ink/70">🏛️ Capital: {currentCard.info.capital}</p>
							{/if}
						</div>
					{/if}

					<!-- Guess Input form (if not revealed yet) -->
					{#if !revealedAnswer}
						<form onsubmit={(e) => { e.preventDefault(); handleTypedGuess(); }} class="flex w-full gap-2 pt-2">
							<Input
								placeholder="Type your guess…"
								bind:value={typedGuess}
								autofocus
							/>
							<Button type="submit" variant="default">Submit</Button>
							<Button type="button" variant="neutral" onclick={() => (revealedAnswer = true)}>Reveal</Button>
						</form>

						{#if guessVerdict === Verdict.WRONG || guessVerdict === Verdict.CLOSE}
							<p class="text-xs font-extrabold text-red-500">
								{guessVerdict === Verdict.CLOSE ? '🔥 Very close! Try again or reveal.' : '❌ Not quite! Try again.'}
							</p>
						{/if}
					{/if}
				</Card>

				<!-- SRS Self-Rating Buttons (Shown once revealed) -->
				{#if revealedAnswer}
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
						<button
							type="button"
							onclick={() => handleRating('again')}
							class="flex flex-col items-center justify-center rounded-base border-2 border-border bg-red-500 p-3 text-white shadow-shadow transition-transform hover:scale-105"
						>
							<span class="text-sm font-black">🔴 Again</span>
							<span class="text-[11px] font-bold opacity-90">&lt;1 min</span>
						</button>

						<button
							type="button"
							onclick={() => handleRating('hard')}
							class="flex flex-col items-center justify-center rounded-base border-2 border-border bg-amber-500 p-3 text-white shadow-shadow transition-transform hover:scale-105"
						>
							<span class="text-sm font-black">🟠 Hard</span>
							<span class="text-[11px] font-bold opacity-90">Short</span>
						</button>

						<button
							type="button"
							onclick={() => handleRating('good')}
							class="flex flex-col items-center justify-center rounded-base border-2 border-border bg-emerald-500 p-3 text-white shadow-shadow transition-transform hover:scale-105"
						>
							<span class="text-sm font-black">🟢 Good</span>
							<span class="text-[11px] font-bold opacity-90">Standard</span>
						</button>

						<button
							type="button"
							onclick={() => handleRating('easy')}
							class="flex flex-col items-center justify-center rounded-base border-2 border-border bg-blue-500 p-3 text-white shadow-shadow transition-transform hover:scale-105"
						>
							<span class="text-sm font-black">🔵 Easy</span>
							<span class="text-[11px] font-bold opacity-90">Long / Mastered</span>
						</button>
					</div>
				{/if}
			</div>
		{/if}
	{/if}

	<!-- ================= TAB 4: SHAPE FAMILY CLUSTERS ================= -->
	{#if activeTab === 'families'}
		<div class="flex flex-col gap-6">
			<Card class="p-4">
				<h3 class="text-lg font-black">🧩 Lookalike Shape Family Clusters</h3>
				<p class="text-xs font-bold text-ink/60">
					Learn to distinguish easily confused shapes like the Central America strip, Balkan cluster, Horn of Africa, and more.
				</p>
			</Card>

			<div class="flex flex-col gap-6">
				{#each SHAPE_FAMILIES as family (family.id)}
					<Card class="flex flex-col gap-4 p-5">
						<div class="flex flex-wrap items-center justify-between gap-2 border-b-2 border-border pb-3">
							<div>
								<h3 class="text-xl font-black">{i18n.locale === 'de' ? family.name.de : family.name.en}</h3>
								<p class="text-xs font-bold text-ink/60">
									{i18n.locale === 'de' ? family.description.de : family.description.en}
								</p>
							</div>
							<Button variant="default" size="sm" onclick={() => addClusterToDeck(family)}>
								⚡ Study This Cluster in Deck
							</Button>
						</div>

						<!-- Shapes Comparison Grid -->
						<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
							{#each family.shapes as shapeInfo (shapeInfo.name)}
								{@const categoryObj = getCategory(family.categoryId)}
								{@const shapeData = categoryObj?.shapes.find((s: Shape) => s.name.toLowerCase() === shapeInfo.name.toLowerCase())}
								<div class="flex flex-col justify-between rounded-base border-2 border-border bg-bg p-3 shadow-shadow">
									<div class="flex flex-col gap-2">
										<h4 class="text-sm font-black">{shapeInfo.name}</h4>
										{#if shapeData}
											<div class="flex h-28 w-full items-center justify-center rounded border border-border bg-[#0f172a] p-2">
												<svg viewBox={categoryObj?.viewBox ?? '0 0 1000 1000'} class="h-full w-full max-h-full max-w-full drop-shadow">
													<path d={shapeData.path} fill="#38bdf8" stroke="#ffffff" stroke-width="2" />
												</svg>
											</div>
										{/if}
									</div>
									<div class="mt-2 rounded bg-surface p-2 text-xs font-bold text-ink/80 border border-border">
										💡 <span class="italic">{i18n.locale === 'de' ? shapeInfo.tip.de : shapeInfo.tip.en}</span>
									</div>
								</div>
							{/each}
						</div>
					</Card>
				{/each}
			</div>
		</div>
	{/if}
</div>
