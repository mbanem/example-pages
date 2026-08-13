<script lang="ts">
	import { onMount } from 'svelte';
	import { globalEH, toggleColorHandler } from '../+layout.svelte';
	type EType = MouseEvent | DragEvent | Event | DragEvent;
	// const globalEH = createGlobalEventHandler();
	// import { createGlobalEventHandler } from '$lib/eventHandlers';
	// import { createGlobalEventHandler } from '../grok-event-handler';

	// const globalEH = createGlobalEventHandler();   // or import the same instance if you make it singleton
	// ... your other handlers
	const forthColumn: Record<string, string> = {
		ONE: 'string',
		TWO: 'string',
		THREE: 'string',
		FOUR: 'string',
		FIVE: 'Role',
		SIX: 'Date',
	};
	function clickHandler(e: EType) {
		toggleColorHandler(e);
	}
	function mouseoverHandler(e: EType) {
		toggleColorHandler(e);
	}
	function mouseenterHandler(e: EType) {
		toggleColorHandler(e);
	}
	function mouseleaveHandler(e: EType) {
		toggleColorHandler(e);
	}
	function mouseoutHandler(e: EType) {
		toggleColorHandler(e);
	}
	function dropHandler(e: EType) {
		toggleColorHandler(e);
	}
	// let draggedEl: HTMLElement | null
	function dragStartHandler(e: EType) {
		console.log('handleDragStart');
	}
	function dragOverHandler(e: EType) {
		console.log('handleDragOver');
	}

	const handlersArr: Array<(e: EType) => void> = [
		clickHandler,
		dropHandler,
		dragOverHandler,
		dragStartHandler,
		dropHandler,
		mouseoutHandler,
		toggleColorHandler,
		clickHandler,
		mouseoverHandler,
		mouseenterHandler,
		mouseleaveHandler,
	];

	onMount(() => {
		globalEH.registerHandlers(handlersArr);
		globalEH.setup(); // optional, only if you want to use the built-in data-event-handler parsing
	});
</script>

<!-- Example markup -->
<div data-event-handler="click:clickHandler, mouseover:mouseoverHandler">Click or hover me</div>
<br />
<div data-event-handler="mouseenter:mouseenterHandler, mouseleave:mouseleaveHandler">mouse enter mouse leave</div>
<div
	data-event-handler="dragstart:dragStartHandler, dragover:dragOverHandler, drop:dropHandler, dragend:dragEndHandler"
	data-column="3"
>
	{#each Object.entries(forthColumn) as [title, list] (title)}
		<div draggable="true">{title} {list}</div>
	{/each}
</div>

<style lang="scss">
	.dd-column {
		border: 1px solid gray;
		border-radius: 10px;
		width: 10rem;
		padding: 1rem;
		color: var(--drag-color);
		div {
			/* width:100%; */
			background-color: cornsilk;
			margin: 4px 0 4px 0;
			padding: 2px 1rem;
			cursor: pointer;
			user-select: none;
			cursor: pointer;
			&:first-child {
				border-top-left-radius: 10px;
				border-top-right-radius: 10px;
			}
			&:last-child {
				border-bottom-left-radius: 10px;
				border-bottom-right-radius: 10px;
			}
		}
	}
</style>
