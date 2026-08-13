<script lang="ts">
	import Tooltip from './reactive.svelte';
	let tt: Tooltip;
	let buttonEl: HTMLButtonElement;
	let message = 'DB Verification Result, from Prisma ORM for, Role abd DB objects,position buttonEl below';
	let ix = 0;
	function showMessage(e: MouseEvent) {
		if (tt.isTooltipActive()) {
			return;
		}
		// ix = 3;
		switch (ix) {
			case 0:
				tt.showTooltip(buttonEl, message, 2000, 'below', {
					color: 'navy',
					backgroundColor: 'cornsilk',
				});
				break;
			case 1:
				// Normal auto-hide tooltip
				tt.showTooltip(
					e,
					'Database created successfully,Owner: mili,Host: localhost, position MouseEvent above',
					2000,
					'above',
					{
						color: 'lightgreen',
						backgroundColor: 'navy',
						border: '1px solid goldenrod',
						fontWeight: '500',
					}
				);
				break;
			case 2:
				// Persistent tooltip with close button
				tt.showTooltip(
					e,
					'Role owns database objects,Cannot be dropped yet,Remove objects first, position MouseEvent right',
					2000, // ← auto-hide
					'right',
					{
						color: 'darkred',
						backgroundColor: '#fff0f0',
						border: '1px solid crimson',
					}
				);
				break;
			case 3:
				// Persistent tooltip with close button
				tt.showTooltip(
					e,
					'Role owns database objects,Cannot be dropped yet,Remove objects first, position MouseEvent left',
					2000, // ← no auto-hide
					'left',
					{
						color: 'darkred',
						backgroundColor: '#fff0f0',
						border: '1px solid crimson',
					}
				);
				break;
		}
		ix = ++ix % 4;
	}
	// =================================
	// 1. Keep track of the button's position
	let x = $state(300);
	let y = $state(100);

	// 2. Variables to store the offset where the user clicked inside the button
	let offsetX = $state(0);
	let offsetY = $state(0);
	let navbarHeight = 32;

	function handleDragStart(event: DragEvent) {
		// Calculate distance from top-left of button to mouse pointer
		const rect = (event.target as HTMLElement).getBoundingClientRect();
		offsetX = event.clientX - rect.left;
		offsetY = event.clientY - rect.top;
		console.log('offsetY', offsetY);

		// Required for Firefox support
		event.dataTransfer?.setData('text/plain', '');
	}

	function handleDragEnd(event) {
		// 3. Update coordinates when dragging stops
		x = event.clientX - offsetX;
		y = event.clientY - offsetY - navbarHeight;
		console.log('offsetY', offsetY - navbarHeight);
	}
</script>

<!-- Outer container must cover the screen to allow dropping anywhere -->
<div class="container">
	<button
		bind:this={buttonEl}
		onclick={showMessage}
		class="draggable-button"
		draggable="true"
		ondragstart={handleDragStart}
		ondragend={handleDragEnd}
		style="left: {x}px; top: {y}px;"
	>
		draggable
	</button>
	<button style="margin:20rem 0 0 30rem">an anchor</button>
</div>
<Tooltip bind:this={tt} />

<style>
	:global(body) {
		padding: 0;
		margin: 0;
	}
	.container {
		position: relative;
		width: 200vw;
		height: 200vh;
		background: #f0f0f0;
		overflow: auto;
	}

	button {
		position: absolute;
		padding: 10px 20px;
		cursor: grab;
		user-select: none;
	}

	button:active {
		cursor: grabbing;
	}
</style>
