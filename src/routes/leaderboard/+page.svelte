<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { game } from '$lib/ws.svelte';
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import { i18n, t } from '$lib/i18n/index.svelte';
	import { animateOnScroll } from '$lib/actions/animateOnScroll';

	const nf = $derived(new Intl.NumberFormat(i18n.locale === 'de' ? 'de-DE' : 'en-US'));
	const medals = ['🥇', '🥈', '🥉'];
	let timeframe = $state<'today' | 'week' | 'month' | 'all'>('all');
	const timeframes: ('today' | 'week' | 'month' | 'all')[] = ['today', 'week', 'month', 'all'];

	onMount(() => {
		game.requestLeaderboard();
	});
</script>

<Card class="p-6">
  <div use:animateOnScroll={{ animationType: 'fade-up' }}>
	<h1 class="mb-4 text-2xl font-extrabold">{t('leaderboard.title')}</h1>

	<!-- Timeframe tabs -->
	<div class="mb-4 flex gap-2">
		{#each timeframes as tf}
			<button
				type="button"
				class="flex-1 rounded-base border-2 border-border px-3 py-1.5 text-xs font-extrabold transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none {timeframe ===
					tf
					? 'bg-main shadow-shadow'
					: 'bg-surface'}"
				onclick={() => (timeframe = tf)}
			>
				{tf.charAt(0).toUpperCase() + tf.slice(1)}
			</button>
		{/each}
	</div>

	{#if game.leaderboard.length === 0}
		<p class="py-8 text-center font-bold text-ink/50">{t('leaderboard.empty')}</p>
	{:else}
		<ol class="flex flex-col gap-2">
			{#each game.leaderboard as p, i (p.name + i)}
				<li 
					class="flex items-center gap-3 rounded-base border-2 border-border bg-bg px-3 py-2"
					use:animateOnScroll={{ animationType: 'fade-up', delay: i * 0.05 }}
				>
					<span class="w-7 text-center text-lg font-extrabold">{medals[i] ?? i + 1}</span>
					<Avatar
						style={p.avatar}
						seed={p.name}
						size={36}
						alt={p.name}
						class="rounded-base border-2 border-border bg-surface"
					/>
					<div class="flex flex-1 flex-col min-w-0">
						<span class="truncate font-black text-base">{p.name}</span>
						<span class="text-[10px] font-black text-ink/60 uppercase tracking-wide">
							{p.totalScore >= 500 ? '🏆 Geography Guru' : p.totalScore >= 250 ? '⭐ Shape Master' : p.totalScore >= 100 ? '🌍 Globe Trotter' : '🌱 Rookie'}
						</span>
					</div>
					<div class="flex gap-4 text-right text-sm font-bold tabular-nums">
						<div>
							<div class="text-base">{p.gamesWon}</div>
							<div class="text-[10px] text-ink/50 uppercase">{t('leaderboard.wins')}</div>
						</div>
						<div>
							<div class="text-base">{nf.format(p.totalScore)}</div>
							<div class="text-[10px] text-ink/50 uppercase">{t('leaderboard.score')}</div>
						</div>
						<div class="hidden sm:block">
							<div class="text-base">{p.gamesPlayed}</div>
							<div class="text-[10px] text-ink/50 uppercase">{t('leaderboard.games')}</div>
						</div>
					</div>
				</li>
			{/each}
		</ol>
	{/if}

	<div class="mt-6">
		<Button href="/" variant="neutral">{t('common.back')}</Button>
	</div>
</div>
</Card>
