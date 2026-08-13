<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventHandler } from './event-handler.ts';

	const eventHandler = createEventHandler();

	function handleClick(e: MouseEvent) {
		// console.log('Clicked!', e.target);
	}

	function handleMouseOver(e: MouseEvent) {
		// console.log('Over!', e.target);
	}
	function handleMouseOut(e: MouseEvent) {
		// console.log('Out!', e.target);
	}

	onMount(() => {
		eventHandler.setup('.middle-column', {
			click: handleClick,
			mouseover: handleMouseOver,
			mouseout: handleMouseOut,
		});

		const middleColumn = document.querySelector('.middle-column') as HTMLElement | null;
		if (!middleColumn) return;
		const children = Array.from(middleColumn.children);
		// console.log('before click');

		for (const child of children) {
			if (child instanceof HTMLElement) {
				child.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			}
		}
		// console.log('after click');

		return () => eventHandler.destroy();
	});
</script>

// some-component.svelte
<div class="middle-column">
	<div data-event-list="click mouseout">Click & mouseout</div>
	<div data-event-list="click">Only clickable</div>
	<div data-event-list="click mouseover mouseout">click mouseover mouseout</div>
</div>

<style lang="scss">
	.middle-column {
		padding: 1rem;
		width: max-content;
		border: 1px solid gray;
		border-radius: 8px;
		background-color: cornsilk;
		div {
			padding: 1px 0;
			margin-top: 5px;
			cursor: pointer;
			&:hover {
				background-color: skyblue;
			}
		}
	}
</style>
