<script lang="ts">
	import { tick, onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { capitalize } from '$lib/utils';
	// import { showConfirmation } from '$lib/utils';
	import Tooltip from './CRReactiveTooltip.svelte';
	import CRUserRolesSelect from './CRUserRolesSelect.svelte';

	let tooltip: Tooltip;

	export type TProps = {
		models: Models;
		selectedModels: SelectedModels;
		isLoading: boolean;
		userRoles: string[];
	};

	let {
		models = $bindable({}),
		selectedModels = $bindable({}),
		isLoading = $bindable(false),
		userRoles = [],
	}: TProps = $props();

	let cbGroup = $state<string[]>([]);
	let rbGroup = $state('');
	let details = $state<HTMLDetailsElement[]>([]);
	let lastHoveredDetails = $state<HTMLDetailsElement | null>(null);

	function anySelected() {
		return Object.keys(selectedModels).length > 0;
	}

	let tooltipBlockEl = $state<HTMLDivElement>();
	let emptyModel: Model = { fields: [], attrs: [] };
	let includeAll = 'All'; // last word for models in CRRBTooltip -- here is 'Both'
	let newModelName = $state('');
	let newModelNameCap = $derived(capitalize(newModelName));
	let extraModels = new SvelteSet<string>();
	let extraModelsSize = $derived([...extraModels].length);
	let notDataEntryEl: HTMLDivElement;
	let modelWrapperEl: HTMLDivElement;
	let hoveredEl: HTMLElement | null = null;

	let tooltipMessage = $state('not data entry field');
	let fieldsRect = $state<DOMRect | undefined>(undefined);
	const defaultMessage = 'Add/Remove extra model like Login, Admin,...';
	const alreadyDefined = 'Module is already registered';
	const notRegistered = 'Module is not registered yet';
	const noModelName = 'Please enter model name';
	let modelName = $state('');
	let message = $state(defaultMessage);
	let messageColor = $derived(message === defaultMessage ? '' : 'color:tomato;');
	const nuiRegex = new RegExp(`\\b@id|@defaults|@updatedAt|@unique\\b`, 'g');

	export const exportModels = async () => {
		selectedModels = {};
		await tick();
		for (const modelName of cbGroup) {
			const routeName = (modelWrapperEl.querySelector(`#route${modelName}`) as HTMLInputElement).value;
			const permissions = models[modelName]?.permissions as string;
			if (!selectedModels[routeName]) {
				selectedModels[routeName] = {};
				(selectedModels[routeName] as SelectedModel)[modelName] = {
					routeName,
					permissions,
				};
			}
		}
	};
	function fieldAttrsClass(field: Field) {
		return nuiRegex.test(field.attrs as string) ? 'attr-id' : '';
	}
	function fieldAttrs(field: Field) {
		return field.attrs ?? 'no attributes';
	}
	function toggleSelectAllModels(e: MouseEvent) {
		const el = e.target as HTMLParagraphElement;
		const newState = el.innerText.includes('select all') ? true : false;
		cbGroup = [];
		if (newState) {
			for (const modelName of Object.keys(models)) {
				cbGroup.push(modelName);
			}
		}
		el.innerText = newState ? '(clear all)' : '(select all)';
		setTimeout(() => {
			exportModels();
		}, 400);
	}

	function getUIField(fieldName: string) {
		const fld = models[modelName]?.fields.find((field) => field.name === fieldName) as Field;
		return fld;
	}

	// called from tooltipBlockEl tooltip when radio buttons wrapper fires click event
	// async function addFieldToModel(e: Event) {
	// 	// console.log('e.currentTarget', e.currentTarget);
	// 	// const rb = (e.currentTarget as HTMLElement).querySelector('input[type="radio"]:checked') as HTMLInputElement;
	// 	// if (!rb) {
	// 	// 	console.log('radio not found');
	// 	// 	return;
	// 	// }
	// 	// NOTE rbGroup does not work
	// 	// if (!rbGroup) {
	// 	// 	if (rb.nodeName === 'INPUT') {
	// 	// 		rbGroup = rb.value;
	// 	// 		// rb.checked = false;
	// 	// 		await tick();
	// 	// 	}
	// 	// }
	// 	(tooltipBlockEl as HTMLDivElement).style.opacity = '0';

	// 	try {
	// 		if (!hoveredEl) {
	// 			console.log('no hoveredEl');
	// 			return;
	// 		}
	// 		await tick();
	// 		if (!rbGroup) {
	// 			console.log('no rbGroup');
	// 			return;
	// 		}

	// 		const fieldName = hoveredEl?.innerText as string;
	// 		const field = getUIField(fieldName);
	// 		if (field) {
	// 			if (/password/i.test(field.name)) {
	// 				field.attrs = 'renamed into password at UI';
	// 				await tick();
	// 			}
	// 			await tick();
	// 			console.log('rbGroup should include field?', rbGroup, field.name);
	// 			if (rbGroup === includeAll) {
	// 				for (const m of extraModels) {
	// 					if (models[m]) {
	// 						const exists = models[m].fields.some((f) => f.name === field.name);
	// 						if (!exists) {
	// 							// Reassigning array guarantees Svelte 5 reactivity trigger
	// 							models[m].fields = [...models[m].fields, { ...field }];
	// 							await tick();
	// 						}
	// 					}
	// 				}
	// 			} else {
	// 				const exists = models[rbGroup]?.fields.some((f) => f.name === field.name);
	// 				if (!exists) {
	// 					models[rbGroup]?.fields.push({ ...field }); // push a clean copy
	// 					await tick();
	// 				} else {
	// 					console.log('field incuded already', field.name);
	// 				}
	// 			}
	// 		}
	// 		rbGroup = '';
	// 	} catch (err: unknown) {
	// 		const msg = err instanceof Error ? err.message : String(err);
	// 		console.log('catch/addFieldToModel', msg);
	// 	}
	// 	if (anySelected()) {
	// 		exportModels();
	// 	}
	// }

	function isInside(e: MouseEvent) {
		if (!fieldsRect) {
			console.log('isInside no fieldsRect');
			return;
		}
		const rect = fieldsRect as DOMRect; // as defined DOMRect | undefined
		const result =
			e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
		return result;
	}

	// if extraModels are defined we can copy models fields to them
	let previousEl = $state<HTMLElement>();
	async function showCopyFieldTooltip(e: MouseEvent) {
		e.preventDefault();
		if (!extraModelsSize) {
			return;
		}
		if (previousEl) {
			previousEl.style.color = '';
		}
		console.log('showCopyFieldTooltip');
		const el = e.currentTarget as HTMLElement;
		if (!el) return;

		previousEl = el;
		el.style.color = 'tomato';
		// (tooltipBlockEl as HTMLDivElement).style.opacity = '0';
		// const el = e.target as HTMLElement;
		const dataset = el.dataset;
		// not a data-entry/UI field and mot passwordHash or simmilar
		if (dataset.entry === 'false' && !/password/i.test(el.innerText)) {
			return;
		}
		await tick();

		hoveredEl = el;
		console.log('fieldsRect', fieldsRect);
		let x = e.clientX + 5;
		const y = e.clientY;
		if (extraModels.has(modelName)) {
			console.log('modelName', modelName);
			x = x + 60;
			tooltip.showTooltip({ x, y }, 'click to remove', 1000, 'above', {
				color: 'crimson',
				backgroundColor: '#fff0f0',
				border: '1px solid crimson',
			});
		} else {
			Object.assign((tooltipBlockEl as HTMLDivElement).style, {
				position: 'fixed',
				top: `${y}px`,
				left: `${x}px`,
				zIndex: '9999',
				pointerEvents: 'auto',
				opacity: '1',
				cursor: 'pointer',
			});
		}
	}

	function toggleListeners(addOrRemove: boolean) {
		if (!lastHoveredDetails) {
			return;
		}
		// lastHoveredDetails is set before calling this function
		const sections = (lastHoveredDetails as HTMLDetailsElement).querySelectorAll<HTMLElement>('section');

		// Pick the method name based on the boolean flag
		// const method: 'addEventListener' | 'removeEventListener' = addOrRemove ? 'addEventListener' : 'removeEventListener';

		sections.forEach((section) => {
			if (addOrRemove) {
				section.addEventListener('mouseenter', showCopyFieldTooltip);
			}
			// else {
			// 	section.removeEventListener('mouseleave', showCopyFieldTooltip);
			// }
			// section[method]('mouseenter', showCopyFieldTooltip as EventListener);
			// }
		});
	}

	// if details isOpen and extraModels defined add listeners for mouseenter/mouseleave
	// for copy field tooltip to appear over field names in details model block
	async function handleContainerMouseOver(e: MouseEvent) {
		e.preventDefault();
		if (!extraModelsSize || !fieldsRect) {
			console.log('handleContainerMouseOver no extraModls or no fieldsRect');
			return;
		}
		// mouse is hovering over the frid, but if out of the first column
		// hide the copy field tooltip
		if (fieldsRect && !isInside(e)) {
			// (tooltipBlockEl as HTMLDivElement).style.opacity = '0';
			return;
		}

		const target = e.target as HTMLElement;
		if (!target) {
			return;
		}
		await tick();
		hoveredEl = target;
		// Find the closest details ancestor from the hover target
		const details = target.closest('details');

		// Check if we are over an open details block and haven't already processed it
		if (details) {
			if (details.open && details !== lastHoveredDetails) {
				lastHoveredDetails = details;
				toggleListeners(true);
			}
		} else {
			// toggleListeners(false);
			lastHoveredDetails = null; // Reset when hovering outside any details>
		}
	}

	async function closeOtherDetails(det: HTMLDetailsElement) {
		const openDetails = details.filter((det) => det.open);
		openDetails.forEach(async (openDet) => {
			if (openDet.open && openDet !== det) {
				openDet.open = false;
				await tick();
			}
		});
	}
	function getGridFieldsRect(): DOMRect | null {
		const el = document.getElementById(modelName) as HTMLDivElement;
		const cells = Array.from(el?.querySelectorAll(':scope > *:nth-child(1)')) as HTMLElement[];

		if (cells.length === 0) return null;

		const first = cells[0]?.getBoundingClientRect() as DOMRect;
		const last = cells[cells.length - 1]?.getBoundingClientRect() as DOMRect;
		return new DOMRect(first.top, first.right, last.bottom, first.left);
	}
	// this should set mouseenter/mouseleave on the first column
	// of the ORM Models fieldNames
	async function toggleDetails(e: ToggleEvent) {
		// e.preventDefault();	// will not toggle open/close if prevented
		console.log(e.type);
		const det = e.target as HTMLDetailsElement;
		await tick();

		const el = det.firstElementChild as HTMLElement;
		console.log('toggleDetails summary', el.innerText);
		await tick(); // give DOM time to toggle open/close state
		let fldName = '';
		switch (el.tagName) {
			case 'SUMMARY':
				if (det.open) {
					toggleListeners(true);
					await closeOtherDetails(det);
				}
				// else {
				// 	toggleListeners(false);
				// }
				modelName = det.innerText?.match(/^\S+/)?.[0] as string;
				fieldsRect = getGridFieldsRect() as DOMRect;
				if (tooltipBlockEl) {
					(tooltipBlockEl as HTMLDivElement).style.opacity = '0';
				}
				await tick();

				// if (extraModels.has(modelName)) {
				// 	// <div holding all <sections with fieldNames with data-entry and data-extra boolean flags
				// 	fieldsRect = getGridFieldsRect() as DOMRect;
				// }

				// hovering is necessary only when newModels are defined
				if (!extraModelsSize) {
					return;
				}
				await handleContainerMouseOver(e);
				return;
			case 'INPUT':
				if ((el as HTMLInputElement).type && (el as HTMLInputElement).type === 'checkbox') {
					exportModels();
				}
				break;
			case 'SECTION':
				fldName = el.innerText;
				models[modelName]!.fields = models[modelName]?.fields.filter((field) => field.name !== fldName) as Field[];
				break;
			case 'SPAN':
			case 'P':
			default:
				console.log('[OrmThree] toggleDetails defauls case', el.tagName);
		}
	}

	function showInputMessage(msg: string, milisec: number = 2000) {
		message = msg;
		setTimeout(() => {
			message = defaultMessage;
		}, milisec);
	}

	async function addNewModel(e: MouseEvent | KeyboardEvent | undefined) {
		if (e) {
			e?.preventDefault();
			if (e instanceof KeyboardEvent && e.key !== 'Enter') {
				return;
			}
			(tooltipBlockEl as HTMLDivElement).style.opacity = '0';
		}

		if (models[newModelNameCap]) {
			showInputMessage(alreadyDefined);
			return;
		}
		await tick();

		extraModels.add(newModelNameCap);
		// add another newModelNameCap initially with no fields and attrs
		// so the models list can expand
		models = {
			...models,
			[newModelNameCap]: emptyModel,
		};

		newModelName = '';
		if (anySelected()) {
			exportModels();
		}
	}

	async function deleteModel(e: MouseEvent, modelName: string) {
		tooltip.showTooltip(e, `Model "${modelName}" to be removed.`, 2000, 'right', {
			color: 'crimson',
			backgroundColor: '#fff0f0',
			border: '1px solid crimson',
		});
		// NOTE this is reguler svelte app aw will add showConfirmation in VSCode webview extension
		// const confirmed = await showConfirmation({
		const confirmed = true;
		if (confirmed) {
			delete models[modelName];
			if (models[modelName]) {
				tooltip.showTooltip(e, `Model "${modelName}" has been removed.`, 2000, 'left', {
					color: 'crimson',
					backgroundColor: '#fff0f0',
					border: '1px solid crimson',
				});
			} else {
				tooltip.showTooltip(e, `Model "${modelName}" is removed.`, 2000, 'above', {
					color: 'crimson',
					backgroundColor: '#fff0f0',
					border: '1px solid crimson',
				});
			}
			setTimeout(() => {
				exportModels();
			}, 400);
		}
	}
	async function removeModel(e: MouseEvent) {
		if (!newModelName) {
			showInputMessage(noModelName);
			return;
		}

		if (!models[newModelNameCap]) {
			showInputMessage(notRegistered);
			return;
		}
		if (models[newModelNameCap]) {
			await deleteModel(e, newModelNameCap);
			// Optional: notify user inside webview
			tooltip.showTooltip(e, `Model "${newModelNameCap}" has been removed.`, 2000, 'left', {
				color: 'crimson',
				backgroundColor: '#fff0f0',
				border: '1px solid crimson',
			});
		}
		setTimeout(() => {
			exportModels();
		}, 400);
	}

	function removeExtraModelField(e: MouseEvent) {
		e.preventDefault();
		const el = e.target as HTMLElement;
		console.log('removeExtraModelField dataset.extra', el.dataset.extra);
		if (el.dataset.extra === 'false') {
			console.log('removeExtraModelField exit -- not an extraModel');
			return;
		}
		const fieldName = el.innerText;
		console.log('[OrmThree] removeExtraModelField', modelName, fieldName);
		const model = models[modelName];
		if (!model || !model.fields) {
			console.log('no model or no model.fields', modelName, model);
			return;
		}
		model.fields = model.fields.filter((field) => field.name !== fieldName);
		notDataEntryEl.style.opacity = '0';
		if (anySelected()) {
			exportModels();
		}
	}

	// TODO remove this adds extraModels for testing only
	async function addExtraModels() {
		const modelNames = ['login', 'admin', 'customer'];
		for (const model of modelNames) {
			newModelName = model;
			await tick();
			addNewModel(undefined);
			await tick();
		}
	}
	onMount(() => {
		setTimeout(() => {
			addExtraModels();
		}, 500);
	});
	async function handleRadioSelect(e: Event, selectedModel: string) {
		if (!selectedModel || !hoveredEl) return;

		const target = e.target as HTMLInputElement;
		rbGroup = selectedModel;

		if (tooltipBlockEl) {
			tooltipBlockEl.style.opacity = '0';
		}
		if (previousEl) {
			previousEl.style.color = '';
		}
		try {
			const fieldName = hoveredEl.innerText.trim();
			const field = getUIField(fieldName);

			if (field) {
				const targetModels = rbGroup === includeAll ? Array.from(extraModels) : [rbGroup];

				for (const m of targetModels) {
					if (models[m]) {
						const exists = models[m].fields.some((f) => f.name === field.name);
						if (!exists) {
							models[m].fields = [...models[m].fields, { ...field }];
							await tick();
						}
					}
				}
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.error('addFieldToModel error:', msg);
		} finally {
			rbGroup = '';
			if (target) {
				target.checked = false; // <-- Unchecks the radio element directly in the DOM
			}
			if (anySelected()) exportModels();
		}
	}
</script>

{#snippet tooltipBlock()}
	<div>
		{#each extraModels as model (model)}
			<label>
				<input type="radio" name="extraModelRadio" value={model} onchange={(e) => handleRadioSelect(e, model)} />
				{model}
			</label>
		{/each}
		{#if extraModelsSize >= 2}
			<label>
				<input
					type="radio"
					name="extraModelRadio"
					value={includeAll}
					onchange={(e) => handleRadioSelect(e, includeAll)}
				/>
				{extraModelsSize === 2 ? 'Both' : includeAll}
			</label>
		{/if}
	</div>
{/snippet}

<div bind:this={tooltipBlockEl} class="radio-tooltip">
	{@render tooltipBlock()}
</div>
<div bind:this={notDataEntryEl} class="no-data-entry">
	{tooltipMessage}
</div>

{#snippet permissions(modelName: string)}
	<CRUserRolesSelect {userRoles} {models} {modelName} {exportModels} />
{/snippet}

{#snippet summaryDetailsModel(modelName: string, ix: number)}
	<!-- Dynamically derive current model state inside snippet -->
	{@const modely = models[modelName] as Model}
	<div style="position:relative;">
		<input
			type="text"
			id="route{modelName}"
			value={modelName.toLowerCase()}
			onchange={exportModels}
			style="position:absolute;top:0;left:4px;color:var(--candidate-color);background-color:var(--candidate-bg-color);width:5rem;height:1rem;padding:0 0 0 5px;margin:4px 0 0 0;border:none;font-size:14px;"
		/>
		<input
			type="checkbox"
			style="position:absolute;top:0;left:6rem;"
			value={modelName}
			bind:group={cbGroup}
			class="model-checkboxes"
			onclick={exportModels}
		/>
		<details bind:this={details[ix]} ontoggle={toggleDetails} class="model-details">
			<summary class="cr-model-name">
				{capitalize(modelName)}
				{@render permissions(modelName)}
			</summary>

			<div id={modelName} class="cr-fields-column" onclick={removeExtraModelField} aria-hidden={true}>
				{#each modely.fields as field (field.name)}
					{@const attrClass = fieldAttrsClass(field)}
					<!-- Declarative hover handling removes manual eventListener binding -->
					<section
						data-entry={field.isDataEntry}
						data-extra={extraModels.has(modelName)}
						onmouseenter={(e) => showCopyFieldTooltip(e)}
						aria-hidden={true}
					>
						{field.name}
					</section>
					<p>
						type:{field.type} <span class={attrClass}>{fieldAttrs(field)}</span>
					</p>
				{/each}
			</div>
			<div>
				{#each modely.attrs as attr (attr)}
					<p class="cr-model-attr">{attr}</p>
				{/each}
			</div>
		</details>
	</div>
{/snippet}

{#snippet summaryDetailsModels()}
	<div
		class="model-wrapper"
		onmouseover={handleContainerMouseOver}
		onmouseout={handleContainerMouseOver}
		onfocus={() => {}}
		onblur={() => {}}
		role="presentation"
	>
		{#each Object.entries(models) as [modelName], ix (modelName)}
			{@render summaryDetailsModel(modelName, ix)}
		{/each}
	</div>
{/snippet}

<div class="container">
	<div class="schema-container">
		<p class="orm-models-caption">ORM Models -- Table Names</p>
		<p class="select-all" onclick={toggleSelectAllModels} aria-hidden={true}>(select all)</p>
		<div bind:this={modelWrapperEl} class="model-wrapper">
			{#if isLoading}
				<div class="spinner-wrapper">
					<span class="spinner"></span><span>Loading models...</span>
				</div>
			{/if}
			{#if !isLoading && Object.keys(models).length > 0}
				{@render summaryDetailsModels()}
			{/if}
		</div>
	</div>
	<div class="add-extra-model">
		<span class="main-class" style={messageColor}>{message}</span>
		<input type="text" bind:value={newModelName} onkeyup={addNewModel} placeholder="Add extra model" />
		<button onclick={addNewModel} disabled={!newModelName}>add</button><button
			onclick={removeModel}
			disabled={!newModelName}>remove</button
		>
	</div>
</div>

<!-- not for display just a reference to tooltip.showTooltip utils with markup -->
<Tooltip bind:this={tooltip} />
<p>rbGroup {rbGroup}</p>

<style lang="scss">
	*,
	*::before {
		box-sizing: border-box;
		user-select: none;
	}

	input[type='text'] {
		width: 93%;
		height: 20px;
		padding: 6px 0 8px 1rem;
		outline: none;
		font-size: 16px;
		border: 1px solid gray;
		border-radius: 4px;
		outline: 1rem solid transparent;
		margin-top: 8px;
		margin-bottom: 10px;
		&::placeholder {
			font-size: 13px;
		}
		&:focus {
			outline: 1px solid gray;
		}
	}
	.container {
		width: 23rem;
		margin-top: 1rem;
		height: 39.7rem;
		.schema-container {
			position: relative;
			width: 22.8rem;
			height: 35.9rem;
			border: 1px solid gray;
			border-radius: 6px;
			padding: 1rem 0 0 3px;
			.model-wrapper {
				width: 22rem;
				padding: 0;
				margin: 0;
				height: 34.4rem;
				z-index: 15;
				overflow-y: auto;
				scrollbar-width: none;
				overflow-x: hidden;
			}
		}
	}
	.spinner-wrapper {
		display: grid;
		grid-template-columns: 1em 10rem;
		column-gap: 0.5rem;
	}
	.spinner {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 0.8em;
		height: 0.8em;
		border: 3px solid #a1c1eb;
		border-top-color: #1b4891;
		border-radius: 50%;
		margin: 4px 0 0 0.5rem;
		animation: spin 900ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.add-extra-model {
		width: 100%;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		margin: 6px 0 0 0;
		opacity: 1;
		input {
			width: 65.5% !important;
			font-size: 14px;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
		}
		button {
			width: 3.5rem;
			padding: 0;
			margin-right: 4px;
			&:last-of-type {
				margin-right: 0;
			}
		}
	}
	.tomato {
		color: tomato;
	}
	.navy {
		color: navy;
	}

	.model-details {
		width: 21.5rem;
	}

	.orm-models-caption,
	.select-all {
		position: absolute;
		top: -1.6rem;
		left: 1rem;
		z-index: 10;
		padding: 0 5px;
		color: var(--candidate-color);
		background-color: var(--panel-bg-color);
	}
	.select-all {
		left: 16rem;
		width: 5rem;
		cursor: pointer;
		&:hover {
			border: 1px solid var(--candidate-color);
			border-radius: 4px;
		}
	}

	.cr-model-attr {
		grid-column: span 2;
		width: 18rem;
		padding: 0;
		margin: 0 0 0 2rem;
		text-wrap: wrap;
		color: tomato;
		font-size: 13px;
	}
	.cr-model-name {
		color: var(--summary-color);
		background-color: var(--summary-bg-color);
		margin: 3px 9px 0 0;
		width: 21.5rem;
		border-radius: 6px;
		padding-left: 8rem;
		height: 1.6rem;
		cursor: pointer;
	}

	.cr-fields-column {
		display: grid;
		grid-template-columns: 7rem 9.5rem;
		column-gap: 5px;
		width: 21.5rem;
		padding: 6px 0 6px 1rem;
		max-height: 75vh;
		font-size: 14px;
		font-weight: 400;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		cursor: pointer;
		// border: 1px solid tomato;
	}

	.cr-fields-column p {
		margin: 4px 0 0 0;
		padding: 1px 0 1px 6px;
		text-wrap: wrap;
	}

	.cr-fields-column p:nth-child(odd) {
		cursor: pointer;
		width: max-content;
		padding: 4px 1rem;
	}

	.cr-fields-column p:nth-child(even) {
		font-weight: 400 !important;
		font-size: 12px !important; /* prisma attrs column */
		color: var(--model-name);
		span {
			display: block;
			margin-left: 1rem;
			color: var(--pink-tomato);
		}
	}

	.pink-tomato {
		color: var(--pink-tomato);
	}
	.attr-id {
		color: var(--attr-id);
	}

	.model-checkboxes {
		color: navy;
		padding: 0 1rem 0 0;
		margin-left: 0;
		cursor: default !important;
	}
	details {
		width: 22rem;
	}
	details:last-of-type[open]::details-content {
		width: 21.5rem;
		background-color: #f0f0f0;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}
	details:last-of-type[open] summary {
		background-color: var(--summary-bg-color);
	}
	.radio-tooltip {
		opacity: 0;
		position: fixed;
		top: 30rem;
		left: 30rem;
		z-index: 10;
		display: flex;
		column-gap: 2px;
		pointer-events: auto;
		border-radius: 6px;
		padding: 4px 0.5rem 1px 5px;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		label,
		input {
			cursor: pointer !important;
		}
	}
	.no-data-entry {
		position: fixed;
		top: 30rem;
		left: 30rem;
		opacity: 0;
		color: var(--pink-tomato);
		background-color: var(--candidate-bg-color);
		width: max-content;
		padding: 2px 0.5rem;
		border: 1px solid gray;
		border-radius: 5px;
		z-index: 10;
	}
	.main-class {
		color: var(--pre-color);
	}
	.hidden {
		display: none;
	}
	.test-colors {
		color: green;
		background-color: rgb(179, 225, 179);
		border: 1px solid rgb(34, 176, 34);
	}
</style>
