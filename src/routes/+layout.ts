// Disable SSR for the entire app — GeoShape is a real-time WebSocket game
// that relies on browser APIs and Svelte 5 $state runes at module scope.
export const ssr = false;
