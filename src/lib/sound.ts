/**
 * Synthesized sound engine using the Web Audio API.
 *
 * All sounds are generated programmatically — no audio files needed.
 * Volume and mute state are read from the settings store on every play call,
 * so changes take effect immediately without re-initialising anything.
 */

import { browser } from '$app/environment';
import { settings } from '$lib/stores/settings.svelte';

// Lazily created so we never touch AudioContext before a user gesture.
let _ctx: AudioContext | null = null;

function ctx(): AudioContext | null {
	if (!browser) return null;
	if (!_ctx) {
		try {
			_ctx = new AudioContext();
		} catch {
			return null;
		}
	}
	// Resume if the browser suspended it (autoplay policy).
	if (_ctx.state === 'suspended') _ctx.resume();
	return _ctx;
}

/** Master gain — every sound routes through this so mute/volume apply globally. */
let _master: GainNode | null = null;

function master(): GainNode | null {
	const ac = ctx();
	if (!ac) return null;
	if (!_master) {
		_master = ac.createGain();
		_master.connect(ac.destination);
	}
	_master.gain.setTargetAtTime(
		settings.soundOn ? settings.volume : 0,
		ac.currentTime,
		0.01
	);
	return _master;
}

// ─── Low-level helpers ──────────────────────────────────────────────────────

type OscType = OscillatorType;

interface Note {
	freq: number;
	type?: OscType;
	gain?: number;
	start: number; // seconds from now
	duration: number; // seconds
	/** Optional ramp: gain goes from `gain` down to this value over the duration */
	endGain?: number;
}

function playNotes(notes: Note[]): void {
	const ac = ctx();
	const out = master();
	if (!ac || !out) return;

	const now = ac.currentTime;
	for (const n of notes) {
		const osc = ac.createOscillator();
		const g = ac.createGain();

		osc.type = n.type ?? 'sine';
		osc.frequency.setValueAtTime(n.freq, now + n.start);

		const vol = n.gain ?? 1;
		g.gain.setValueAtTime(0, now + n.start);
		g.gain.linearRampToValueAtTime(vol, now + n.start + 0.005); // 5 ms attack
		if (n.endGain !== undefined) {
			g.gain.linearRampToValueAtTime(n.endGain, now + n.start + n.duration);
		} else {
			// Short release at the end
			g.gain.setValueAtTime(vol, now + n.start + n.duration - 0.02);
			g.gain.linearRampToValueAtTime(0, now + n.start + n.duration);
		}

		osc.connect(g);
		g.connect(out);
		osc.start(now + n.start);
		osc.stop(now + n.start + n.duration + 0.01);
	}
}

function noise(
	startOffset: number,
	duration: number,
	peakGain = 0.15,
	type: BiquadFilterType = 'bandpass',
	freq = 800
): void {
	const ac = ctx();
	const out = master();
	if (!ac || !out) return;

	const bufSize = Math.ceil(ac.sampleRate * duration);
	const buf = ac.createBuffer(1, bufSize, ac.sampleRate);
	const data = buf.getChannelData(0);
	for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;

	const src = ac.createBufferSource();
	src.buffer = buf;

	const filt = ac.createBiquadFilter();
	filt.type = type;
	filt.frequency.value = freq;
	filt.Q.value = 1;

	const g = ac.createGain();
	const now = ac.currentTime;
	g.gain.setValueAtTime(peakGain, now + startOffset);
	g.gain.exponentialRampToValueAtTime(0.0001, now + startOffset + duration);

	src.connect(filt);
	filt.connect(g);
	g.connect(out);
	src.start(now + startOffset);
	src.stop(now + startOffset + duration + 0.01);
}

// ─── Sound definitions ──────────────────────────────────────────────────────

/** Short rising two-tone: answer was correct. */
export function playCorrect(): void {
	playNotes([
		{ freq: 523, type: 'triangle', gain: 0.35, start: 0,    duration: 0.12 },
		{ freq: 659, type: 'triangle', gain: 0.35, start: 0.1,  duration: 0.12 },
		{ freq: 784, type: 'triangle', gain: 0.40, start: 0.2,  duration: 0.20, endGain: 0 }
	]);
}

/** Warm single note with a soft "almost" feeling. */
export function playClose(): void {
	playNotes([
		{ freq: 440, type: 'sine', gain: 0.30, start: 0,   duration: 0.10 },
		{ freq: 392, type: 'sine', gain: 0.20, start: 0.08, duration: 0.12, endGain: 0 }
	]);
}

