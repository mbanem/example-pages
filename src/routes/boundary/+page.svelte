<script lang="ts">
	import FlakyComponent from './FlakyComponent.svelte';
	type TPromise = Record<string, number>;
	let obj: TPromise = $state<TPromise>({});

	function delayed(value: string, milliseconds = 3000) {
		const start = performance.now();
		return new Promise((resolve) => {
			setTimeout(() => resolve([value, performance.now() - start]), milliseconds);
		});
	}
</script>

<svelte:boundary>
	<p>{(obj = (await delayed('hello! -- after waiting for ')) as TPromise)}</p>
	{#snippet pending()}
		<p style="color:red">loading...</p>
	{/snippet}
</svelte:boundary>

<svelte:boundary>
	<FlakyComponent />

	{#snippet failed(error, reset)}
		<pre style="color:tomato;">
		An excepton occured inside a Svelte boundary block by setting the mouse = $state() to 
		unacceptable null. The state could be restored by selecting this button

		error: {error}
		<button onclick={reset} style="margin:0.5rem 0 0 6.5rem;width:15rem;">Exception happened! try again</button>
		</pre>
	{/snippet}
</svelte:boundary>
<!-- <p>loaded in {end - start} milliseconds</p> -->
<p>Greeting {obj[0]} {obj[1]} ms</p>
<!-- <p>{obj.value} after {obj.elapsed}ms</p> -->
<pre class="header">
As of Svelte 5 compiler version 5.46.1 in order to use await delayed inside 
the &lt;sv elte:boundary the svelte,config.js should have compilerOptions 
experimantals set to true
<pre class="content">
import adapter from &commat;sveltejs&sol;adapter-auto
import &lcub; vitePreprocess &rcub; from &commat;sveltejs&sol;vite-plugin-svelte'

&sol;** &commat;type &lcub;import(&commat;sveltejs&sol;kit').Config&rcub; *&sol;
const config = &lcub;
	&sol;&sol; Consult https:&sol;&sol;svelte.dev&sol;docs&sol;kit&sol;integrations
	&sol;&sol; for more information about preprocessors
	preprocess: [
		vitePreprocess(&lcub; script: true &rcub;),
	],
	kit: &lcub;
		&sol;&sol; adapter-auto only supports some environments, see https:&sol;&sol;svelte.dev&sol;docs&sol;kit&sol;adapter-auto for a list.
		&sol;&sol; If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		&sol;&sol; See https:&sol;&sol;svelte.dev&sol;docs&sol;kit&sol;adapters for more information about adapters.
		adapter: adapter(),
		alias: &lcub;
			$lib: '.&sol;src&sol;lib&sol;',
			&sol;&sol; must define $styles alias as vite.config cannot find '.&sol;src&sol;styles'
			&sol;&sol; in this version
			$styles: '.&sol;src&sol;styles&sol;',
		&rcub;
	&rcub;,
	compilerOptions: &lcub;
		experimental: &lcub;
			async: true, &sol;&sol; Enable the experimental async feature
		&rcub;,
	&rcub;,
&rcub;

export default config
</pre>
</pre>

<style lang="scss">
	.header {
		color: navy;
	}
	.content {
		color: darkblue;
		margin-left: 2rem;
	}
	pre {
		font-size: 13px;
		tab-size: 16px;
	}
	/* as a button exists inside a snippet not visiible
		initially, it must be considered dynamic like when
		built from HTML markup programmatically so the CSS
		classes for it must be defined :global(...)
	*/
	:global(button) {
		margin-left: 3rem;
	}
</style>
