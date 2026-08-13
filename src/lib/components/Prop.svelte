<script lang="ts">
	// let { name, increment }: { name: string; increment: (delta: number) => void } = $props();
	// let { increment }: { increment: (event: MouseEvent) => void } = $props();
	type ARGS = {
		name: string
		increment: (delta: number) => void
	}
	// let { name }: ARGS = $props();
	let { name, increment }: ARGS = $props()

	// let delta = 4;
	const incr = (_: MouseEvent) => {
		increment(3)
	}
</script>

<p>{name}</p>
<button onclick={incr}>increment</button>
