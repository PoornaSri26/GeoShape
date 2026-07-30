import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin, type PluginOption } from 'vite';
import { attachWebSocketServer } from './server/index.js';

const webSocketServer: Plugin = {
  name: 'geo-shape-websocket',
  configureServer(server) {
    if (server.httpServer) attachWebSocketServer(server.httpServer, { dev: true });
  },
  configurePreviewServer(server) {
    if (server.httpServer) attachWebSocketServer(server.httpServer);
  }
};

export default defineConfig(({ command }) => {
  const isBuild = command === 'build';
  const plugins: PluginOption[] = [tailwindcss(), sveltekit()];
  if (!isBuild) {
    plugins.push(webSocketServer);
  }
  return {
    plugins,
  };
});