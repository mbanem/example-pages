<script lang="ts">
	type Field = { name: string; type: string; attrs?: string };
	type Model = {
		fields: { name: string; type: string; attrs?: string }[]; // fixed the array syntax
		attrs?: string[]; // e.g. ["@@map(\"users\")", "@@index([email])"]
	};
	type Models = Record<string, Model>; // key is the model name
	const models: Models = {}; // No error! when ussing an empty object
	/* usage
	const fieldName = 'id', type='number', attrs='SERIAL PRIMSRYKEY'
	models['Category'] = {
		fields:[
				{name: fieldName, type, attrs},
			],
		attrs:[
			'@@map("category")'
		]
	}
	models.Category.fields.push({name:'firstName', type:'string'})
*/

	import { schema } from './schema_prisma';
	import { handleTryCatch } from '$lib/utils';
	// import { createModel } from '../func-model/model';
	// import { SvelteSet } from 'svelte/reactivity';

	const UI = {
		ui: 'ui',
		namesOnly: 'namesOnly',
		nonUI: 'nonUI',
		all: 'all',
	} as const;
	type UIType = (typeof UI)[keyof typeof UI];

	// function isUI(value: keyof typeof UI): value is UIType {
	// 	return Object.values(UI).includes(value);
	// }
	// ------end instead of enum --------

	type FieldInfo = [type: string, prismaAttrs: string];
	// type FieldType = string;
	type FieldName = string;
	type RFNameFInfo = Record<FieldName, FieldInfo>;
	type ModelInfo = {
		fields: RFNameFInfo;
		modelAttrs: string[]; // e.g. ["@@map(\"users\")", "@@index([email])"]
	};

	const ordered = [
		'id',
		'authorId',
		'userId',
		'employeeId',
		'customerId',
		'ownerId',
		'firstName',
		'lastName',
		'middleName',
		'name',
		'completed',
		'profileId',
		'dob',
		'dateOfBirth',
		'email',
		'password',
		'bio',
		'biography',
		'address',
		'city',
		'state',
		'title',
		'content',
		'category',
		'role',
		'priority',
		'price',
		'updatedAt',
	];
	let strModelNames = '|';
	// creates a string-list of modelNames  '|Todo|User|Profile|'
	const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;
	let regexIsModelName = new RegExp(''); // create at makeStrModelNames at the start of parsePrismaSchema

	/**
	 * sort fieldNames alphabetically
	 */
	function sortObjectKeys<T>(obj: Record<string, T>): Record<string, T> {
		return Object.fromEntries(
			Object.entries(obj).sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base', numeric: true }))
		);
	}

	/**
	 * check if field is UI/data-entry field
	 * @param field: type Field= { name: string; type: string; attrs?: string }
	 */
	function isUICandidate({ name, type, attrs }: Field): boolean {
		type = type.toLowerCase().trim();
		attrs = attrs ?? '';
		if (strModelNames.indexOf(`|${type}|`) !== -1 || strModelNames.indexOf(`|${name}|`) !== -1) {
			return false;
		}
		if (
			/[\|\|]/.test(type) ||
			name.includes('@@') ||
			(type === 'Date' && /createdAt/i.test(name)) ||
			/hash|token/i.test(name)
		) {
			return false;
		}
		const ui = /\b@id @default(uuid())\b/i.test(attrs) || ['string', 'number', 'boolean', 'role'].includes(type);

		return ui;
	}
	function makeStrModelNames(schemaContent: string) {
		let modelMatch = null;
		while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
			// a string-list of modelNames  '|Todo|User|Profile|'
			strModelNames += modelMatch[1] + '|';
		}
		// make a regex to test is name is a ModelName
		regexIsModelName = new RegExp(`\\b(${strModelNames.slice(1, -1)})\\b`);
	}
	/**
	 * array leading part sorted by orderd followed by lefowers
	 */
	function sortModelsByOrdered(models: Models, kind: UIType = UI.all) {
		let orderedFields: { name: string; type: string; attrs?: string }[] = [];
		let leftoverFields: { name: string; type: string; attrs?: string }[] = [];
		const uiModels: Models = {};
		const nuiModels: Models = {};
		for (const [modelName, model] of Object.entries(models)) {
			const fields = [];
			// const mFields = [...model.fields];
			uiModels[modelName] = {};
			nuiModels[modelName] = {};

			// 	'field["firstName"]',
			// 	model.fields.find((field) => field.name === 'firstName')
			// );
			if (kind === UI.ui || kind === UI.all) {
				for (const key of ordered) {
					orderedFields.push(model.fields.find((field) => field.name === key) as Field);
				}
				for (const field of model.fields) {
					if (!orderedFields.includes(field) && isUICandidate(field)) {
						orderedFields.push(field);
					}
				}
			}
			for (const field of model.fields) {
				if (!orderedFields.includes(field)) {
					leftoverFields.push(field);
				}
			}
			orderedFields = orderedFields.filter(Boolean);
			// if (kind === UI.nonUI || kind === UI.all) {
			// 	leftoverPart = (arg as SortInputArg[]).filter((item) => {
			// 		const key = item[0].trim();
			// 		return !ordered.includes(key);
			// 	});
			// }

			uiModels[modelName].fields = orderedFields;
			nuiModels[modelName].fields = leftoverFields;

			// prepare for next model
			orderedFields = [];
			leftoverFields = [];
			// nuiModels[modelName].attrs = model.attrs;
		}

		return [uiModels, nuiModels]; //.filter(Boolean);
	}

	/**
	 * build const models:RMNameMInfo = Record<ModelName, ModelInfo>
	 * @param (schemaContent) from schema.prisma
	 */
	function parsePrismaSchema(schemaContent: string): void {
		type Fields = { name: string; type: string; attrs?: string }[];
		let fields: Fields = [];
		makeStrModelNames(schemaContent);
		// let modelMatch: RegExpExecArray | null = null;
		let modelMatch = null;

		try {
			while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
				const [, modelName, body] = modelMatch;

				// Grok / X suggest amodelNamemodelNamevoiding the undefined by adding ?? '' to modelMatch[xx]
				// const modelName = modelMatch[1] ?? '';
				// const body = modelMatch[2] ?? '';
				const modelAttrs: string[] = [];

				// // Remove block comments first
				let bodyWithoutBlocks = body.replace(/\/\*[\s\S]*?\*\//g, '');

				let lines = bodyWithoutBlocks
					.split('\n')
					.map((line) => line.trim().replace(/\s{2,}|\t/gm, ' '))
					.filter(Boolean);

				// from the lines build models:RMNameMInfo: modelName, modelInfo: fields (fieldName: fieldInfo) & prismaAttrs
				// lines = sortArrByOrdered(lines, UI.all)
				for (let line of lines) {
					line = line
						.trim()
						.replace(/String/g, 'string')
						.replace(/DateTime/g, 'Date')
						.replace(/Int/g, 'number')
						.replace(/Boolean/g, 'boolean')
						.replace(/[?]/g, '');

					// line: firstName String @map("first_name")
					if (line.startsWith('//')) {
						continue; // skip single-line comment
					}

					// if (line.startsWith('@@')) {
					// 	modelAttrs.push(line);
					// 	continue;
					// }

					// line id string @id @default(uuid())
					// id no type prismaAttrs  string @id @default(uuid())
					// let [, fieldName, , fieldType, prismaAttrs] =
					// 	/([@()a-zA-Z0-9"']+)(\s*?(\w+)\s*(.+))?/.exec(line);

					// const trimmed = line.trim();
					const parts = line.split(/\s+/); // split on whitespace

					if (line.startsWith('@@')) {
						// Block attribute
						modelAttrs.push(line);
					} else if (parts.length >= 2) {
						fields.push({
							name: parts[0],
							type: parts[1],
							attrs: parts.slice(2).join(' '),
						});
					}

					// if (!fieldName) {
					// 	continue;
					// }

					// type FieldInfo = [type: string, prismaAttrs: string];
					// fields: Record<FieldName, FieldInfo>;
					// NOTE: FieldInfo is a tuple but cannot use element names at runtime
					// so we cannot say [ type: fieldType, prismaAttrs: rest.join(' ')]
					// fields.push({ name: fieldName, type: fieldType, attrs: prismaAttrs });
				}

				// fields.type = 'RFNameFInfo';
				// let sorted = sortArrByOrdered(fields, UI.all)

				models[modelName] = {
					fields: fields, //: sortObjectKeys(fields),
					attrs: modelAttrs,
				};

				// sortArrByOrdered(fields);

				// models is Record<string, Model> a dictionary mod+-elName, Model
				// Object.entries(models) return [key, val] where key is modelName
				// and val is the Model
				// for (const [modelName, model] of Object.entries(models)) {

				// 	for (const field of model.fields) {
				// 		console.log(field.name, field.type, field.attrs);
				// 	}
				// 	if (model.attrs) {
				// 		for (const attr of model.attrs) {
				// 			console.log('modelAttr', attr);
				// 		}
				// 	}
				// }
				fields = [];
				// break;
			}
		} catch (err) {
			console.log('Again!');
			handleTryCatch(err);
		}

		// const [models, nuiModels] = sortModelsByOrdered(models, UI.all);
		const [uiModels, nuiModels] = sortModelsByOrdered(models, UI.all);

		return;
		for (const [modelName, modelInfo] of Object.entries(models)) {
			// 	'modelName',
			// 	JSON.stringify(modelName, null, 2),
			// 	'\nmodelInfo.fields: FieldName:string, FieldInfo:[type:string, prismaAttrs:string]',
			// 	JSON.stringify(modelInfo.fields, null, 2),
			// 	'\nmodelInfo.modelAttrs',
			// 	JSON.stringify(modelInfo.modelAttrs, null, 2)
			// );
			/*type ModelInfo = {
					fields: Record<string, FieldInfo>;
					modelAttrs: string[];
			}*/

			let [, fields] = Object.entries(modelInfo)[0];

			for (let [fieldName, fieldInfo] of Object.entries(fields)) {
				// 	'fieldName',
				// 	fieldName,
				// 	'\nfieldInfo.type',
				// 	fieldInfo[0],
				// 	'\nfieldInfo.prismaAttrs',
				// 	fieldInfo[1]
				// );
				let fieldInfoType = fieldInfo[0];
				// let fieldInfoPrismaAttrs = fieldInfo[1];

				for (let [fieldName, fieldInfo] of Object.entries(fields)) {
					let type = fieldInfo.type;
					let prismaAttrs = fieldInfo.prismaAttrs;
					if ('0|1'.includes(fieldName)) {
						continue;
					}

					// 			// type could be optional, so remove ? if any as it cannot match model name
					// 			type = type.replace(/\?/g, '');
					// 			if (fieldName.includes('password')) {
					// 				// passwordHash or similar
					// 				fieldName = 'password';
					// 			}
					// 			if (type === 'DateTime') {
					// 				type = 'Date';
					// 			}
					// 			// exclude this field names
					// 			const pattern = '@default\\((' + strModelNames + 'now\\(\\))\\)';
					// 			let regex = new RegExp(pattern);
					// 			let m = prismaAttrs.match(regex); // regex returns null when fail
					// 			if (m && m[1]) {
					// 				continue; // not data entry field name
					// 			}
					// 			// UI type cannot be a model name like Profile, User,...
					// 			regex = new RegExp('(' + strModelNames.slice(1, -1) + ')');
					// 			m = type.match(regex); // regex returns null when fail
					// 			if (m && m[1]) {
					// 				continue;
					// 			}
					// 			m = fieldInfo.prismaAttrs.match(/(@unique|@createdAt)/); // non-mutable
					// 			if (m && m[1]) {
					// 				continue;
					// 			}
					// 			const hasRole = fieldInfo[0] === 'Role';
					// 			const include = !hasBrackets || hasId || hasRole;
					// 			if (isUICandidate(fieldInfo)) {
					// 				uiFields[fieldName] = fieldInfoType;
					// 			}
				}
			}
			// 	uiModels[modelName] = uiFields;
			// 	uiFields = {};
		}
	}

	parsePrismaSchema(schema);

	// function dateTimeToDate(type: string) {
	// 	if (type === 'DateTime') {
	// 		return 'Date';
	// 	}
	// 	return type;
	// }
	function sortRecByKey<T extends Record<string, object>>(rec: T) {
		const sortedKeys = (Object.keys(rec as T) as Array<keyof T>).sort();

		const sortedRec = sortedKeys.reduce(
			(acc, key) => {
				acc[key] = rec[key];
				return acc;
			},
			{} as typeof rec
		);

		return sortedRec;
	}
	// function sortRecordByKey<T extends Record<string, object>>(obj: T) {
	// 	const objKeys =
	// 		'|' +
	// 		Object.keys(obj)
	// 			.map((key) => `${key}`)
	// 			.join('|') +
	// 		'|';
	// 	const ord = ordered.reduce((acc, ordKey) => {
	// 		if (objKeys.includes(`|${ordKey}|`)) {
	// 			acc[ordKey] = obj[ordKey];
	// 			return acc;
	// 		}
	// 		return acc;
	// 	}, {} as TRStrObj);

	// 	const whole = ordered.reduce((acc, ordKey) => {
	// 		if (!objKeys.includes(`|${ordKey}|`)) {
	// 			acc[ordKey] = obj[ordKey];
	// 			return acc;
	// 		}
	// 		return acc;
	// 	}, ord as TRStrObj);

	// 	const result: TRStrObj = {};
	// 	for (const key in whole) {
	// 		if (whole[key] !== undefined) {
	// 			result[key] = whole[key];
	// 		}
	// 	}
	// 	return result;
	// }

	// 	for (const modelName in models) {
	// 		const mdl = models[modelName];
	// 		pmSD += `<div class='prisma-model-block>'>
	// 		<details>
	// 			<summary class='model-name'>${modelName}</summary>
	// 				<div  class='fields-column'>
	// 				`;
	// 		for (const fieldName in mdl.fields) {
	// 			const { type, prismaAttrs } = mdl.fields[fieldName];

	// 			if (
	// 				prismaAttrs.includes('@id') ||
	// 				prismaAttrs.includes('@default') ||
	// 				prismaAttrs.includes('@updatedAt') ||
	// 				prismaAttrs.includes('@unique')
	// 			) {
	// 				const color = prismaAttrs.includes('@id') ? 'lightgreen' : 'pink';
	// 				pmSD += `<p>${fieldName}</p><p>type:${type} <span style='color:${color}'>${prismaAttrs ?? 'na'}</span></p>`;
	// 			} else {
	// 				pmSD += `<p>${fieldName}</p><p>type:${type} ${prismaAttrs ?? 'na'}</p>`;
	// 			}
	// 		}
	// 		pmSD += `</div>
	// `;
	// 		for (const modelAttr of mdl.modelAttrs) {
	// 			pmSD += `<p class='model-attr'>${modelAttr}</p>
	// 			`;
	// 		}
	// 		pmSD += `</details>
	// 		</div>
	// 		`;
	// 	}
	// let fields: string[] = [];
	// let msgEl: HTMLDivElement;
	// let schemaContainerEl: HTMLDivElement;
	// onMount(() => {
	// 	msgEl = document.getElementById('msgId') as HTMLDivElement;
	// 	schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
	// 	schemaContainerEl.innerHTML = pmSD;

	// schemaContainerEl.addEventListener('click', (event:MouseEvent) => {
	// 	if ((event.target as HTMLElement).tagName === 'SUMMARY') {
	// 		modelObjName = (event.target as HTMLElement).innerText;
	// 		//    routeNameEl.value = modelObjName.toLowerCase();
	// 		//    routeNameEl.focus()
	// 		//    routeNameEl.click()
	// 		const details = (event.target as HTMLElement).closest('details');
	// 		if (details && details.open) {
	// 			closeSchemaModels();
	// 			// clearLabelText();
	// 			return;
	// 		}
	// 		//    changeLabelText('pink', 'Change Route Name if necessary', 4000)
	// 		//----------------
	// 		if (models){
	// 			let selectedFields = ``
	// 			try{
	// 				let modelInfo = models[modelObjName];
	// 				if (modelInfo){
	// 					for (const field of Object.entries(modelInfo)){
	// 						selectedFields += `<p>${field}: `
	// 					}
	// 					msgEl.innerHTML += '<pre>fields<br/>'+ JSON.stringify(fields,null,2) + '</pre>';
	// 					return
	// 				}
	// 			}catch(err){
	// 				const msg = err instanceof Error ? err.message : String(err);
	// 				msgEl.innerHTML += '<br/>fieldModels[modelObjName] NOT found err: '+ msg
	// 			}
	// 		}else{
	// 			msgEl.innerHTML += '<br/>SUMMARY fieldModels NOT found'
	// 		}
	// 	}
	// }
	// });
	// -----------------------------------
	// for Wevschema Extension
	// let modelObjName = '';

	// function closeSchemaModels() {
	// 	// routeNameEl.value = '';
	// 	// fieldNameEl.value = '';
	// 	setTimeout(() => {
	// 		const children = schemaContainerEl?.children;
	// 		if (children) {
	// 			for (const child of Object.entries(children)) {
	// 				const det = child;
	// 				if (det.hasAttribute('open')) {
	// 					det.removeAttribute('open');
	// 				}
	// 			}
	// 		}
	// 		fields = [];
	// 		// fieldsListEl.innerHTML = '';
	// 	}, 0);
	// }
