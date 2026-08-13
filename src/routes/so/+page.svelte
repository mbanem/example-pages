<script lang="ts">
	// Fake data – replace with your real `models`
	let models = {
		User: {
			fields: [
				{ name: 'id', type: 'Int', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'email', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'name', type: 'String', isArray: false, isOptional: true, isDataEntry: true },
				{ name: 'posts', type: 'Post', isArray: true, isOptional: false, isDataEntry: false },
				// add 20+ more fields to test scrolling...
			],
		},
		Record: {
			fields: [
				{ name: 'id', type: 'Int', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'content', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'next', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'first', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'second', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'third', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fourth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fifth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
			],
		},
		Passport: {
			fields: [
				{ name: 'id', type: 'Int', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'content', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'next', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'first', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'second', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'third', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fourth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fifth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
			],
		},
		City: {
			fields: [
				{ name: 'id', type: 'Int', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'content', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'next', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'first', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'second', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'third', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fourth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fifth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
			],
		},
		Post: {
			fields: Array.from({ length: 25 }, (_, i) => ({
				name: `field${i}`,
				type: i % 3 === 0 ? 'String' : 'Int',
				isArray: i % 5 === 0,
				isOptional: i % 2 === 0,
				isDataEntry: true,
			})),
		},
		Test: {
			fields: [
				{ name: 'id', type: 'Int', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'content', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
			],
		},
		Comment: {
			fields: [
				{ name: 'id', type: 'Int', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'content', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'next', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'first', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'second', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'third', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fourth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
				{ name: 'fifth', type: 'String', isArray: false, isOptional: false, isDataEntry: true },
			],
		},
	};

	let openModelName = $state<string | null>(null);

	function toggleModel(name: string) {
		openModelName = openModelName === name ? null : name;
	}
</script>

<div class="page">
	<!-- <h1>Prisma Models</h1> -->

	<!-- This is the scrollable container -->
	<div class="models-container">
		{#each Object.entries(models) as [modelName, model], index (modelName)}
			<details
				open={openModelName === modelName}
				class="model-details"
				ontoggle={(e) => {
					if ((e.currentTarget as HTMLDetailsElement).open) {
						toggleModel(modelName);
					}
				}}
			>
				<summary class="model-summary">
					{modelName}
				</summary>

				<div class="fields-column">
					{#each model.fields as field (field.name)}
						<div class="field-row">
							<strong>{field.name}-{model.fields.length}</strong>
							<span>type: {field.type}</span>
							{#if field.isArray}<span class="tag">[]</span>{/if}
							{#if field.isOptional}<span class="tag">?</span>{/if}
						</div>
					{/each}
				</div>
			</details>
		{/each}
	</div>
</div>

<style>
	.page {
		height: 100vh;
		display: flex;
		flex-direction: column;
		padding: 16px;
		box-sizing: border-box;
		background: #f5f5f5;
	}

	h1 {
		margin: 0 0 16px 0;
	}

	/* === SCROLLABLE CONTAINER === */
	.models-container {
		display: flex;
		flex-direction: column;
		gap: 12px;
		flex: 1; /* takes all remaining height */
		overflow-y: auto; /* this is the key */
		overflow-x: hidden;
		padding: 8px;
		background: white;
		border: 1px solid #ddd;
		border-radius: 8px;
	}

	/* === DETAILS STYLING === */
	.model-details {
		border: 1px solid #ddd;
		border-radius: 8px;
		overflow: hidden;
		transition: all 0.2s ease;
	}

	.model-details[open] {
		border-color: #2196f3;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.model-summary {
		padding: 12px 16px;
		font-weight: 600;
		background: #f8f9fa;
		cursor: pointer;
		list-style: none; /* removes default arrow on some browsers */
	}

	.model-summary::-webkit-details-marker {
		display: none;
	}

	/* Content area */
	.fields-column {
		padding: 12px 16px;
		background: #fafafa;
		border-top: 1px solid #eee;
		max-height: 320px; /* internal scroll if too many fields */
		overflow-y: auto;
	}

	/* Special styling when the LAST details is open */
	.models-container > .model-details:last-of-type[open] .fields-column {
		background: #e3f2fd;
		border-color: #2196f3;
		border-radius: 0 0 8px 8px;
		max-height: 420px; /* you can make the last one taller */
		margin-bottom: 2rem;
	}

	.field-row {
		display: flex;
		justify-content: space-between;
		padding: 6px 0;
		border-bottom: 1px dotted #ddd;
	}

	.tag {
		background: #e0e0e0;
		padding: 2px 6px;
		border-radius: 4px;
		font-size: 0.8em;
	}
</style>
