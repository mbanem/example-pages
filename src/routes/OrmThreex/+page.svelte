<script lang="ts">
	import { onMount } from 'svelte';
	// import { schema } from './schema_prisma'
	// import { sleep, handleTryCatch, createEventHandler } from '$lib/utils'
	import { sleep, handleTryCatch, createEventHandler } from './lib/utils';
	import { SvelteMap } from 'svelte/reactivity';

	type Field = { name: string; type: string; attrs?: string };
	type Model = {
		fields: { name: string; type: string; attrs?: string }[];
		attrs?: string[];
	};
	type Models = Record<string, Model>;
	let models: Models = {};
	let uiModels: Models = {};
	let nuiModels: Models = {};
	let modelName = '';

	// type fieldNames = {
	// 	modelName: string;
	// 	namesList: string;
	// };
	let fieldNames: Record<string, string> = {};
	let fieldStrips: Record<string, string> = {};
	let fieldsListEl: HTMLDivElement;
	let fieldListsInitialized = false;
	const UI = {
		ui: 'ui',
		namesOnly: 'namesOnly',
		nonUI: 'nonUI',
		all: 'all',
	} as const;
	type UIType = (typeof UI)[keyof typeof UI];

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
	const eh = createEventHandler();
	let strModelNames = '|';
	const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;

	// FIELDS
	let removeHintEl: HTMLParagraphElement;
	let schemaContainerEl: HTMLDivElement;
	let middleColumnEl: HTMLDivElement;

	let routeLabelNode: HTMLElement;
	let routeLabelEl: HTMLLabelElement;
	let routeNameEl: HTMLInputElement;

	let fieldLabelNode: HTMLElement;
	let fieldLabelEl: HTMLLabelElement;
	let fieldNameEl: HTMLInputElement;

	let timer: string | number | undefined; //ReturnValue<typeof setTimeout>;
	let fieldNameAndType = 'Field Name and Type';
	let unacceptable = '  not a UI field';
	let deletedFields = new SvelteMap<string, Node>();
	// global msg set by isFieldFormatValid, isInFieldStrips and isInListEls
	let msg = '';
	/**
	 * Inside sortModelsByOrdered check if field is UI/data-entry field
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

	/**
	 * makes LIST od model names |User|Profile|Todo|...
	 * @param schema.prisma
	 */
	function makeStrModelNames(schemaContent: string) {
		let modelMatch = null;
		while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
			strModelNames += modelMatch[1] + '|';
		}
	}

	/**
	 *  LEADING array part sorted by ordered followed by leftowers
	 */
	function sortModelsByOrdered(models: Models, kind: UIType = UI.all) {
		let orderedFields: { name: string; type: string; attrs?: string }[] = [];
		let leftoverFields: { name: string; type: string; attrs?: string }[] = [];
		for (const [modelName, model] of Object.entries(models)) {
			let uiNames = '|';
			let uiStrips = '|';
			fieldNames[modelName] = '';
			fieldStrips[modelName] = '';
			// must create entry for model name as uiModels[modelName].fields
			// are two-step deep so it does not exists until first ste is done
			uiModels[modelName] = { fields: [], attrs: [] };
			nuiModels[modelName] = { fields: [], attrs: [] };
			if (kind === UI.ui || kind === UI.all) {
				for (const key of ordered) {
					// ordered array holds UI/data-entry field names
					const field = model.fields.find((field) => field.name === key) as Field;
					if (field) {
						orderedFields.push(field);
						uiNames += field.name + '|';
						uiStrips += `${field.name}: ${field.type}` + '|';
					}
				}
				for (const field of model.fields) {
					// for rest of fields not selected by ordered test if they are UI candidates
					if (!orderedFields.includes(field) && isUICandidate(field)) {
						orderedFields.push(field);
						uiNames += field.name + '|';
						uiStrips += `${field.name}: ${field.type}` + '|';
					}
				}
			}
			for (const field of model.fields) {
				if (!orderedFields.includes(field)) {
					leftoverFields.push(field);
				}
			}
			orderedFields = orderedFields.filter(Boolean);
			uiModels[modelName].fields = orderedFields;
			nuiModels[modelName].fields = leftoverFields;
			nuiModels[modelName].attrs = models[modelName].attrs;
			fieldNames[modelName] = uiNames;
			fieldStrips[modelName] = uiStrips;
			// cr-prepare for next model
			orderedFields = [];
			leftoverFields = [];
			uiNames = '';
		}
		return [uiModels, nuiModels];
	}
	/**
	 * build models = Record<ModelName, Model>
	 * @param (schemaContent) from schema.prisma
	 */
	function parsePrismaSchema(schemaContent: string): void {
		models = {};
		type Fields = { name: string; type: string; attrs?: string }[];
		let fields: Fields = [];
		makeStrModelNames(schemaContent);
		let modelMatch = null;

		try {
			while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
				const [, modelName, body] = modelMatch;
				const modelAttrs: string[] = [];

				// // Remove block comments first
				let bodyWithoutBlocks = body.replace(/\/\*[\s\S]*?\*\//g, '');

				let lines = bodyWithoutBlocks
					.split('\n')
					.map((line) => line.trim().replace(/\s{2,}|\t/gm, ' '))
					.filter(Boolean);

				for (let line of lines) {
					line = line
						.trim()
						.replace(/String/g, 'string')
						.replace(/DateTime/g, 'Date')
						.replace(/Int/g, 'number')
						.replace(/Boolean/g, 'boolean')
						.replace(/[?]/g, '');

					if (line.startsWith('//')) {
						continue;
					}

					const parts = line.split(/\s+/); // split on whitespace

					if (line.startsWith('@@')) {
						// Block attribute
						modelAttrs.push(line);
					} else if (parts.length >= 2) {
						// build fields incrementally
						fields.push({
							name: parts[0],
							type: parts[1],
							attrs: parts.slice(2).join(' '),
						});
					}
				}
				models[modelName] = {
					fields: fields, //: sortObjectKeys(fields),
					attrs: modelAttrs,
				};

				fields = [];
			}
		} catch (err) {
			handleTryCatch(err);
		}
		[uiModels, nuiModels] = sortModelsByOrdered(models, UI.all);
		models = {};
	}

	parsePrismaSchema(schema);
	// schema = ''; TODO in Webview component get read from this file content

	// Prisma model displayed in a list of <summary>/<details>
	let prismaSumDetailsBlock = ``;
	// models = uiModels is another reference to the same uiModel
	// so we must deep copy to the models
	models = {};
	for (const [modelName, model] of Object.entries(uiModels)) {
		models[modelName] = { fields: [], attrs: [] };
		models[modelName].fields = model.fields;
	}
	for (const [modelName, model] of Object.entries(models)) {
		model.fields = [...model.fields, ...nuiModels[modelName].fields];
		model.attrs = nuiModels[modelName].attrs;
	}

	// Object.entries() return [key,value] -- key is modelName, value is model
	// fields cannot be deeply destructured as it is an array, which is not destructurable
	for (const [modelName, model] of Object.entries(models)) {
		prismaSumDetailsBlock += `<div class='cr-model-block>'>
		<details>
			<summary class='cr-model-name'>${modelName}</summary>
				<div  class='cr-fields-column'>
				`;
		for (const field of model.fields) {
			const { name, type, attrs } = field;
			if (
				attrs?.includes('@id') ||
				attrs?.includes('@default') ||
				attrs?.includes('@updatedAt') ||
				attrs?.includes('@unique')
			) {
				const color = attrs.includes('@id') ? 'lightgreen' : 'pink';
				prismaSumDetailsBlock += `<p>${name}</p><p>type:${type} <span style='color:${color}'>${attrs ?? 'na'}</span></p>`;
			} else {
				prismaSumDetailsBlock += `<p>${name}</p><p>type:${type} ${attrs ?? 'na'}</p>`;
			}
		}
		prismaSumDetailsBlock += `</div>
		`;
		for (const attr of model.attrs as string[]) {
			prismaSumDetailsBlock += `<p class='cr-model-attr'>${attr}</p>
			`;
		}
		prismaSumDetailsBlock += `</details>
		</div>
		`;
	}
	// we do not clear all the entries and rebuild from the fields
	// but just add a newly entered in the Field Name fieldNameId
	let fields: string[] = [];
	function anyOpenDetails() {
		let open = false;
		const dets = schemaContainerEl?.children as HTMLCollection;
		for (const child of Object.entries(dets)) {
			if ((child[1].children[0] as HTMLElement).hasAttribute('open')) {
				open = true;
			}
		}
		return open;
	}
	/**
	 * Closes all opened <details>
	 * @param dets
	 */
	function closeDetails(dets: HTMLCollection) {
		for (const child of Object.entries(dets)) {
			(child[1].children[0] as HTMLElement).removeAttribute('open');
		}
	}

	/**<details><summary>
	 * return built |fieldName: type| string of expanded fields
	 */
	let pipeElsString = `!`;

	/**
	 * clears candidate field list
	 */
	function clearListEls() {
		(fieldsListEl as HTMLDivElement).innerHTML = '';
	}

	/**
	 * Acceptable field: formatOK not in fieldStrips not in listEls is in fieldStrips[modelName]
	 * @param value
	 */
	function isFieldAcceptable(value: string) {
		msg = '';
		if (!fieldListsInitialized) {
			// not yet collected but Prisma fields are rendered initially
			return true;
		}
		// after delete from Candidates field is removed from
		// fieldStrips[modelName] stay intact to control what field could go to Candidates
		// while entry from getListEls() and fieldNames[modelName] are deleted
		const [, name, type] = value.match(/([^:]+):\s*(.+)?/) as string[];
		const formatValid = isFieldFormatValid(value);
		const inFieldStrips = isInFieldStrips(value);
		const inListEls = isInListEls({ name, type });

		if (inListEls) {
			msg = 'Already selected';
		} else if (!formatValid || !inFieldStrips) {
			msg = 'Invalid format or not UI field';
		}
		if (msg) {
			setLabelCaption('pink', msg, 2000, 'field');
			return false;
		}

		const tf =
			Object.values(uiModels[modelName].fields).find((el) => el.name === value.replace(/:.+$/, '')) !== undefined;

		if (tf) {
			return true;
		}
		setLabelCaption('pink', msg, 2000, 'field');
	}
	/**
	 * must have fieldName: valid type
	 * @param value
	 */
	const invfmt = ' Invalid format or type';
	function isFieldFormatValid(value: string) {
		if (!value.includes(':')) {
			msg += invfmt;
			return true;
		}
		value = value.trim().replace(/\s+/g, ' ');
		const [, name, type] = value.match(/([^:]+):\s*(.+)?/) as string[];
		const tf = name && type && '|string|number|boolean|Date|Role|'.includes(`|${type}|`);
		if (!tf) msg += invfmt;
		return tf;
	}

	/**
	 * fieldStrip in '|id: string|completed: boolean|updatedAt: Date|'
	 * @param field
	 */
	function isInFieldStrips(fieldStrip: string) {
		const tf = fieldStrips[modelName].includes(`|${fieldStrip}|`);
		if (!tf) msg += unacceptable;
		return tf;
	}
	function isInListEls(field: Field) {
		return fieldsListEl.innerText.includes(`${field.name}: ${field.type}`);
	}
	function addToFieldList(fieldName: string) {
		// Create nested  elements
		const span = document.createElement('span');
		span.textContent = fieldName;
		const div = document.createElement('div');
		div.className = 'cr-list-el'; // TODO is this necessary
		// Append span to div
		div.appendChild(span);

		// rendering simple div via innerHTML is slow compared to objects
		// div.innerHTML = `<span class='cr-list-el'>${fieldName}</span>`;
		// append div to the fieldsListEl
		(fieldsListEl as HTMLDivElement).appendChild(div);
	}
	/**
	 * renders a field showing a tooltop 'click to remove' when hovered
	 * @param fieldName
	 */
	function renderField(fieldName: string) {
		setTimeout(() => {
			addToFieldList(fieldName);
			fieldListsInitialized = true;
		}, 0);
	}

	/**
	 * scrols fields list to show the last element
	 * @param el
	 */
	const scroll = (el: HTMLDivElement) => {
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};
	/**
	 * ensures field entry is a fieldName: type
	 * @param val
	 */
	function adjustFiledNameAndType(val: string) {
		val = val.replace(/\\s+/g, '');

		const m = val.match(/\s*([a-zA-z0-9_]+)\s*:?\s*([a-zA-z0-9_]+)?$/);
		if (!m) return val;
		if (m[2]) {
			val = `${m[1]}: ${m[2]}`;
		}
		return val;
	}
	/**
	 * clear a label message after timeout
	 */
	function clearLabelText() {
		clearTimeout(Number(timer));

		routeLabelEl.style.color = '';
		routeLabelNode.textContent = 'Route Name';
	}
	/**
	 * temporarily change label text and returns after timeoit
	 * @param color
	 * @param text
	 * @param duration
	 */
	function setLabelCaption(color: string, text: string, duration: number, type: string = 'route') {
		// preserve text to restore at timeout
		const [node, label, restore] =
			type === 'route'
				? [routeLabelNode, routeLabelEl, 'Route Name']
				: [fieldLabelNode, fieldLabelEl, fieldNameAndType];
		node.textContent = text;
		label.style.color = color;
		if (duration > 0) {
			timer = setTimeout(() => {
				node.textContent = restore;
				label.style.color = '';
			}, duration);
		} else if (color === 'pink') {
			clear = [node, label];
		}
	}
	let clear: Array<HTMLElement> = [];
	let nokeyup = false;
	setTimeout(() => {
		if (fieldNameEl) {
			(routeNameEl as HTMLInputElement).addEventListener('keyup', (_) => {
				setButtonAvailability();
			});
			(fieldNameEl as HTMLInputElement).addEventListener('change', (event: Event) => {
				nokeyup = true;
				if (clear.length) {
					setLabelCaption('black', 'FieldName and Type', 0, 'field');
					clear = [];
				}
				const value = (event.target as HTMLInputElement).value.trim();
				if (!value || !isFieldAcceptable(value)) {
					return;
				}
				renderField(value);
				setButtonAvailability();
			});
			(fieldNameEl as HTMLInputElement).addEventListener('keyup', (event: KeyboardEvent) => {
				if (nokeyup) {
					nokeyup = false;
					return;
				}

				let fieldName = (fieldNameEl as HTMLInputElement).value.trim();
				if (!fieldName || !isFieldAcceptable(fieldName) || event.key !== 'Enter') {
					return;
				}

				fieldNameEl.value = '';
				if (deletedFields.has(fieldName)) {
					(fieldsListEl as HTMLDivElement).appendChild(deletedFields.get(fieldName) as Node);
					deletedFields.delete(fieldName);
					return;
				}

				fieldName = adjustFiledNameAndType(fieldName);
				renderField(fieldName);
				scroll(fieldsListEl as HTMLDivElement as HTMLDivElement);
			});
		}
	}, 200);

	function onMouseOver(e: MouseEvent) {
		const el = e.target as HTMLElement;
		removeHintEl.style.top = String(el.offsetTop - el.offsetHeight) + 'px';
		removeHintEl.style.left = String(el.offsetLeft + 12) + 'px';
		removeHintEl.style.opacity = '1';
	}

	function onMouseOut(_: MouseEvent) {
		removeHintEl.style.opacity = '0';
	}
	function onDrop(_: MouseEvent) {
		console.log('onDrop');
	}

	function setButtonAvailability() {
		buttonNotAllowed = !fieldsListEl.innerText || !routeNameEl.value;
	}
	function onClick(e: MouseEvent) {
		const el = e.target as HTMLElement;
		removeHintEl.style.opacity = '0';

		if (fieldNameEl.value === '') {
			fieldNameEl.value = el.innerText;
			fieldNameEl.focus();
		}
		deletedFields.set(el.innerText, el);
		el.remove();
		setButtonAvailability();
	}

	nuiModels = {};
	onMount(() => {
		fieldNameEl = document.getElementById('fieldNameId') as HTMLInputElement;
		schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		fieldsListEl = document.getElementById('fieldsListId') as HTMLDivElement;
		middleColumnEl = document.getElementById('middleColumnId') as HTMLDivElement;
		removeHintEl = document.getElementById('removeHintId') as HTMLParagraphElement;
		routeNameEl = document.getElementById('routeNameId') as HTMLInputElement;
		removeHintEl.style.opacity = '0'; // make it as a cr-hidden tooltip
		routeLabelEl = document.querySelector("label[for='routeNameId']") as HTMLLabelElement;
		fieldLabelEl = document.querySelector("label[for='fieldNameId']") as HTMLLabelElement;
		routeLabelNode = Array.from(routeLabelEl.childNodes).filter(
			(node) => node.nodeType === Node.TEXT_NODE
		)[0] as HTMLElement;
		fieldLabelNode = Array.from(fieldLabelEl.childNodes).filter(
			(node) => node.nodeType === Node.TEXT_NODE
		)[0] as HTMLElement;
		schemaContainerEl.innerHTML = prismaSumDetailsBlock;

		schemaContainerEl!.addEventListener('click', async (event: MouseEvent) => {
			if ((event.target as HTMLElement).tagName === 'SUMMARY') {
				middleColumnEl.classList.toggle('cr-middle-column-height');
				// now at app level active modelName
				modelName = (event.target as HTMLElement).innerText;
				const details = (event.target as HTMLElement).closest('details');
				if (details && details.open) {
					stopRenderField = true;
					setTimeout(() => {
						// has to use setTimeout as the element is still in opening
						details.removeAttribute('open');
						stopRenderField = false;
						(fieldsListEl as HTMLDivElement).innerHTML = '';
						fieldNameEl.value = '';
					}, 200);
					clearLabelText();
					pipeElsString = `!`;
					clearListEls();
					closeSchemaModels();
					eh.destroy();
					return;
				}
				if (anyOpenDetails()) {
					closeSchemaModels();
					await sleep(500);
				}
				setLabelCaption('pink', 'Change Route Name if necessary', 4000);
				// ------------ adding fields into listEls --------------------
				routeNameEl.value = modelName.toLowerCase();
				fields = [];
				for (const field of uiModels[modelName].fields) {
					if (stopRenderField) {
						break;
					}
					const fld = `${field.name}: ${field.type}`;
					fields.push(fld);
					renderField(fld);
					await sleep(100);
				}
				if (pipeElsString === '!') {
					for (const field of uiModels[modelName].fields) {
						pipeElsString += `${field.name}: ${field.type}|`;
					}
				}
				// field list takes time to load field names
				setTimeout(() => {
					fieldsListEl.ondrop = onDrop;
					eh.setup(fieldsListEl, {
						click: onClick,
						mouseover: onMouseOver,
						mouseout: onMouseOut,
					});
					// drag-drop to move fieldNames up and down the fields list
					eh.setup(fieldsListEl);
					buttonNotAllowed = false;
				}, 0);

				//----------------
			} else {
				// ----------- PRISMA KEYUP HANDLER clicked on a field name in <details> block ---------------
				const el = event.target as HTMLDivElement;
				let fieldName = el.innerText;
				try {
					const type = el.nextSibling?.textContent?.match(/type:(\w+)/)?.[1] as string;
					fieldName += ': ' + type;
				} catch (err: unknown) {
					handleTryCatch(err);
				}
				if (!isFieldAcceptable(fieldName)) {
					return;
				}
				fieldNameEl.value = '';
				if (deletedFields.has(fieldName)) {
					(fieldsListEl as HTMLDivElement).appendChild(deletedFields.get(fieldName) as Node);
					setButtonAvailability();
					deletedFields.delete(fieldName);
					return;
				}
				renderField(fieldName);
				fieldStrips[modelName] += fieldName + '|';
			}
		});
		// for (let i = 1; i < 10; i++) {
		// 	console.log(localStorage.getItem(`click-over-out${i}`));
		// 	console.log(localStorage.getItem(`drag-drop${i}`));
		// }
		// localStorage.clear();
		return () => {
			eh.destroy();
		};
	});

	// -----------------------------------
	// for Wevschema Extension
	let stopRenderField = false;
	function closeSchemaModels() {
		stopRenderField = true;
		fields = [];
		routeNameEl.value = '';
		fieldNameEl.value = '';
		const children = schemaContainerEl?.children as HTMLCollection;
		closeDetails(children);
		buttonNotAllowed = true;
		setTimeout(() => {
			fieldsListEl.innerHTML = '';
			stopRenderField = false;
			deletedFields.clear();
		}, 400);
	}
	let buttonNotAllowed = $state<boolean>(true);
