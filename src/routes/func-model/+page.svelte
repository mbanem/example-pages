<script lang="ts">
	import { lowercaseTypes } from './data';
	// import { UI } from './model';
	import { createModel } from './model';
	const model = createModel(lowercaseTypes);

	// for (const [k, v] of Object.entries(model)) {
	// 	console.log('(k,v)', k, v);
	// }
</script>

<pre>{JSON.stringify(model, null, 2)}</pre>

<style lang="scss">
	pre {
		color: navy;
		font-size: 13px;
		tab-size: 16px;
		width: max-content;
		padding: 0;
		margin: 0;
	}
</style>
