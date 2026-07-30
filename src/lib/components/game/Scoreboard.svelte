<script lang="ts">
	import Avatar from '$lib/components/ui/Avatar.svelte';
	import type { PublicPlayer } from '$lib/ws.svelte';
	import { t } from '$lib/i18n/index.svelte';

	let {
		players,
		playerId,
		showSolved = false
	}: { players: PublicPlayer[]; playerId: string | null; showSolved?: boolean } = $props();

	const sorted = $derived([...players].sort((a, b) => b.score - a.score));
</script>

<ul class="flex flex-col gap-2">
	{#each sorted as p, i (p.id)}
		<li class="flex items-center gap-2">
			<div
				class="flex min-w-0 flex-1 items-center gap-2.5 rounded-base border-2 border-border px-3 py-2 shadow-shadow transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none {showSolved &&
				p.solved
					? 'bg-main shadow-none'
					: 'bg-surface'} {p.connected ? '' : 'opacity-50'}"
			>
				<span class="text-xs font-black text-ink/40 w-4 text-center">{i + 1}</span>
				<Avatar
					style={p.avatar}
					seed={p.name}
					size={32}
					alt={p.name}
					class="shrink-0 rounded-base border-2 border-border bg-bg shadow-sm"
				/>
				<span class="truncate font-black tracking-tight">{p.name}</span>
				{#if p.isHost}
					<span class="rounded border-2 border-border bg-secondary px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
						{t('lobby.host')}
					</span>
				{/if}
				{#if p.id === playerId}
					<span class="text-[10px] font-black text-ink/50 uppercase tracking-wide">{t('lobby.you')}</span>
				{/if}
				<span class="ml-auto font-black text-base tabular-nums">{p.score}</span>
			</div>
			{#if showSolved}
				<span class="w-12 shrink-0 text-right text-sm font-black text-main-accent tabular-nums">
					{#if p.solved}+{p.roundPoints}{/if}
				</span>
			{/if}
		</li>
	{/each}
</ul>
