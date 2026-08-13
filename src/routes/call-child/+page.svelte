<script lang="ts">
	import Child from './Child.svelte';
	let child: { print: (n: number) => void };
	let num = $state(21);
</script>

<Child bind:this={child} />
<input type="number" bind:value={num} style="width:3rem;" />
<button onclick={() => child?.print(num)}>
	Call Child with arg {num}
</button>
