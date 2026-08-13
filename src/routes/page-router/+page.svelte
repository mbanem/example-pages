<script lang="ts">
	import RedThing from './RedThing.svelte';
	import GreenThing from './GreenThing.svelte';
	import BlueThing from './BlueThing.svelte';
	// import { type Component } from 'svelte';
	type TPage = Record<string, typeof RedThing>;
	let key = $state('');
	const pages: TPage = {
		PinkThing: RedThing,
		LightGreenThing: GreenThing,
		SkyBlueThing: BlueThing,
	};
	// let current = $state({ component: pages[key_()] });
	let current = $derived({ component: pages[key] });
	let fixed = { component: pages.PinkThing };
	let color = $derived(key.slice(0, -5).toLowerCase());
</script>

<div class="container">
	<select bind:value={key}>
		<option value="" disabled selected hidden>Please Select Page</option>
		{#each Object.keys(pages) as key (key)}
			<option value={key}>Page {key}</option>
		{/each}
	</select>
	<br />
	{#if key}
		<p>Loading and rendering selected component</p>
		<current.component {color}></current.component>
	{/if}
	<br />
	{#if key}
		<p>Using fixed component just changing color</p>
		<fixed.component {color}></fixed.component>
	{/if}
</div>

<style lang="scss">
	.container {
		margin: 4rem 0 0 20rem;
	}
	:global(.rectangle) {
		display: inline-block;
		width: 22rem;
		height: 3rem;
		border: 4px solid black;
		border-radius: 6px;
		background-color: #5e5e5e;
		text-align: center;
		font-size: 24px;
		line-height: 2.8rem;
		vertical-align: top;
		outline: 2px solid yellow;
	}
</style>
