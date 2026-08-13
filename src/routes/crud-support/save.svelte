<script lang="ts">
	import { onMount } from 'svelte';
	// import { browser } from '$app/environment';
	import { schema } from './schema_prisma.ts';
	import { handleTryCatch } from '$lib/utils/index';
	// import { createEventHandler } from '$lib/utils';
	import { createEventHandler } from '../grok/event-handler';

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

	type fieldNames = {
		modelName: string;
		namesList: string;
	};
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
		'updatedAt',
		'priority',
		'price',
	];
	let strModelNames = '|';
	const modelRegex = /model\s+(\w+)\s*{([^}]*)}/gms;
	const eh = createEventHandler();

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

	let timer: NodeJS.Timeout | string | number | undefined; //ReturnValue<typeof setTimeout>;
	let fieldNameAndType = 'Field Name and Type';
	let unacceptable = '  not a UI field';
	// global msg set by isFieldFormatValid, isInFieldStrips and isInListEls
	let msg = '';

	/**
	 * build models = Record<ModelName, Model>
	 * @param (schemaContent) from schema.prisma
	 */
	function parsePrismaSchema(schemaContent: string): void {
		models = {};
		type Fields = { name: string; type: string; attrs?: string }[];
		let fields: Fields = [];
		let modelMatch = null;

		/**
		 *  LEADING array part sorted by ordered followed by leftowers
		 */
		function sortModelsByOrdered(models: Models, kind: UIType = UI.all) {
			let orderedFields: { name: string; type: string; attrs?: string }[] = [];
			let leftoverFields: { name: string; type: string; attrs?: string }[] = [];

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

		while ((modelMatch = modelRegex.exec(schemaContent)) !== null) {
			strModelNames += modelMatch[1] + '|';
		}

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
	// for finding an element from the fields list every fieldName is given id
	// as data-field-index HTML attribute and retrieved on click event and read
	// as element.dataset.fieldIndex
	// const getUniqueId = () => {
	// 	// convert to a string from an integer of base 36
	// 	return Math.random().toString(36).slice(2);
	// };

	// we do not clear all the entries and rebuild from the fields
	// but just add a newly entered in the Field Name fieldNameId
	let fields: string[] = [];
	/**
	 * Closes all opened <details>
	 * @param dets
	 */
	function closeDetails(dets: HTMLCollection) {
		for (const child of Object.entries(dets)) {
			(child[1].children[0] as HTMLElement).removeAttribute('open');
		}
	}

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
		// innerText "id: string"
		// after delete from Candidates field is removed from
		// fieldStrips[modelName] stay intact to control what field could go to Candidates
		if (!value.includes(':')) {
			setLabelCaption('pink', 'Invalid format -- no Type', 3000, 'field');
			return false;
		}
		// const [, name, type] = value.match(/([^:]+):\s*(.+)?/) as string[];
		const formatValid = isFieldFormatValid(value);
		const inFieldStrips = isInFieldStrips(value);
		const inListEls = fieldsListEl.innerText.includes(value);
		if (!formatValid || !inFieldStrips || inListEls) {
			if (formatValid && inFieldStrips && inListEls) {
				msg = 'Already selected';
			}
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
	function addMsg(str: string) {
		if (msg.includes(str)) return;
		msg += str;
	}
	/**
	 * must have fieldName: valid type
	 * @param value
	 */
	const invfmt = ' Invalid format or Type';
	function isFieldFormatValid(value: string) {
		if (!value.includes(':')) {
			addMsg(invfmt);
			return true;
		}
		value = value.trim().replace(/\s+/g, ' ');
		const [, name, type] = value.match(/([^:]+):\s*(.+)?/) as string[];
		const tf = name && type && '|string|number|boolean|Date|Role|'.includes(`|${type}|`);
		if (!tf) addMsg(invfmt);
		return tf;
	}

	/**
	 * fieldStrip in '|id: string|completed: boolean|updatedAt: Date|'
	 * @param field
	 */
	function isInFieldStrips(fieldStrip: string) {
		const tf = fieldStrips[modelName].includes(`|${fieldStrip}|`);
		if (!tf) addMsg(unacceptable);
		return tf;
	}

	function addToFieldList(fieldName: string) {
		// Create nested  elements
		// const spanEl = document.createElement('span');
		// spanEl.textContent = fieldName;

		const divEl = document.createElement('div');

		divEl.innerHTML =
			"<div data-event-list='click mouseover mouseout' draggable='true'><span>" + fieldName + '</span></div>';

		// Append spanEl to divEl
		// divEl.appendChild(spanEl);
		// append divEl to the fieldsListEl
		(fieldsListEl as HTMLDivElement).appendChild(divEl);
		return divEl;
	}

	// Event  handlers for CandidateList items click, mouseover, mouseout
	function candidateMouseover(event: MouseEvent) {
		const el = event.target as HTMLDivElement;
		removeHintEl.style.top = String(el.offsetTop - el.offsetHeight) + 'px';
		removeHintEl.style.left = String(el.offsetLeft + 12) + 'px';
		removeHintEl.style.opacity = '1';
	}
	function candidateMouseout(_: MouseEvent) {
		removeHintEl.style.opacity = '0';
	}
	function candidateClick(event: MouseEvent) {
		let el = event.target as HTMLElement;
		// if the el is span only field name/item-text is
		// cleared so take the parent div to remove the field
		if (el.tagName === 'SPAN') {
			el = el.parentElement as HTMLDivElement;
		}
		removeHintEl.style.opacity = '0';

		if (fieldNameEl.value === '') {
			fieldNameEl.value = el.innerText;
			fieldNameEl.focus();
		}
		if (el.innerText) {
			const fn = el.innerText.match(/([^:]+)/)?.[1];
			fieldNames[modelName] = fieldNames[modelName].replace(new RegExp(`\\|${fn}\\|`), '|');
		}

		el.remove();
	}

	/**
	 * renders a field showing a tooltop 'click to remove' when hovered
	 * @param fieldName
	 */
	function renderField(fieldName: string) {
		if (!isFieldAcceptable(fieldName)) {
			return;
		}
		// enter a single field
		addToFieldList(fieldName);
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
		clearTimeout(timer);

		routeLabelEl.style.color = '';
		routeLabelNode.textContent = 'Route Name';
	}
	/**
	 * temporarily change label text and returns after timeoit
	 * @param color
	 * @param text
	 * @param duration
	 */
	function setLabelCaption(text: string, duration: number, type: string = 'route') {
		const color = document.documentElement.classList.contains('dark') ? 'pink' : 'red';
		// preserve text to restore at timeout
		const [node, restore] = type === 'route' ? [routeLabelNode, 'Route Name'] : [fieldLabelNode, fieldNameAndType];
		node.textContent = text;
		(node.parentElement as HTMLLabelElement).style.color = color;
		if (duration > 0) {
			timer = setTimeout(() => {
				node.textContent = restore;
				(node.parentElement as HTMLLabelElement).style.color = '';
			}, duration);
		} else if (color === 'pink') {
			clear = [node];
		}
	}
	let clear: Array<HTMLElement> = [];
	let nokeyup = false;
	setTimeout(() => {
		if (fieldNameEl) {
			// --------- field name data entry handler ---------------

			(fieldNameEl as HTMLInputElement).addEventListener('change', (event: Event) => {
				// --------- field name data entry handler ---------------
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
			});
			// ------------- KEYUP HANDLER  keyboard handler ---------------------
			(fieldNameEl as HTMLInputElement).addEventListener('keyup', (event: KeyboardEvent) => {
				// ----------- KEYUP HANDLER  keyboard handler ---------------------

				if (nokeyup) {
					nokeyup = false;
					return;
				}

				let value = (fieldNameEl as HTMLInputElement).value.trim();
				if (!value || !isFieldAcceptable(value) || event.key !== 'Enter') {
					return;
				}

				value = adjustFiledNameAndType(value);
				renderField(value);
				scroll(fieldsListEl as HTMLDivElement);
			});
		}
	}, 200);

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

		// ------------ click on SUMMARY or DETAILS -----------------

		schemaContainerEl!.addEventListener('click', async (event: MouseEvent) => {
			// ------------ click on SUMMARY or DETAILS -----------------
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
					clearListEls();
					routeNameEl.value = '';
					return;
				}
				setLabelCaption('Change Route Name if necessary', 4000);
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
				}
				fieldListsInitialized = true;
				eh.setup(fieldsListEl, {
					click: candidateClick,
					mouseenter: candidateMouseover,
					mouseleave: candidateMouseout,
				});
				//----------------
			} else {
				// ----------- PRISMA KEYUP HANDLER clicked on a field name in <details> block ---------------

				const el = event.target as HTMLDivElement;
				let fieldStr = el.innerText;
				try {
					const type = el.nextSibling?.textContent?.match(/type:(\w+)/)?.[1] as string;
					fieldStr += ': ' + type;
				} catch (err: unknown) {
					handleTryCatch(err);
				}

				if (!isFieldAcceptable(fieldStr)) {
					return;
				}
				renderField(fieldStr);
				fieldStrips[modelName] += fieldStr + '|';
			}
		});
		// eh.setup(fieldsListEl, {
		// 	click: candidateClick,
		// 	mouseenter: candidateMouseover,
		// 	mouseleave: candidateMouseout
		// });
		// eh.setup(fieldsListEl);
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
		setTimeout(() => {
			fieldsListEl.innerHTML = '';
			stopRenderField = false;
		}, 100);
	}
