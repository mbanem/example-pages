import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	build: {
		sourcemap: true,
	},
	server: {
		sourcemapIgnoreList: () => false,
	},
	css: {
		preprocessorOptions: {
			scss: {
				additionalData: `
					@use '$styles/variables' as *;
					@use '$styles/mixins' as *;
				`,
			},
		},
	},
	plugins: [sveltekit()],
});
