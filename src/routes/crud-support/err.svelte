<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity'; // get(key), set(key,value), delete(key), clear ()
	import { createEventHandler, isEmpty } from '$lib/utils';
	// import { type Field, type Models } from './parse-prisma-schema';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	function data_() {
		return data;
	}
	let models: Models = $state<Models>(data_().models) as Models;
	let modelName = $state<string>('');

	// Make a reactive local copy that you can safely bind to
	let uiFields = new SvelteMap<string, Field>();
	let candidates = new SvelteMap<string, Field>();

	// debugger;

	const eh = createEventHandler();
	// event handler wrappers for candidate fields list and <details> ORM model list
	let candidatesListEl = $state<HTMLDivElement>();
	let schemaContainerEl: HTMLDivElement;

	// associated <p>tooltip</p> event handler mouseover/out paragraphs
	// defined after @render and moved via event handler mouseover handler
	let candidateTooltipEl: HTMLParagraphElement;
	let ormModelTooltipEl: HTMLParagraphElement;

	// input for defning route folder for Svelte
	let routeNameEl: HTMLInputElement;

	// let timer: ReturnType<typeof setTimeout>;	// NOTE keep it as an example

	const contTitleDefault = 'click, add to candidates';
	const contSelected = 'already selected';

	function getUIField(el: HTMLElement) {
		const match = (el as HTMLElement).innerText.match(/(\w+)/);
		if (match && match[1]) {
			return uiFields.get(match[1]) as Field;
		}
		return null;
	}
	function prismaContainerTooltip(s: string) {
		ormModelTooltipEl.innerText = s;
		ormModelTooltipEl.style.color = s === contTitleDefault ? 'navy' : s === contSelected ? 'darkgreen' : 'tomato';
	}

	function onPrismaClick(e: MouseEvent) {
		const el = e.target as HTMLElement;
		const field = getUIField(el);
		if (field && !candidates.has(field.name)) {
			candidates.set(field.name, field);
		}
		ormModelTooltipEl!.style.opacity = '0';
		setButtonAvailability();
	}

	let schemaContainerRect: DOMRect | null = null;
	function onPrismaMouseOver(e: MouseEvent) {
		const et = e.target as HTMLParagraphElement;
		if (et.innerText.slice(0, 5) === 'type:') {
			return;
		}
		const field = getUIField(et);
		if (field) {
			if (candidates.has(field.name)) {
				prismaContainerTooltip(contSelected);
			} else if (field.isDataEntry) {
				prismaContainerTooltip(contTitleDefault);
			}
		} else {
			prismaContainerTooltip('Not a data-entry field');
		}
		if (!schemaContainerRect) {
			schemaContainerRect = (
				document.getElementById('schemaContainerId') as HTMLParagraphElement
			).getBoundingClientRect();
		}
		ormModelTooltipEl.style.top = String(et.offsetTop - et.offsetHeight) + 'px';
		ormModelTooltipEl.style.left = String(et.offsetLeft + 12) + 'px';
		ormModelTooltipEl.style.opacity = '1';
	}

	function onPrismaMouseOut(e: MouseEvent) {
		ormModelTooltipEl.style.opacity = '0';
	}

	let candidatesRect: DOMRect | null = null;
	function onMouseOver(e: MouseEvent) {
		if (!candidatesRect) {
			candidatesRect = (document.getElementById('middleColumnId') as HTMLParagraphElement).getBoundingClientRect();
		}
		const et = e.target as HTMLParagraphElement;
		candidateTooltipEl.style.top = String(et.offsetTop - et.offsetHeight) + 'px';
		candidateTooltipEl.style.left = String(et.offsetLeft + 12) + 'px';
		candidateTooltipEl.style.opacity = '1';
	}

	function onMouseOut(_: MouseEvent) {
		candidateTooltipEl.style.opacity = '0';
	}

	// drag-drop works silently but if we want to handle some
	// events like onDrop we set on a wrapper w.ondrop = onDrop
	// function onDrop(_: MouseEvent) {	// NOTE keep it as an example
	// 	console.log('onDrop');
	// }

	function setButtonAvailability() {
		return !isEmpty(candidates);
	}

	// candidate fields handlers
	function onClick(e: MouseEvent) {
		const el = e.target as HTMLElement;
		const match = (el as HTMLElement).innerText.match(/(\w+)/);
		if (match) {
			candidates.delete(match[1]);
		}
		candidateTooltipEl.style.opacity = '0';
		el.remove();
		setButtonAvailability();
	}

	function setCandidateHandlers() {
		eh.destroy();
		if (!candidatesListEl) {
			return;
		}
		// NOTE drag drop will work without this setting, but if we want
		// to handle this event we should set the handler, like onDrop here
		// candidatesListEl.ondrop = onDrop;	// NOTE keep it as an example
		// bind candidates fields to event-handler
		eh.setup(candidatesListEl, {
			click: onClick,
			mouseover: onMouseOver,
			// mouseout: onMouseOut,
		});
		// bind prisma model fields to event-handler for every <summary>
		// separately based on fake class name X-<modelName>
		const className = `.X-${modelName}`;
		const prismaList = document.querySelector(className) as HTMLDivElement;
		eh.setup(prismaList, { click: onPrismaClick, mouseover: onPrismaMouseOver, mouseout: onPrismaMouseOut });

		// drag-drop to move fieldNames up and down the candidates list
		eh.setup(candidatesListEl);
		buttonNotAllowed = false;
	}

	onMount(() => {
		schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		candidatesListEl = document.getElementById('candidatesListId') as HTMLDivElement;
		ormModelTooltipEl = document.getElementById('ormModelTooltipId') as HTMLParagraphElement;
		candidateTooltipEl = document.getElementById('candidateTooltipId') as HTMLParagraphElement;

		routeNameEl = document.getElementById('routeNameId') as HTMLInputElement;

		// listener for <summary/details> blocks
		schemaContainerEl!.addEventListener('click', async (event: MouseEvent) => {
			if ((event.target as HTMLElement).tagName === 'SUMMARY') {
				modelName = (event.target as HTMLElement).innerText;
				const details = (event.target as HTMLElement).closest('details');
				if (details && details.open) {
					setTimeout(() => {
						// has to use setTimeout as the element is still in opening
						details.removeAttribute('open');
					}, 200);
					closeSchemaModels();
					eh.destroy();
					return;
				}
				closeSchemaModels();

				routeNameEl.value = modelName.toLowerCase();
				candidates.clear();
				// make current uiFields and put them in candidate fields list
				models[modelName].fields.forEach((fld) => {
					if (fld.isDataEntry) {
						uiFields.set(fld.name, fld);
						candidates.set(fld.name, fld);
					}
				});
				// now we have prisma models revealed in details and candidate fields list
				// so call event-handler setup to handle tooltips and clicks on the lists
				setCandidateHandlers();
			}
		});

		return () => {
			eh.destroy();
		};
	});

	function closeDetails(dets: HTMLCollection) {
		for (const child of Object.entries(dets)) {
			const el = child[1].children[0] as HTMLElement;
			if (el) {
				el.removeAttribute('open');
			}
		}
	}
	function closeSchemaModels() {
		routeNameEl.value = '';
		// const children = schemaContainerEl?.children as HTMLCollection;
		closeDetails(document.getElementsByClassName('.cr-model-block'));
		candidates.clear();
		buttonNotAllowed = true;
	}
	let buttonNotAllowed = $state<boolean>(true);

	const nuiRegex = new RegExp(`\\b@id|@defaults|@updatedAt|@unique\\b`, 'g');
	function fieldAttrsTag(field: Field) {
		return nuiRegex.test(field.attrs as string) ? 'attr-id' : '';
	}
