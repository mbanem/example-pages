<script lang="ts">
	type ARGS = {
		color: string;
	};
	let { color }: ARGS = $props();
</script>

<div class="rectangle" style="color:{color};border-color:{color}">
	<strong>Collored thing Component</strong>
</div>
