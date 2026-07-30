<script lang="ts">
	import '../../app.css';
	import type { Snippet } from 'svelte';
	import { page } from '$app/state';
	import { scale, fade } from 'svelte/transition';
	import { backOut } from 'svelte/easing';
	import SettingsMenu from '$lib/components/SettingsMenu.svelte';

	let { children }: { children: Snippet } = $props();

	let copied = $state(false);
	async function copyCode() {
		try {
			await navigator.clipboard.writeText('demo');
			copied = true;
			setTimeout(() => (copied = false), 1200);
		} catch {}
	}
</script>

<div class="flex h-svh flex-col items-center justify-center">
	<div class="flex h-full max-h-[900px] w-full max-w-3xl flex-col overflow-hidden px-4 py-4">
		<header class="mb-4 flex shrink-0 items-center justify-between">
			<a href="/" class="flex items-center gap-2">
				<span
					class="flex h-11 items-center rounded-base border-2 border-border bg-main px-3 text-2xl font-extrabold shadow-shadow"
				>
					GeoShape
				</span>
			</a>

			<button
				onclick={copyCode}
				title="demo"
				class="flex h-11 items-center rounded-base border-2 border-border bg-surface px-3 font-extrabold tracking-[0.25em] shadow-shadow transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
			>
				<span class="mr-1 text-ink/40">{copied ? '✓' : '#'}</span>demo
			</button>
		</header>

		<main class="relative flex min-h-0 flex-1 flex-col">
			{#key page.url.pathname}
				<div
					class="absolute inset-0 flex flex-col"
					in:scale={{ start: 0.97, opacity: 0, duration: 200, easing: backOut }}
					out:fade={{ duration: 110 }}
				>
					{@render children()}
				</div>
			{/key}
		</main>
	</div>
</div>

<SettingsMenu />