</script>

<svelte:head>
	<title>CRUD Support</title>
</svelte:head>

<div id="crudUIBlockId" class="cr-main-grid">
	<div class="cr-grid-wrapper">
		<cr-pre class="cr-span-two">
			To create a UI Form for CRUD operations against the underlying ORM fill out the <i>Candidate Fields</i>
			by entering field names in the <i>Field Name and Type</i> input box with its datatype, e.g. firstName: string, and
			cr-pressing the Enter key or expand a table from the
			<i>Select Fields from ORM</i> block and click on a field name avoiding the auto-generating fields usually colored in
			pink. The UI Form +page.svelte with accompanying +page.server.ts will be created in the route specified in the Route
			Name input box.
		</cr-pre>

		<div class="cr-left-column">
			<label for="routeNameId"> Route Name </label>
			<input id="routeNameId" type="text" placeholder="app name equal routes folder name" />
			<label for="fieldNameId"> Field Name and Type </label>
			<input id="fieldNameId" type="text" placeholder="fieldName: type" />
			<div id="createBtnId" style="font-size: 14px !important;cursor:pointer;" class:notallowed={buttonNotAllowed}>
				Create CRUD Support
			</div>
			<div class="cr-crud-support-done cr-hidden"></div>
			<div id="messagesId" style="z-index:10;width:20rem;">Messages:</div>
		</div>

		<div id="middleColumnId" class="cr-middle-column cr-middle-column-height">
			<div class="cr-fields-list cr-fields-list-height" id="fieldsListId"></div>
			<p id="removeHintId" class="cr-remove-hint">click to remove</p>
		</div>

		<div style="display:flex;height:1.4rem !important;margin:0;padding:0;align-items:center;grid-column: span 2;">
			<p style="display:inline-block;width:max-content;margin-right:1rem;">Render all input boxes the same CSS width</p>
			<input
				id="inputBoxWidthId"
				type="text"
				value="16rem"
				style="margin:0 1rem 0 0; padding:0 0 0 1rem;width:7rem;height:1.2rem !important;line-height:1.1rem;display:inline-block;font-size:13px;"
				placeholder="CSS px, rem, ..."
			/>
		</div>
		<div class="embellishments">
			<div class="checkbox-item">
				<input id="CRInput" type="checkbox" checked />
				<label for="CRInput">CRInput component</label>
			</div>
			<div class="checkbox-item">
				<input id="CRSpinner" type="checkbox" checked />
				<label for="CRSpinner">CRSpinner component</label>
			</div>
			<div class="checkbox-item">
				<input id="CRActivity" type="checkbox" checked />
				<label for="CRActivity">CRActivity component</label>
			</div>
			<div class="checkbox-item">
				<input id="CRTooltip" type="checkbox" checked />
				<label for="CRTooltip">Tooltip component</label>
			</div>
			<div class="checkbox-item">
				<input id="CRSummaryDetail" type="checkbox" checked />
				<label for="CRSummaryDetail">Summary/Details component</label>
			</div>
		</div>
	</div>

	<div id="rightColumnId" class="cr-right-column">
		<div id="schemaContainerId"></div>
	</div>
