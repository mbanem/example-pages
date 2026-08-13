<script lang="ts">
	import FlakyComponent from './FlakyComponent.svelte';
	function delayed(value, milliseconds = 3000) {
		return new Promise((resolve) => {
			setTimeout(() => resolve(value), milliseconds);
		});
	}
	// ------------------------------------------------
	// let failed = $state<boolean>(false);
	// let errorMessage = $state<string>('');

	// function explode(): void {
	// 	// Intentionally throw an error
	// 	throw new Error('💥 Boom! The button exploded!');
	// }

	// function reset(): void {
	// 	failed = false;
	// 	errorMessage = '';
	// }

	// function handleError(err: unknown): void {
	// 	// Safely extract message
	// 	if (err instanceof Error) {
	// 		errorMessage = err.message;
	// 	} else {
	// 		errorMessage = String(err);
	// 	}
	// 	failed = true;
	// }
</script>

<h1>Svelte 5 Boundary Demo (TypeScript)</h1>
<p>Using Flaky Component</p>
<svelte:boundary>
	<p>{await delayed('hello! -- after waiting for 3 seconds')}</p>

	{#snippet pending()}
		<p>loading...</p>
	{/snippet}
</svelte:boundary>

<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<button onclick={reset}>oops! try again</button>
	{/snippet}
</svelte:boundary>

<!-- <p>Using error handler</p>
<svelte:boundary onerror={handleError}>
	{#if !failed}
		<div class="box">
			<p>This is inside the boundary.</p>
			<button onclick={explode}>Throw Error</button>
		</div>
	{:else}
		<div class="error">
			<h2>🚨 Error Caught</h2>
			<p>{errorMessage}</p>
			<button onclick={reset}>Reset</button>
		</div>
	{/if}
</svelte:boundary> -->

<style>
	.box {
		border: 2px solid #77a;
		padding: 1rem;
		border-radius: 8px;
	}

	.error {
		border: 2px solid red;
		background: #fee;
		padding: 1rem;
		border-radius: 8px;
	}
</style>
