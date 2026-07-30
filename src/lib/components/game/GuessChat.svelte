<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ReactionButton from '$lib/components/game/ReactionButton.svelte';
	import ReactionOverlay from '$lib/components/game/ReactionOverlay.svelte';
	import { Send } from '@lucide/svelte';
	import { game } from '$lib/ws.svelte';
	import { t } from '$lib/i18n/index.svelte';
	import { playerColor } from '$lib/playerColors';
	import { playCorrect, playClose, playWrong, playSolved, unlockAudio } from '$lib/sound';

	let text = $state('');
	let listEl = $state<HTMLDivElement | null>(null);
	let inputEl = $state<HTMLInputElement | null>(null);
	let banner = $state<{ kind: 'correct' | 'close'; until: number } | null>(null);

	const mySolved = $derived(
		game.room?.players.find((p) => p.id === game.playerId)?.solved ?? false
	);
	const roundLive = $derived(game.round !== null && !game.roundResult);

	$effect(() => {
		const v = game.verdict;
		if (v && (v.value === 'correct' || v.value === 'close')) {
			banner = { kind: v.value, until: v.at + 1600 };
			const id = setTimeout(() => (banner = null), 1600);
			if (v.value === 'correct') playCorrect();
			else playClose();
			return () => clearTimeout(id);
		}
		if (v?.value === 'wrong') playWrong();
	});

	// Play a sound when any other player solves the round.
	// Reset the baseline whenever the round changes so stale chat entries
	// from the previous round don't retrigger the sound.
	let _solvedSoundRound = 0;
	let _solvedSoundLen = 0;
	$effect(() => {
		const round = game.round?.round ?? 0;
		if (round !== _solvedSoundRound) {
			_solvedSoundRound = round;
			_solvedSoundLen = game.chat.length;
			return;
		}
		const entries = game.chat;
		const newEntries = entries.slice(_solvedSoundLen);
		_solvedSoundLen = entries.length;
		for (const e of newEntries) {
			if (e.kind === 'solved' && e.playerId !== game.playerId) {
				playSolved();
				break;
			}
		}
	});

	$effect(() => {
		game.chat.length;
		if (listEl) listEl.scrollTop = listEl.scrollHeight;
	});

	$effect(() => {
		if (roundLive && inputEl) inputEl.focus();
	});

	function submit() {
		const value = text.trim();
		if (!value || !roundLive) return;
		unlockAudio();
		if (mySolved) game.say(value);
		else game.guess(value);
		text = '';
	}
</script>

<div class="relative flex h-full flex-col gap-3">
	<ReactionOverlay />
	<div
		bind:this={listEl}
		class="min-h-0 flex-1 space-y-1.5 overflow-y-auto rounded-base border-2 border-border bg-surface p-3 text-sm shadow-shadow"
	>
		{#each game.chat as entry (entry.id)}
			{#if entry.kind === 'divider'}
				<div class="flex items-center gap-2 py-0.5">
					<span class="h-0.5 flex-1 rounded bg-border/50"></span>
					<span class="text-[10px] font-extrabold tracking-wide text-ink/50 uppercase">
						{entry.variant === 'lobby'
							? t('chat.lobbyDivider')
							: t('chat.roundDivider', { round: entry.round ?? 0 })}
					</span>
					<span class="h-0.5 flex-1 rounded bg-border/50"></span>
				</div>
			{:else if entry.kind === 'solved'}
				<p class="text-center font-bold text-main-accent">
					✓ {t('game.solvedBy', { name: entry.name ?? '' })}
				</p>
			{:else}
				{@const mine = entry.playerId != null && entry.playerId === game.playerId}
				<div class="flex {mine ? 'justify-end' : 'justify-start'}">
					<div
						class="max-w-[85%] rounded-base border-2 border-border px-2.5 py-1 {mine ? 'bg-main' : ''}"
						style={mine ? undefined : `background-color: ${playerColor(entry.playerId)}`}
					>
						{#if !mine}
							<span class="text-[10px] font-bold text-ink/50">{entry.name}</span>
						{/if}
						<p class="leading-snug break-words">{entry.text}</p>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	{#if banner}
		<p
			class="rounded-base border-2 border-border px-4 py-2 text-center font-black tracking-wide shadow-shadow uppercase animate-bounce transition-all {banner.kind ===
			'correct'
				? 'bg-main text-ink scale-105'
				: 'bg-secondary text-ink scale-100'}"
		>
			{banner.kind === 'correct' ? t('game.correct') : t('game.close')}
		</p>
	{/if}

	<form class="flex items-stretch gap-2" onsubmit={(e) => (e.preventDefault(), submit())}>
		<div class="min-w-0 flex-1">
			<Input
				bind:element={inputEl}
				bind:value={text}
				placeholder={mySolved ? t('game.solvedChatPlaceholder') : t('game.guessPlaceholder')}
				disabled={!roundLive}
				maxlength={mySolved ? 120 : 40}
				aria-label={mySolved ? t('game.solvedChatPlaceholder') : t('game.guessPlaceholder')}
			/>
		</div>
		<ReactionButton />
		<Button
			type="submit"
			size="icon"
			aria-label={t('game.send')}
			title={t('game.send')}
			disabled={!roundLive || text.trim().length === 0}
		>
			<Send size={20} strokeWidth={2.5} aria-hidden="true" />
		</Button>
	</form>
</div>