</div>

<style lang="scss">
	.cr-main-grid {
		display: grid;
		padding: 0.6rem 0 0 0.6rem;
		grid-template-columns: 33rem 20rem;
		margin-top: 0.5rem;
		width: 100vw;
	}

	.cr-grid-wrapper {
		display: grid;
		grid-template-columns: 20rem 12rem;
		column-gap: 0.5rem;
		row-gap: 1rem;
	}
	.cr-crud-support-done {
		width: max-content;
		padding: 5px 2rem;
		margin: 1rem 0 0 0;
		color: lightgreen;
		font-size: 14px;
		border: 1px solid gray;
		border-radius: 5px;
		cursor: pointer;
		text-align: center;
	}

	.cr-hidden {
		display: none;
		border: none;
	}

	.cr-left-column {
		@include container($head: 'Application Settings', $head-color: navy);
		border: 1px solid gray;
		border-radius: 8px;
		height: 54vh;
		padding: 1rem 0 0 0.7rem;
		background-color: var(--panel-bg-color);
		label {
			display: block;
			color: var(--candidate-color);
		}
		// div {
		//   display: block;
		// }
	}

	.cr-middle-column {
		@include container($head: 'Candidate Fields', $head-color: navy);
		position: relative;
		border: 1px solid gray;
		border-radius: 5px;
		padding: 1rem 6px 0 6px;
		height: auto;
		width: 12rem;
		background-color: var(--panel-bg-color);
	}

	:global(.cr-fields-list) {
		display: grid;
		grid-template-rows: 1.3rem;
		grid-auto-rows: 1.3rem;
		cursor: pointer;
		text-align: center;
		padding: 0;
		margin: 0 0 2rem 0;
		color: navy;
		:global(.cr-list-el) {
			background: var(--candidate-bg-color);
			color: var(--candidate-color);
			border: 1px solid #ccc;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		:global(.cr-list-el:first-child) {
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
		}
		:global(.cr-list-el:last-child) {
			border-bottom-left-radius: 10px;
			border-bottom-right-radius: 10px;
		}
	}
	.cr-remove-hint {
		position: absolute;
		left: 1.5rem !important;
		z-index: 10;
		font-size: 12px;
		color: red;
		padding: 0 0.5rem 1px 0.5rem;
		background-color: cornsilk;
		opacity: 0;
		text-align: center;
		border: 1px solid lightgray;
		border-radius: 5px;
		transition: opacity 0.2s;
		pointer-events: none;
		white-space: nowrap;
	}
	.cr-span-two,
	cr-pre {
		grid-column: 1 / span 2;
		text-align: justify;
		font-size: 12px;
		color: var(--pre-color);
	}
	input[type='text'] {
		width: 18rem;
		height: 20px;
		padding: 6px 0 8px 1rem;
		outline: none;
		font-size: 16px;
		border: 1px solid gray;
		border-radius: 4px;
		outline: 1px solid transparent;
		margin-top: 8px;
		margin-bottom: 10px;
		&::placeholder {
			font-size: 13px;
		}
		&:focus {
			outline: 1px solid gray;
		}
	}

	#schemaContainerId {
		height: 30rem;
		overflow-y: auto;
	}

	.cr-right-column {
		position: relative;
		@include container($head: 'Select UI Fields from ORM', $head-color: navy);
		background-color: var(--panel-bg-color);
	}
	.embellishments {
		@include container($head: 'Include Components', $head-color: navy);
		background-color: var(--panel-bg-color);

		position: relative;
		grid-column: span 2;
		display: grid;
		grid-template-columns: 1rem 20rem;

		column-gap: 0.5rem;
		row-gap: 0.1rem;
		align-items: center;
		padding: 8px 1rem;
		border: 1px solid gray;
		border-radius: 6px;
		user-select: none;
	}
	input {
		color: var(--input-color);
		background-color: var(--input-bg-color);
	}
	.checkbox-item {
		display: contents;
	}

	.checkbox-item input[type='checkbox'] {
		grid-column: 1;
		justify-self: start;
		align-self: center;
		margin: 0;
	}

	.checkbox-item label {
		grid-column: 2;
		justify-self: start;
		align-self: center;
		cursor: pointer;
		line-height: 1;
		width: 25rem !important;
	}

	.checkbox-item label:hover {
		background-color: cornsilk;
		cursor: pointer;
		width: 25rem !important;
	}
	:global(.cr-model-attr) {
		grid-column: span 2;
		width: 18rem;
		padding: 0;
		margin: 0 0 0 1rem;
		text-wrap: wrap;
		color: tomato;
		font-size: 13px;
	}
	:global(.cr-model-block) {
		height: 30rem;
		overflow-y: auto;
	}
	:global(.cr-model-name) {
		color: var(--summary-color);
		background-color: var(--summary-bg-color);
		margin-top: 3px;
		width: 18rem;
		border-radius: 6px;
		padding-left: 1rem;
		cursor: pointer;
	}

	:global(.cr-fields-column) {
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

	:global(.cr-fields-column p) {
		margin: 4px 0 0 0;
		padding: 2px 0 4px 6px;
		border-bottom: 1px solid lightgray;
		text-wrap: wrap;
	}

	:global(.cr-fields-column p:nth-child(odd)) {
		color: skyblue;
		cursor: pointer;
		width: 100%;
		padding: 2px 0 2px 0.5rem;
	}

	:global(.cr-fields-column p:nth-child(even)) {
		font-weight: 400 !important;
		font-size: 12px !important; /* prisma attrs column */
	}
	#createBtnId {
		outline: none;
		border: 1px solid gray;
		border-radius: 5px;
		font-weight: 400;
		padding: 4px 1rem;
		color: #f8f9fa;
		background-color: navy;
		border: 1px solid gray;
		width: max-content;
		cursor: pointer;
	}
	.notallowed {
		opacity: 0.3;
		cursor: not-allowed;
	}
</style>