</script>

<svelte:head>
	<title>CRUD Support</title>
</svelte:head>
{#snippet candidateFields()}
	{#each candidates as [name, field] (name)}
		{#if field.isDataEntry}
			<div class="cr-list-el" data-event-list="click mouseover mouseout" draggable="true">
				<div style="pointer-events: none;">
					{name}: {field.type}{field.isOptional ? '?' : ''}
				</div>
			</div>
		{/if}
	{/each}
{/snippet}
{#snippet summaryPrismaModel()}
	{#each Object.entries(models) as [modelName, model] (modelName)}
		<div class="cr-model-block">
			<details>
				<summary class="cr-model-name">{modelName}</summary>
				<div class="X-{modelName} cr-fields-column" data-event-list="click mouseover mouseout">
					{#each model.fields as field (field.name)}
						{@const attrClass = fieldAttrsTag(field) as string}
						<p>{field.name}</p>
						<p>type:{field.type} <span class={attrClass}>{field.attrs ?? 'na'}</span></p>
					{/each}
				</div>
				<div>
					{#each model.attrs as attr (attr)}
						<p class="cr-model-attr">{attr}</p>
					{/each}
				</div>
			</details>
		</div>
	{/each}
	<p id="ormModelTooltipId" class="cr-prisma-remove-hint">click, add to candidates</p>
{/snippet}
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

			<div class="cr-crud-support-done cr-hidden"></div>
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
			<div id="createBtnId" style="font-size: 14px !important;cursor:pointer;" class:notallowed={buttonNotAllowed}>
				Create CRUD Support
			</div>
		</div>

		<div id="middleColumnId" class="cr-middle-column">
			<div id="candidatesListId" class="cr-fields-list" onmouseout={onMouseOut} onblur={undefined} aria-hidden={true}>
				{@render candidateFields()}
			</div>
			<p id="candidateTooltipId" class="cr-remove-hint">click to remove</p>
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
	</div>

	<div id="rightColumnId" class="cr-right-column">
		<div id="schemaContainerId">
			{#if models}
				{@render summaryPrismaModel()}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.cr-main-grid {
		display: grid;
		padding: 0.6rem 0 0 0.6rem;
		grid-template-columns: 40rem 20rem;
		margin-top: 0.5rem;
		width: 100vw;
	}

	.cr-grid-wrapper {
		display: grid;
		grid-template-columns: 27rem 12rem;
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
		width: 27.2rem;
		padding: 1rem 0 0 0.7rem;
		background-color: var(--panel-bg-color);
		label {
			display: block;
			color: var(--candidate-color);
		}
		button,
		div {
			display: block;
		}
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
		/* overflow-y: auto;	 */ /* cuts container's header */
	}

	:global(.cr-fields-list) {
		display: grid;
		grid-template-rows: 1.4rem;
		grid-auto-rows: 1.4rem;
		cursor: pointer;
		text-align: center;
		padding: 0;
		margin: 0 0 2rem 0;
		color: navy;
	}
	:global(.cr-list-el) {
		background-color: var(--candidate-bg-color);
		color: var(--candidate-color);
		border: 1px solid var(--border-color);
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
	// }
	.cr-remove-hint,
	.cr-prisma-remove-hint {
		position: absolute;
		left: 1.5rem !important;
		z-index: 10;
		font-size: 12px;
		color: red;
		width: max-content;
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
	cr-prisma-remove-hint {
		top: 3rem;
		left: 20rem;
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
		height: auto;
		overflow-y: auto;
	}

	.cr-right-column {
		position: relative;
		@include container($head: 'Select UI Fields from ORM', $head-color: navy);
		/*color: var(--field-type-color);*/
		background-color: var(--panel-bg-color);
		height: auto;
		.red-type {
			color: var(--red-type) !important;
		}
	}
	.embellishments {
		@include container($head: 'Include Components', $head-color: navy);
		background-color: var(--panel-bg-color);

		position: relative;
		grid-column: span 2;
		display: grid;
		grid-template-columns: 1rem 15rem;

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
		display: inline-block;
		color: var(--candidate-color);
	}

	.checkbox-item input[type='checkbox'] {
		display: inline-block;
		grid-column: 1;
		justify-self: start;
		align-self: center;
		margin: 0 0.6rem 0 0;
	}

	.checkbox-item label {
		display: inline-block;
		grid-column: 2;
		justify-self: start;
		align-self: center;
		cursor: pointer;
		line-height: 1;
		width: 23.6rem !important;
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
		height: 100%;
		overflow-y: auto;
	}
	:global(.cr-model-name) {
		color: var(--summary-color);
		background-color: var(--summary-bg-color);
		margin-top: 3px;
		width: 18rem;
		border-radius: 6px;
		padding-left: 1rem;
		height: auto;
		cursor: pointer;
	}

	:global(.cr-fields-column) {
		display: grid;
		grid-template-columns: 7rem 9.5rem;
		column-gap: 5px;
		width: max-content;
		padding: 6px 0 6px 1rem;
		height: auto;
		/*font-family: Georgia, 'Times New Roman', Times, serif;*/
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
		color: var(--model-name);
		cursor: pointer;
		width: max-content;
		padding: 4px 1rem;
	}

	:global(.cr-fields-column p:nth-child(even)) {
		font-weight: 400 !important;
		font-size: 12px !important; /* prisma attrs column */
		color: var(--model-name);
		span {
			display: block;
			margin-left: 1rem;
			color: var(--pink-tomato);
		}
	}
	#createBtnId {
		outline: none;
		border: 1px solid gray;
		border-radius: 5px;
		font-weight: 400;
		padding: 4px 1rem;
		color: var(--candidate-color);
		margin: 8rem 6.5rem;
		width: max-content;
		cursor: pointer;
	}
	.notallowed {
		opacity: 0.3;
		cursor: not-allowed;
	}
	:global(.field-name) {
		color: var(--field-name) !important;
	}
	:global(.green-type) {
		color: var(--green-type) !important;
	}
	:global(.red-type) {
		color: var(--red-type) !important;
	}
	:global(.pink-tomato) {
		color: var(--pink=-tomato);
	}
	:global(.attr-id) {
		color: var(--attr-id);
	}
</style>
