<script lang="ts">
	import CLine from '$lib/components/ClickableLine.svelte';
	// 1)
	function lineClicked(state: boolean) {
		isCheckedViaLineClicked = state;
		console.log('lineClicked received', state);
	}

	// 2)
	let isCheckedToo = $state<boolean>(false);

	// 3)
	let isCheckedViaLineClicked = $state<boolean>(false);
	let isCheckedBoth = $state<boolean>(false);
</script>

<!-- 1) -->
<CLine labelText="Only lineClicked function is sent to component see console.log" {lineClicked}></CLine>

<!-- 2) -->
<CLine labelText="Only state variable isCheckedToo is bound to component's isChecked" bind:isChecked={isCheckedToo}
></CLine>
<p>Bound state variable isCheckedToo {isCheckedToo}</p>

<!-- 3) -->
<CLine
	labelText="Both bound state variable and lineClicked are sent to component"
	{lineClicked}
	bind:isChecked={isCheckedBoth}
></CLine>
<p>Both are sent to component {isCheckedBoth} {isCheckedViaLineClicked}</p>

<CLine labelText="no optional props but at least one is required"></CLine>

<style lang="scss">
	.wrapper {
		width: 50vw;
		border: 1px solid gray;
		border-radius: 6px;
	}
</style>