</script>

<div id="crudUIBlockId" class="cr-main-grid">
	<div class="cr-grid-wrapper">
		<cr-pre class="cr-span-two">
			To create a UI Form for CRUD operations against the underlying ORM fill out the <i> Candidate Fields </i>
			by entering field names in the <i>Field Name and Type</i> input box with its datatype, e.g. firstName: string, and
			pressing the Enter key or expand a table from the
			<i>Select Fields from ORM</i> block and click on a field name avoiding the auto-generating fields usually colored in
			pink.The UI Form + page.svelte with accompanying + page.server.ts will be created in the route specified in the Route
			Name input box.
		</cr-pre>

		<div class="cr-left-column">
			<label for="routeNameId"> Route Name </label>
			<input id="routeNameId" type="text" placeholder="app name equal routes folder name" />
			<label for="fieldNameId"> Field Name and Type </label>
			<input id="fieldNameId" type="text" placeholder="fieldName: type" />
			<button id="createBtnId" disabled> Create CRUD Support </button>
			<div class="cr-crud-support-done cr-hidden"></div>
			<div id="messagesId" style="z-index:10;width:20rem;">Messages:</div>
		</div>

		<div id="middleColumnId" class="cr-middle-column cr-middle-column-height">
			<div class="cr-fields-list" id="fieldsListId"></div>
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
				<label for="CRInput"> CRInput component </label>
			</div>
			<div class="checkbox-item">
				<input id="CRSpinner" type="checkbox" checked />
				<label for="CRSpinner"> CRSpinner component </label>
			</div>
			<div class="checkbox-item">
				<input id="CRActivity" type="checkbox" checked />
				<label for="CRActivity"> CRActivity component </label>
			</div>
			<div class="checkbox-item">
				<input id="CRTooltip" type="checkbox" checked />
				<label for="CRTooltip"> Tooltip component </label>
			</div>
			<div class="checkbox-item">
				<input id="CRSummaryDetail" type="checkbox" checked />
				<label for="CRSummaryDetail"> Summary / Details component </label>
			</div>
		</div>
	</div>

	<div id="rightColumnId" class="cr-right-column">
		<p class="collapse-all" onclick={closeSchemaModels} onkeypress={closeSchemaModels} aria-hidden={true}>
			(collapse all)
		</p>
		<div id="schemaContainerId"></div>
	</div>
</div>

<style lang="scss">
	.cr-main-grid {
		display: grid;
		grid-template-columns: 33rem 20rem;
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
		@include container($head: 'Application Settings', $head-color: skyblue);
		border: 1px solid gray;
		border-radius: 8px;
		height: 60vh;
		padding: 1rem 0 0 0.4rem;
		label,
		button,
		div {
			display: block;
		}
	}

	.cr-middle-column {
		@include container($head: 'Candidate Fields', $head-color: skyblue);
		position: relative;
		border: 1px solid gray;
		border-radius: 5px;
		padding: 1rem 6px 0 6px;
		height: auto;
		width: 12rem;
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
		user-select: none;
		:global(div) {
			background-color: #f0f8ff;
			border: 1px solid #ccc;
			display: flex;
			align-items: center;
			justify-content: center;
		}
		:global(div:first-child) {
			border-top-left-radius: 10px;
			border-top-right-radius: 10px;
		}
		:global(div:last-child) {
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
		color: skyblue;
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
		@include container($head: 'Select UI Fields from ORM', $head-color: skyblue);
	}
	.embellishments {
		@include container($head: 'Include Components', $head-color: skyblue);

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
		color: #3e3e3e;
		background-color: #e3e3e3;
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
</style>
