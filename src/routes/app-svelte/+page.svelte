<!-- App.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';

	let ActivePage = $state<any>(null);
	let isLoading = $state(true);
	let errorMessage = $state('');
	// Capitalize the state variable so it can be used directly as a tag
	const pages = import.meta.glob('./*.svelte', { eager: true });

	function loadPage(pageName: string) {
		isLoading = true;
		errorMessage = '';
		try {
			const targetPath = `./${pageName}.svelte`;
			if (pages[targetPath]) {
				ActivePage = (pages[targetPath] as any).default;
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log(msg);
		} finally {
			isLoading = false;
		}
	}
	onMount(() => {
		loadPage('Home'); // Load default page on mount
	});
</script>

<div class="webview-container">
	<nav>
		<button onclick={() => loadPage('Home')}>Home</button>
		<button onclick={() => loadPage('Settings')}>Settings</button>
	</nav>

	<main>
		{#if ActivePage}
			<!-- Svelte 5 mounts the component directly without <svelte:component> -->
			<ActivePage />
		{:else}
			<p>Loading page...</p>
		{/if}
	</main>
</div>
<p>{errorMessage}</p>
<p>isLoadng? {isLoading}</p>