</script>

<!-- <pre style="color:navy;font-size:14px;">
	User = {JSON.stringify(parsedSchema.User, null, 2)}
</pre> -->

<!-- <div id="rightColumnId" class="right-column hidden">
	<span class="prisma-model-caption" onclick="closeSchemaModels">Select Fields from ORM</span> -->
<!-- <div id="schemaContainerId"></div> -->
<div class="div-class">Div Element</div>
<!-- </div> -->
<div class="div-class" id="schemaContainerId"></div>
<div id="msgId">
	Messages {strModelNames}
</div>

<!-- <pre>models {JSON.stringify(models, null, 2)}</pre> -->

<style lang="scss">
	.div-class {
		color: rgb(90, 90, 153);
		font-size: 18px;
		font-style: italic;
	}
	:global(.model-attr) {
		grid-column: span 2;
		width: 18rem;
		padding: 0;
		margin: 0 0 0 1rem;
		text-wrap: wrap;
		color: tomato;
		font-size: 13px;
	}
	:global(.prisma-model-block) {
		height: 30rem;
		// width: 12rem;
		overflow-y: auto;
	}
	:global(.model-name) {
		color: #3e3e3e;
		background-color: #e3e3e3;
		margin-top: 3px;
		width: 18rem;
		border-radius: 6px;
		padding-left: 1rem;
		cursor: pointer;
	}

	:global(.fields-column) {
		display: grid;
		grid-template-columns: 7rem 9.5rem;
		column-gap: 5px;
		width: max-content;
		padding: 6px 0 6px 1rem;
		height: auto;
		font-family: Georgia, 'Times New Roman', Times, serif;
		font-size: 15px !important;
		font-weight: 500 !important;
	}

	:global(.fields-column p) {
		margin: 4px 0 0 0;
		padding: 2px 0 4px 6px;
		border-bottom: 1px solid lightgray;
		text-wrap: wrap;
	}

	:global(.fields-column p:nth-child(odd)) {
		color: skyblue;
		cursor: pointer;
		width: 100%;
		padding: 2px 0 2px 0.5rem;
	}

	:global(.fields-column p:nth-child(even)) {
		font-weight: 400 !important;
		font-size: 12px !important;
	}
</style>