/** Low dull thud: wrong answer. */
export function playWrong(): void {
	playNotes([
		{ freq: 220, type: 'sawtooth', gain: 0.18, start: 0, duration: 0.08, endGain: 0 }
	]);
	noise(0, 0.07, 0.08, 'lowpass', 300);
}

/** Triumphant four-note fanfare: another player solved (or you solved). */
export function playSolved(): void {
	playNotes([
		{ freq: 523, type: 'square', gain: 0.20, start: 0,    duration: 0.09 },
		{ freq: 659, type: 'square', gain: 0.20, start: 0.10, duration: 0.09 },
		{ freq: 784, type: 'square', gain: 0.20, start: 0.20, duration: 0.09 },
		{ freq: 1047, type: 'square', gain: 0.22, start: 0.30, duration: 0.22, endGain: 0 }
	]);
}

/** Soft tick for each countdown second. */
export function playTick(): void {
	playNotes([
		{ freq: 1200, type: 'sine', gain: 0.18, start: 0, duration: 0.04, endGain: 0 }
	]);
}

/** Punchy "GO!" accent at the end of the countdown. */
export function playGo(): void {
	playNotes([
		{ freq: 880,  type: 'triangle', gain: 0.40, start: 0,    duration: 0.08 },
		{ freq: 1100, type: 'triangle', gain: 0.45, start: 0.07, duration: 0.16, endGain: 0 }
	]);
	noise(0, 0.12, 0.12, 'highpass', 2000);
}

/** Bright arpeggio sweep: a new round is starting. */
export function playRoundStart(): void {
	const freqs = [392, 494, 587, 740];
	playNotes(
		freqs.map((freq, i) => ({
			freq,
			type: 'triangle' as OscType,
			gain: 0.25,
			start: i * 0.07,
			duration: 0.14,
			endGain: 0
		}))
	);
}

/** Victory jingle: game is over. */
export function playGameOver(): void {
	// Chord swell
	const chord = [523, 659, 784, 1047];
	playNotes(
		chord.map((freq, i) => ({
			freq,
			type: 'sine' as OscType,
			gain: 0.20 + i * 0.02,
			start: 0.1 + i * 0.06,
			duration: 1.2,
			endGain: 0
		}))
	);
	// Rising melody over it
	const melody: [number, number][] = [
		[523, 0],
		[587, 0.18],
		[659, 0.36],
		[784, 0.54],
		[880, 0.72],
		[1047, 0.9]
	];
	playNotes(
		melody.map(([freq, start]) => ({
			freq,
			type: 'triangle' as OscType,
			gain: 0.28,
			start,
			duration: 0.22,
			endGain: 0
		}))
	);
}

/** High energetic 5-note rising sweep: win streak bonus! */
export function playStreak(): void {
	const freqs = [523, 659, 784, 988, 1047];
	playNotes(
		freqs.map((freq, i) => ({
			freq,
			type: 'triangle' as OscType,
			gain: 0.35,
			start: i * 0.05,
			duration: 0.15,
			endGain: 0
		}))
	);
}

/** Urgent high warning pulse for last < 5 seconds of a round. */
export function playWarning(): void {
	playNotes([
		{ freq: 988, type: 'sawtooth', gain: 0.25, start: 0, duration: 0.06, endGain: 0 },
		{ freq: 1174, type: 'sawtooth', gain: 0.25, start: 0.08, duration: 0.08, endGain: 0 }
	]);
}

/** Soft pleasant 2-tone pop when a player joins the room. */
export function playJoin(): void {
	playNotes([
		{ freq: 440, type: 'sine', gain: 0.25, start: 0, duration: 0.08 },
		{ freq: 587, type: 'sine', gain: 0.30, start: 0.07, duration: 0.14, endGain: 0 }
	]);
}

/** Descending 2-tone pop when a player leaves the room. */
export function playLeave(): void {
	playNotes([
		{ freq: 587, type: 'sine', gain: 0.22, start: 0, duration: 0.08 },
		{ freq: 440, type: 'sine', gain: 0.18, start: 0.07, duration: 0.12, endGain: 0 }
	]);
}

/**
 * Call this on the first user interaction to unlock AudioContext on Safari/iOS.
 * Safe to call multiple times — it's a no-op after the first call.
 */
export function unlockAudio(): void {
	ctx(); // creates and (if needed) resumes the context
}
