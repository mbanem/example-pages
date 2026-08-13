<script lang="ts">
	// Props (Svelte 5 runes syntax)
	import type { Field } from '../utils/parse-prisma-schema';
	let { fields = $bindable([]) }: { fields: Field[] } = $props();

	// Optional: If you want to add fields from outside (e.g. from parent)
	// You can also expose a function if needed
	export function addField(field: Field) {
		fields.push(field);
	}
</script>

// Reusable snippet for each list item (this is your HTML block)
{#snippet fieldBlock(field: Field)}
	<div class="cr-list-el">
		<span class:green-type={field.attrs?.includes('@id')}>
			{field.name}
		</span>
	</div>
{/snippet}

<div class="fields-list">
	{#each fields as field (field.name)}
		<!-- key is important for performance -->
		{@render fieldBlock(field)}
	{/each}
</div>

<style>
	.fields-list {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.cr-list-el {
		padding: 8px 12px;
		background: #f8fafc;
		border: 1px solid #e2e8f0;
		border-radius: 6px;
	}

	/* CSS variable approach for the green color */
	.green-type {
		color: var(--green-type, #22c55e);
	}
</style>
