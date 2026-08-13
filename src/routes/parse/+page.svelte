<script lang="ts">
	import { onMount } from 'svelte';
	import { schema } from './schema_prisma';
	import { handleTryCatch } from '$lib/utils';
	type FieldInfo = {
		type: string;
		prismaAttrs: string; // everything after the type
	};
	type FieldName = string;
	type ModelName = string;
	type ModelInfo = {
		fields: Record<FieldName, FieldInfo>;
		modelAttrs: string[]; // e.g. ["@@map(\"users\")", "@@index([email])"]
	};
	type Models = Record<ModelName, ModelInfo>;
	// type prismaAttrs = Record<string, ModelInfo>;
	// type Models = {
	// 	[modelName: string]: string[];
	// };
	const modelsFieldNames: Models = {};

	function sortObjectKeys<T>(obj: Record<string, T>): Record<string, T> {
		return Object.fromEntries(
			Object.entries(obj).sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }))
		);
	}
	function dateTimeToDate(type: string) {
		if (type === 'DateTime') {
			return 'Date';
		}
		return type;
	}

	// a parsed schema from a Prisma ORM is sent back from the extension
	// and as it is an HTML collection we turn it into an Object with
	// entries to be destructed into individual object properties
	let theFields = [];
	function renderParsedSchema(parsedSchema: Models) {
		let markup = '';
		let types = '';
		let includeTypes = 'import type { ';

		try {
			for (const [modelName, theFields] of Object.entries(parsedSchema)) {
				types += `
  export type ${modelName} = {
    `;
				includeTypes += modelName + ', ';
				if (modelName === 'User') {
					includeTypes += 'Role, ';
				}
				const [, fields] = Object.entries(theFields)[0];
				let m = '';

				for (const [fieldName, { type, prismaAttrs }] of Object.entries(fields)) {
					if ('0|1'.includes(fieldName)) continue;
					types += `${fieldName}: ${dateTimeToDate(type)};
    `;
					if (
						prismaAttrs.includes('@default') ||
						prismaAttrs.includes('@updatedAt') ||
						prismaAttrs.includes('@unique')
					) {
						m += `<p>${fieldName}</p><p>type:${type} <span style='color:pink'>${prismaAttrs ?? 'na'}</span></p>`;
					} else {
						m += `<p>${fieldName}</p><p>type:${type} ${prismaAttrs ?? 'na'}</p>`;
					}
				}

				types =
					types.slice(0, -3) +
					` };
`;
				// render field name as a collapsed summary to reveal field list when expanded
				markup += `<details>
          <summary class='model-name'>${modelName}</summary>
          <div class='fields-column'>${m}</div>
          </details>`;
			}
			includeTypes =
				includeTypes.slice(0, -2) +
				` }  from '$lib/types/types';
  `;
			// console.log('command saveTypes', 'payload', { types, includeTypes });
		} catch (err) {
			console.log('command log', 'text', 'renderParsedSchema: ' + err);
		}
		//
		// now all the markup constructed as a string render into  schemaContainerEl
		schemaContainerEl.innerHTML = markup;

		// schemaContainerEl gets click event but it has to be from the first <p> element
		// and that fieldname (innerText) id ignored if already saved in the fields
		schemaContainerEl.addEventListener('click', (event: MouseEvent) => {
			if ((event.target as HTMLElement).tagName === 'SUMMARY') {
				let modelObjName = (event.target as HTMLElement).innerText;
				routeNameEl.value = modelObjName.toLowerCase();
				routeNameEl.focus();
				routeNameEl.click();
				const details = (event.target as HTMLElement).closest('details');
				if (details.open) {
					closeSchemaModels();
					clearLabelText();
					return;
				}
				changeLabelText('Change Route Name if necessary', 4000);
				//----------------
				if (fieldModels) {
					// msgEl.innerHTML += '<br/>SUMMARY fieldModels found: '+ JSON.stringify(fieldModels) + ' modelObjName: '+ modelObjName;

					try {
						theFields = fieldModels[modelObjName];
						msgEl.innerHTML += '<pre>' + theFields + '</pre>';
						if (theFields) {
							for (field of theFields) {
								// msgEl.innerHTML += '<br/>theFields loop: '+ theFields[i];
								fieldNameEl.value = field;
								fieldNameEl.dispatchEvent(enterKeyEvent);
							}
							msgEl.innerHTML += '<pre>fields<br/>' + JSON.stringify(fields, null, 2) + '</pre>';
							return;
						}
					} catch (err) {
						const msg = err instanceof Error ? err.message : String(err);
						msgEl.innerHTML += '<br/>fieldModels[modelObjName] NOT found err: ' + msg;
					}
				} else {
					msgEl.innerHTML += '<br/>SUMMARY fieldModels NOT found';
				}
			}

			// the click is not on a SUMMARY, so a field name is clicked
			// msgEl.innerHTML += '<br/>the click is not on a SUMMARY'
			const el = event.target as HTMLElement;
			const fieldName = el.innerText;
			let type = dateTimeToDate(el.nextSibling.innerText.match(/type:(\\S+)/)?.[1]);
			if (!'String|Number|Boolean'.includes(type)) {
				return;
			}

			// the standard procedure for entering a new fieldname is via input box + Enter
			if (el.tagName === 'P' && el.nextSibling.tagName === 'P' && !fields.includes(fieldName)) {
				// we need input box so preserve its entry if any and restore after
				const savedEntry = fieldNameEl.value;
				fieldNameEl.value = `${fieldName}: ${type}`;
				fieldNameEl.dispatchEvent(enterKeyEvent);
				fieldNameEl.value = savedEntry;
			}
		});
	}

	function parsePrismaSchema(schemaContent: string): SchemaModels {
		let strModelNames = '|';
		const models: SchemaModels = {};
		const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;

		let modelMatch;
		while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
			const [, modelName, body] = modelMatch;
			const fields: Record<string, FieldInfo> = {};
			const modelAttributes: string[] = [];

			// Remove block comments first
			let bodyWithoutBlocks = body.replace(/\/\*[\s\S]*?\*\//g, '');

			const lines = bodyWithoutBlocks
				.split('\n')
				.map((line) => line.trim().replace(/\s{2,}|\t/gm, ' '))
				.filter(Boolean);

			for (const line of lines) {
				if (line.startsWith('//')) {
					continue; // skip single-line comment
				}

				if (line.startsWith('@@')) {
					modelAttributes.push(line);
					continue;
				}

				const [fieldName, fieldType, ...rest] = line.split(/\s+/);
				if (!fieldName || !fieldType) {
					continue;
				}

				fields[fieldName] = {
					type: fieldType,
					prismaAttrs: rest.join(' '),
				};
			}

			models[modelName] = {
				fields: sortObjectKeys(fields),
				modelAttributes,
			};
		}

		/* 
    This function returns models as SchemaModels so use it to populate above Models
    for data entry fields avoid fieldNames that are
    models itself like Todo, Profile, containing @@ chars 
    and some of @unique, @default, @default(now(), modelName), @relation
  */
		// make a string-list of modelNames like '|Todo|User|Profile|'
		for (const [modelName, theFields] of Object.entries(models)) {
			strModelNames += modelName + '|';
		}
		/*
    modelsFieldNames['User'] holds
    email: String 
    firstName: String 
    id: String 
    lastName: String 
    password: String 
    profile: Profile?         -- incorrect as model name
    role: Role 
    updatedAt: DateTime? 
    userAuthToken: String     -- incorrect @unique

  */
		for (const [modelName, theFields] of Object.entries(models)) {
			let arrFields = [];
			const [, fields] = Object.entries(theFields)[0];
			for (let [fieldName, { type, prismaAttrs }] of Object.entries(fields)) {
				if ('0|1'.includes(fieldName)) {
					continue;
				}
				// type could be optional, so remove ? if any as it cannot match model name
				type = type.replace(/\?/g, '');
				if (fieldName.includes('password')) {
					// passwordHash or similar
					fieldName = 'password';
				}
				if (type === 'DateTime') {
					type = 'Date';
				}
				// exclude this field names
				const pattern = '@default\\((' + strModelNames + 'now\\(\\))\\)';
				let regex = new RegExp(pattern);
				let m = prismaAttrs.match(regex); // null if failed
				if (m && m[1]) {
					continue; // not data entry field name
				}

				// type cannot be a model name like Profile...
				regex = new RegExp('(' + strModelNames.slice(1, -1) + ')');
				m = type.match(regex); // null if failed
				if (m && m[1]) {
					continue;
				}

				m = prismaAttrs.match(/(@unique|@createdAt)/); // non-mutable
				if (m && m[1]) {
					continue;
				}

				const hasBrackets = type.includes('[]');
				const hasId = prismaAttrs.includes('@id');
				const hasRole = type === 'Role';
				const include = !hasBrackets || hasId || hasRole;
				if (include) {
					arrFields.push(fieldName + ': ' + type);
				}
			}
			try {
				modelsFieldNames[modelName] = arrFields;
			} catch (err: unknown) {
				const msg = err instanceof Error ? err.message : String(err);
				// console.log('cannot add a model' + msg);
			}
		}

		renderParsedSchema(models);
		return models;
	}
	let parsedSchema = parsePrismaSchema(schema);
	let schemaContainerEl: HTMLDivElement;
	onMount(() => {
		schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
	});
</script>

<pre>{JSON.stringify(parsedSchema, null, 2)}</pre>
<div id="schemaContainerId"></div>
