<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { scale, fade } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import { t } from '$lib/i18n/index.svelte';
	import { missedDeck } from '$lib/stores/missedDeck.svelte';
	import SettingsMenu from '$lib/components/SettingsMenu.svelte';

	let { children }: { children: Snippet } = $props();

	const inRoom = $derived(page.url.pathname.startsWith('/room/'));
	const isSolo = $derived(page.url.searchParams.get('solo') === '1');
	const roomCode = $derived((page.params.code ?? '').toUpperCase());

	let copied = $state(false);
	async function copyCode() {
		try {
			await navigator.clipboard.writeText(roomCode);
			copied = true;
			setTimeout(() => (copied = false), 1200);
		} catch {
		}
	}
</script>

<div class="min-h-svh w-full flex flex-col items-center justify-start bg-bg py-6 px-4">
	<div class="flex w-full max-w-4xl flex-col">
		<header class="mb-6 flex shrink-0 items-center justify-between">
			<a href="/" class="flex items-center gap-2 group">
				<span
					class="flex h-12 items-center rounded-base border-2 border-border bg-main px-4 text-2xl font-black tracking-tight shadow-shadow transition-all group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none"
				>
					GeoShape
				</span>
			</a>

			{#if inRoom && isSolo}
				<span
					class="flex h-11 items-center rounded-base border-2 border-border bg-surface px-4 text-xs font-extrabold tracking-wider uppercase shadow-shadow"
				>
					{t('solo.badge')}
				</span>
			{:else if inRoom}
				<button
					onclick={copyCode}
					title={roomCode}
					class="flex h-11 items-center rounded-base border-2 border-border bg-surface px-4 font-extrabold tracking-[0.25em] shadow-shadow transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
				>
					<span class="mr-1.5 text-ink/40">{copied ? '✓' : '#'}</span>{roomCode}
				</button>
			{:else}
				<div class="flex items-center gap-2">
					<a
						href="/review"
						class="flex h-11 items-center gap-1.5 rounded-base border-2 border-border bg-surface px-4 text-sm font-bold shadow-shadow transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
					>
						<span>{t('nav.review')}</span>
						{#if missedDeck.dueCount > 0}
							<span class="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-black text-white">
								{missedDeck.dueCount}
							</span>
						{/if}
					</a>
					<a
						href="/leaderboard"
						class="flex h-11 items-center rounded-base border-2 border-border bg-surface px-4 text-sm font-bold shadow-shadow transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
					>
						{t('nav.leaderboard')}
					</a>
				</div>
			{/if}
		</header>

		<main class="relative flex w-full flex-1 flex-col">
			{#key page.url.pathname}
				<div
					class="w-full flex flex-col"
					in:scale={{ start: 0.98, opacity: 0, duration: 200, easing: backOut }}
					out:fade={{ duration: 100 }}
				>
					{@render children()}
				</div>
			{/key}
		</main>
	</div>
</div>

<SettingsMenu />
