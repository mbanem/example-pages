<script lang="ts">
	type FieldInfo = {
		type: string;
		prismaAttrs: string; // everything after the type
	};

	type ModelInfo = {
		fields: Record<string, FieldInfo>;
		modelAttrs: string[]; // e.g. ["@@map(\"users\")", "@@index([email])"]
	};
	type Models = Record<string, ModelInfo>;
	const models: Models = {
		article: {
			fields: {
				author: { type: 'string', prismaAttrs: '' },
				authorId: { type: 'string', prismaAttrs: 'uuid' },
				content: { type: 'string', prismaAttrs: '' },
				id: { type: 'string', prismaAttrs: '@id @default(uuid())' },
				title: { type: 'string', prismaAttrs: '' }
			},
			modelAttrs: ['@@map("article")']
		},
		user: {
			fields: {
				articles: { type: 'Article[]', prismaAttrs: '' },
				createdAt: { type: 'DateTime', prismaAttrs: '@default(now()) @map("created_at")' },
				email: { type: 'String', prismaAttrs: '' },
				firstName: { type: 'String', prismaAttrs: '@map("first_name")' },
				id: { type: 'String', prismaAttrs: '@id @default(uuid())' },
				lastName: { type: 'String', prismaAttrs: '@map("last_name")' },
				passwordHash: { type: 'String', prismaAttrs: '@map("password_hash")' },
				posts: { type: 'Post[]', prismaAttrs: '' },
				profile: { type: 'Profile?', prismaAttrs: '' },
				role: { type: 'Role', prismaAttrs: '@default(USER)' },
				todos: {
					type: 'Todo[]',
					prismaAttrs: '// arrays are optional and could be empty'
				},
				updatedAt: { type: 'DateTime?', prismaAttrs: '@updatedAt @map("updated_at")' },
				userAuthToken: { type: 'String', prismaAttrs: '@unique @map("user_auth_token")' }
			},
			modelAttrs: [
				'@@unique(name: "fullNameEmail", [firstName, lastName, email])',
				'@@map("users")'
			]
		},
		todo: {
			fields: {
				completed: { type: 'boolean', prismaAttrs: '' },
				content: { type: 'string', prismaAttrs: '' },
				createdAt: { type: 'Date', prismaAttrs: '@default(now())' },
				id: { type: 'string', prismaAttrs: '@id @default(uuid())' },
				priority: { type: 'number', prismaAttrs: '' },
				title: { type: 'string', prismaAttrs: '' },
				updatedAt: { type: 'Date', prismaAttrs: '' },
				user: { type: 'User', prismaAttrs: '' },
				userId: { type: 'string', prismaAttrs: 'uuid()' }
			},
			modelAttrs: ['@@map("todo")']
		}
	};
	for (const modelName of Object.keys(models)) {
		const fields = Object.entries(models[`${modelName}`].fields);

		for (const fld of fields) {
			const [fieldName, { type, prismaAttrs }] = fld;
		}
	}
</script>

<div class="grid-wrapper">
	{#each Object.entries(models) as [k, v] (k)}
		<div>
			<p>{k.toUpperCase()}</p>
			<pre>{JSON.stringify(v, null, 2).replace(/"/g, '')}</pre>
		</div>
	{/each}
</div>

<style lang="scss">
	.grid-wrapper {
		display: grid;
		grid-template-columns: 18rem 22rem 18rem;
		justify-content: center;

		// width: 80wv;
		gap: 1rem;
		div {
			border: 1px solid gray;
			border-radius: 10px;
			padding: 0 1rem;
			height: 90vh;
			overflow-y: auto;
			pre {
				font-size: 13px;
				color: var(--candidate-color);
				text-wrap: wrap;
				margin-top: 2.5rem;
			}
			p {
				position: fixed;
				font-size: 15px;
				color: blue;
			}
		}
	}
</style>
