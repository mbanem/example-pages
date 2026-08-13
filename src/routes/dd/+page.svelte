<script lang="ts">
	import { onMount } from 'svelte';
	import { createGlobalEventHandler } from './event-handler';

	const globalEH = createGlobalEventHandler();

	// ====================== DRAG & DROP HELPERS ======================
	let draggedEl: HTMLElement | null = null;

	function handleDragStart(e: DragEvent) {
		draggedEl = e.currentTarget as HTMLElement;
		draggedEl.style.opacity = '0.5';
		e.dataTransfer?.setData('text/plain', ''); // needed for Firefox
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault(); // crucial for drop to work
	}

	function handleDragEnd(e: DragEvent) {
		if (draggedEl) draggedEl.style.opacity = '';
		draggedEl = null;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		if (!draggedEl) return;

		const dropTarget = e.currentTarget as HTMLElement;

		if (dropTarget && dropTarget !== draggedEl) {
			// Reorder: insert before or after based on Shift key (optional)
			if (e.shiftKey) {
				dropTarget.after(draggedEl);
			} else {
				dropTarget.before(draggedEl); // most natural for vertical lists
			}
		}
		console.log('Hello there');
		if (draggedEl) draggedEl.style.opacity = '';
		draggedEl = null;
		console.log('Hello there');
	}

	// ====================== REGISTER ALL HANDLERS ======================
	onMount(() => {
		globalEH.registerHandlers({
			toggleColor,
			clickHandler,
			cHandler,
			mouseoverHandler,
			overHandler,
			mouseoutHandler,
			// Drag & Drop handlers
			handleDragStart,
			handleDragOver,
			handleDragEnd,
			handleDrop,
		});

		globalEH.setup(document.body);

		return () => {
			globalEH.destroy();
		};
	});
</script>

<!-- Example: Drag & Drop container -->
<div class="draggable dd-column" data-event-handler="dragover:handleDragOver, drop:handleDrop">
	{#each Object.entries(forthColumn) as [title, value] (title)}
		<div draggable="true" data-event-handler="dragstart:handleDragStart, dragend:handleDragEnd">
			{title}
			{value}
		</div>
	{/each}
</div>

<!-- Mouse event example -->
<div data-event-handler="click:toggleColor, mouseover:mouseoverHandler">Click or hover me</div>
