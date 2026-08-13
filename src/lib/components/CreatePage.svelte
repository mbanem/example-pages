<!--
@component
-->

<script module lang="ts">
	export function createPage(routeName: string, model: Model) {
		console.log('CreateSveltePage Component', routeName, model);
	}
</script>

<div class="main"></div>

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
</style>
