<script lang="ts">
	import type { Field } from '../../lib/utils/parse-prisma-schema';
	import { SvelteSet } from 'svelte/reactivity';
	// Best practice for Svelte 5 + TypeScript
	interface Props {
		fieldSet: SvelteSet<Field>;
	}
	let { fieldSet }: Props = $props();
	// Props - you can bind the array from parent
	// let { fields = $bindable([]) }: { fields: Field[] } = $props();

	// Helper function you can call from parent if needed
	export function addFields(items: Field | Field[]) {
		if (Array.isArray(items)) {
			items.forEach((item) => fieldSet.add(item));
		} else {
			fieldSet.add(items);
		}
	}
	export function removeFields(items: Field | Field[]) {
		if (Array.isArray(items)) {
			items.forEach((item) => fieldSet.delete(item));
		} else {
			fieldSet.delete(items);
		}
	}
</script>

{#snippet fieldBlock(field: Field)}
	<div class="cr-list-el">
		<span
			style:--green-type={field.attrs?.includes('@id') ? '#22c55e' : undefined}
			class:green-type={field.attrs?.includes('@id')}
		>
			{field.name}
		</span>
	</div>
{/snippet}

<div class="fields-list">
	{#each fieldSet as field (field.name)}
		{@render fieldBlock(field)}
	{/each}
</div>

<style lang="scss">
	.fields-list {
		display: flex;
		flex-direction: column;
		width: max-content;
		gap: 6px;
	}

	.cr-list-el {
		padding: 8px 12px;
		background-color: #f8fafc;
		border: 1px solid #e2e8f0;
		&:first-child {
			border-top-left-radius: 5px;
			border-top-right-radius: 5px;
		}
		&:last-child {
			border-bottom-left-radius: 5px;
			border-bottom-right-radius: 5px;
		}
	}

	.green-type {
		color: var(--green-type, #22c55e);
	}
</style>
