<script lang="ts">
	import { goto } from '$app/navigation'
	import type { ComponentProps, Snippet } from 'svelte'
	type ARGS = {
		colorName?: string
		title: string
		href: string
		media: Snippet
	}
	let { colorName, title, href = '', media }: ARGS = $props()
</script>

<div class="chip" onclick={() => goto(`${href}`)} aria-hidden={true}>
	{@render media()}
	{title}
</div>

<style>
	.chip {
		align-items: center;
		border: solid 1px gray;
		border-radius: 8px;
		display: inline-flex;
		height: 32px;
		padding: 0 8px;
		cursor: pointer;
	}
	/* a {
		text-decoration: none;
		margin: 0;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 5px;
		color: transparent;
		background-color: transparent;
	} */
</style>
