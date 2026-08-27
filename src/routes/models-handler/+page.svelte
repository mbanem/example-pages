<script lang="ts">
	import Tooltip from '$lib/components/CReactiveTooltip.svelte';
	import CRModelsHandler from '$lib/components/CRModelsHandler.svelte';

	let tooltip: Tooltip;
	// type Payload = Record<string, SelectedModels | Model | string[] | string>; // { route: string | null } = { route: null };
	let { data }: PageProps = $props();
	let isActive = $state(false);
	let models = data.models; // avoid $derived as we use this one-time only
	// console.log('data.enums', data.enums); // type TEnums = Record<string, Record<string, string>>;
	let isLoading = $state(true);
	// let userRoles = ['USER', 'ADMIN', 'VISITOR', 'MODERTOR'];
	let userRoles = Object.keys(Object.values(data.enums)[0] as TEnum).filter(Boolean);
	// console.log('+page props', userRoles);
	setTimeout(() => {
		isLoading = false;
	}, 1000);
	let inAction = $state(false);
	let selectedModels = $state<SelectedModels>({});
	let crComponents: string[] = $state(['CRInput', 'CRSpinner', 'CRActivity', 'CRTooltip', 'CRSummaryDetails']);

	// what authentication/authorization to implement should be optional?
	let appFeatures: string[] = $state([]);
	function toggleActive() {
		isActive = isActive ? false : true;
	}
</script>

<div class="main">
	<CRModelsHandler {models} bind:selectedModels bind:isLoading {userRoles}></CRModelsHandler>
</div>

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
</style>
