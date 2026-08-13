<script lang="ts">
	let position = $state({ x: 0, y: 0 });
	function makeException() {
		position = null;
	}
</script>

<svelte:window
	onmousemove={(e) => {
		position.x = e.clientX;
		position.y = e.clientY;
	}}
/>

<p>
	current mouse position: (&lcub;x:{position.x}, y:{position.y}&rcub;)
</p>

<button onclick={makeException} style="margin:2rem 0 0 6rem;">
	clicking this button sets position to
</button>
