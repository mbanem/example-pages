<script lang="ts">
	import { createPage } from '$lib/components/CreatePage.svelte';

	export function generate(payload: Payload) {
		console.log('FAKE COMPONENT');
		console.log('FakeExtension payload', payload);

		console.log('crComponents', payload.crComponents);
		console.log('authorization', payload.authorization);
		console.log('authentication', payload.authentication);
		console.log('selectedModels', payload.selectedModels);
		for (const [modelName, model] of Object.entries(payload.selectedModels as SelectedModels) as [string, Model][]) {
			console.log('FakeExtension', modelName, model);
			try {
				createPage(modelName, model);
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				console.log('FakeExtension', msg);
			}
			for (const field of (model as Model).fields) {
				console.log('FakeExtension', field.name, field.type, field.isArray, field.isOptional);
			}
		}
	}
</script>

<!-- 
	payload.crComponents				-- array
	payload.features						-- array
	payload.selectedModules
	fields:{
		attrs: "@id @default(uuid())"
		isArray: false​
		isDataEntry: true​
		sOptional: false​
		name: "id"​
		type: "string"
	}
-->
