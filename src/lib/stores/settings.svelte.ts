import { browser } from '$app/environment';

const STORAGE_KEY = 'geoshape:settings';

class Settings {
	soundOn = $state(true);
	volume = $state(0.6);
	dark = $state(false);

	constructor() {
		if (!browser) return;
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const p = JSON.parse(raw) as { soundOn?: boolean; volume?: number; dark?: boolean };
				if (typeof p.soundOn === 'boolean') this.soundOn = p.soundOn;
				if (typeof p.volume === 'number') this.volume = clamp01(p.volume);
				if (typeof p.dark === 'boolean') this.dark = p.dark;
			}
		} catch {
		}
	}

	setSound(on: boolean): void {
		this.soundOn = on;
		this.persist();
	}

	toggleSound(): void {
		this.setSound(!this.soundOn);
	}

	setVolume(v: number): void {
		this.volume = clamp01(v);
		this.persist();
	}

	setDark(dark: boolean): void {
		this.dark = dark;
		this.persist();
	}

	toggleDark(): void {
		this.setDark(!this.dark);
	}

	private persist(): void {
		if (!browser) return;
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify({ soundOn: this.soundOn, volume: this.volume, dark: this.dark }));
		} catch {
		}
	}
}

function clamp01(v: number): number {
	if (!Number.isFinite(v)) return 0;
	return Math.min(1, Math.max(0, v));
}

export const settings = new Settings();

// Update dark mode class on html element when dark setting changes
if (browser) {
	$effect.root(() => {
		$effect(() => {
			if (settings.dark) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		});
	});
}
