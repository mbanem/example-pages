<script lang="ts">
	type TPrismaColumns = Record<string, { type: string; prismaAttrs: string }>;
	function sortRecordByKey<T>(rec: T) {
		const sortedKeys = (
			Object.keys(rec as Record<string, object>) as Array<keyof typeof rec>
		).sort();

		const sortedRec = sortedKeys.reduce(
			(acc, key) => {
				acc[key] = rec[key];
				return acc;
			},
			{} as typeof rec
		);

		return sortedRec;
	}
	const unsortedRecord: TPrismaColumns = {
		id: { type: 'string', prismaAttrs: '@id @default(uuid())' },
		firstName: { type: 'string', prismaAttrs: '' },
		lastName: { type: 'string', prismaAttrs: '' },
		password: { type: 'string', prismaAttrs: '' },
		createdAt: { type: 'Date', prismaAttrs: '@default(now())' },
		updatedAt: { type: 'Date', prismaAttrs: '@updatedAt()' }
	};
</script>

<div class="grid-wrapper">
	<pre id="block-pre">
	<b>unsorted Record</b>
{JSON.stringify(unsortedRecord, null, 2)}
	</pre>
	<pre>
  <b>sorted Record</b>
{JSON.stringify(sortRecordByKey(unsortedRecord), null, 2)}
</pre>
</div>

<style lang="scss">
	.grid-wrapper {
		display: grid;
		grid-template-columns: repeat(2, 20rem);
		justify-content: center;
		gap: 1rem;
	}
	pre {
		color: var(--candidate-color);
		font-size: 13px;
		tab-size: 16px;
		width: max-content;
		border: 1px solid gray;
		border-radius: 10px;
		padding: 1rem;
	}
</style>
