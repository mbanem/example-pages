<script lang="ts">
	import { onMount } from 'svelte';
	import RadioButtonGroupTooltip from './RadioButtonGroupTooltip.svelte';
	import type { TProps } from './RadioButtonGroupTooltip.svelte';
	// let listContainerEl: HTMLDivElement | null = null;
	const listContainerId = 'listContainerId';
	const RBGProps: TProps = {
		callback: radioSelected,
		radioButtons: {
			Login: 'L',
			Register: 'R',
			Both: 'LR',
		},
		listContainerId,
	};
	function radioSelected(val: string) {
		console.log('radio button selected', val);
	}
	onMount(() => {
		// listContainerEl = document.getElementById('listContainerId') as HTMLDivElement;
	});
</script>

<div id="listContainerId">
	{#each Array(8) as _, i (10 * i)}
		<p>field number {i + 10}</p>
	{/each}
	<RadioButtonGroupTooltip {...RBGProps}></RadioButtonGroupTooltip>
</div>

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
	}
</style>
