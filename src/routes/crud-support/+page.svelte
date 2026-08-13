<script lang="ts">
	import CRRBTooltip from '$lib/components/CRRBTooltip.svelte';
	import type { PageProps } from './$types';
	import FakeExtension from '$lib/components/FakeExtension.svelte';
	import ShowMessage from '$lib/components/CRShowTooltip.svelte';
	import { handleTryCatch } from '$lib/utils';
	let sm: ShowMessage;
	// type Payload = Record<string, SelectedModels | Model | string[] | string>; // { route: string | null } = { route: null };
	let { data }: PageProps = $props();
	let isActive = $state(false);
	let models = data.models; // avoid $derived as we use this one-time only
	// console.log('data.enums', data.enums); // type TEnums = Record<string, Record<string, string>>;
	let isLoading = $state(true);
	// let userRoles = ['USER', 'ADMIN', 'VISITOR', 'MODERTOR'];
	let userRoles = Object.keys(Object.values(data.enums)[0] as TEnum).filter(Boolean);
	// console.log('+page props', userRoles);
	setTimeout(() => {
		isLoading = false;
	}, 1000);
	let inAction = $state(false);
	// console.log(models);
	let fakeExtension: FakeExtension; //{ generate: (payload: Payload) => void };
	// fakeExtension = {generate: (payload: Payload) => void }
	// when any checkbox on a component model list is selected
	// the component keeps this selectedModels in sync
	let selectedModels = $state<SelectedModels>({});

	// what components users want to include in newnly generated pages
	let crComponents: string[] = $state(['CRInput', 'CRSpinner', 'CRActivity', 'CRTooltip', 'CRSummaryDetails']);

	// what authentication/authorization to implement should be optional?
	let appFeatures: string[] = $state([]);

	// onclick Create CRUD Support sends models to extension to
	// create individual pages or part of the application
	function getPayload() {
		try {
			if (Object.keys(selectedModels).length === 0) {
				return selectedModels;
			}

			let payload: Payload = {};
			if (crComponents.length) {
				payload['crComponents'] = $state.snapshot(crComponents);
			}
			for (const key of ['authorization', 'authentication']) {
				const el = document.querySelector(`input[name=${key}]:checked`) as HTMLInputElement;
				if (el) {
					payload[key] = el.value;
				}
			}
			if (appFeatures.length) {
				payload['features'] = $state.snapshot(appFeatures);
			}

			// payload['selectedModels'] = $state.snapshot(selectedModels);
			payload['selectedModels'] = selectedModels;
			return payload;
		} catch (err: unknown) {
			handleTryCatch(err, 'getPayload');
		}
	}
	// imitate getting model from Webview extension
	// fake part for Extension
	const vscode =
		// @ts-expect-error  not an extension content
		typeof acquireVsCodeApi !== 'undefined'
			? // @ts-expect-error not an extension content
				acquireVsCodeApi()
			: {
					postMessage: (msg: { command: string; payload: Payload }) => {
						//console.log(`[DEV] to generate ${msg.command} in progress...`);
						// const payload = msg.payload;
						//console.log('msg.payload', payload);
						//console.log('authentication', payload.authentication);
						//console.log('authorization', payload.authorization);
						//console.log('selectedModules', payload.selectedModules);
						setTimeout(() => {
							// console.log(`${msg.command} is done`, msg.payload ?? 'with no payload');
							fakeExtension?.generate(msg.payload);
						}, 2000);
					},
				};
	// Webview sends message to the extension
	function createCRUDSupport(e: MouseEvent) {
		try {
			inAction = true;
			const el = e.target as HTMLDivElement;
			el.style.cursor = 'none';
			vscode.postMessage({
				command: 'CreateCrudSupport',
				payload: getPayload(),
			});
			setTimeout(() => {
				inAction = false;
				el.style.cursor = 'pointer';
			}, 2000);
		} catch (err: unknown) {
			handleTryCatch(err, 'createCRUDSupport');
		}
	}

	let buttonNotAllowed = $derived(Object.keys(selectedModels).length === 0);
	function toggleActive() {
		isActive = isActive ? false : true;
	}
</script>

<svelte:head>
	<title>CRUD Support</title>
</svelte:head>
<p onclick={toggleActive} aria-hidden={true} style="cursor:pointer">toggle isActive {isActive}</p>
<!-- used as an external function  -->
<FakeExtension bind:this={fakeExtension} />
{#snippet pagePurpose()}
	<div class="page-info">
		<pre>
  The main part of this page is on the right.
	
  1) ORM Models -- table names,
    a list of models/table-names from /prisma/schema.prisma parsed file.
    Every model is presented in a row that can be expanded to show list
      of fields/table-columns -- where some could be UI data-entry fields
      and the others like userAuthToken, passwordHash, createdAt... are
      not to be displayed to the users.
      Rows contain:
    - input box for naming routes, e.g. for model
      Object.keys(models)[0] route would be a folder under
      /appName/routes/Object.keys(models)[0] if model is selected
    - a checkbox to signal that model is selected for generating a route
    - Model name
    - Permissions -- when clicked opens a dropdown with UserKind from
      enums found in schema.prisma, or if enums are not found the extension
      uses the default enums: USER ADMIN MODERATOR VISITOR.
  2) Extra Models
    Some pages could be based on partial models that include only several
    fields/columns like Login that includes only say email and password.
    Extra model are added entering extra model name in the input box with
    placeholder 'Add extra model' and selecting the 'add' button.
    Model can be removed from the list by entering its name and selecting
    remove and answering the Confirmation Box to allow the action.
  3) Adding Fields to Extra Model(s)
    When extra model(s) are defined then opening any ORM Model will show
    tooltip like a radio-button group with Model Name beside when some
    data-entry field is hovered allowing users to select the model and the
    hovered field will be copied into selected extra model.
    When more than on extra model is defined tooltip radio-button group
    includes label 'Both' or 'All' if more then two extra models exist.
  4)Create CRUD Support button is enabled when some or all models are
    selected, and when clicked it sends selected page attributes for
    page-by-page decoration selecting some additional attributes and/or
    specific behavior offered by the extension, like what Components to
    include in the given page.
    </pre>
	</div>
{/snippet}
{#snippet appIncludes()}
	<label for="Navbar" class="app-labels">
		<input type="checkbox" id="Navbar" value="NavBar" bind:group={appFeatures} />
		Include navbar in app root +layout.svelte</label
	>
	<label for="ThemeIcon" class="app-labels">
		<input type="checkbox" id="ThemeIcon" value="ThemeIcon" bind:group={appFeatures} />
		Include dark/light/system theme icon</label
	>

	<div class="radio-check-groups">
		<div class="authentication">
			{#each ['pasword-based', 'multi-factor MFA', 'certificate-based', 'token-based JWT', 'Exlude'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="authentication" value={auth} checked={auth === 'token-based JWT'} />
					{auth}
				</label>
			{/each}
		</div>
		<div class="authorization">
			{#each ['JSON Web Tokens JWT', 'API Keys', 'Bearer Tokens', 'Digest Authentication', 'Mutual TLS', 'Exclude'] as auth (auth.slice(0, 4))}
				<label>
					<input type="radio" name="authorization" value={auth} checked={auth === 'Bearer Tokens'} />
					{auth}
				</label>
			{/each}
		</div>
	</div>
{/snippet}
{#snippet pageByPageMiddleColumn()}
	<div class="cr-left-column">
		{@render appIncludes()}
		<div class="embellishments">
			{#each ['CRInput', 'CRSpinner', 'CRActivity', 'CRTooltip', 'CRSummaryDetails'] as comp (comp)}
				<div class="checkbox-item">
					<label for={comp}
						><input id="CRInput" type="checkbox" value={comp} bind:group={crComponents} />
						{comp} component</label
					>
				</div>
			{/each}
		</div>

		<div
			class="spinner-wrapper"
			class:not-allowed={inAction}
			id="createBtnId"
			onclick={createCRUDSupport}
			aria-hidden={true}
		>
			<span class="spinner" class:hidden={!inAction}></span>Create CRUD Support
		</div>
	</div>
{/snippet}
{#snippet pageByPageNote()}
	<!-- <cr-pre>
		For every route name and selected checkbox model from summary/details block the extension would build a TypeScript
		data entry +page.svelte with accompanying +page.server.ts for communicating with Prisma ORM local PostgreSQL
		database, based on a connection string set in the .env file in the app root folder.
	</cr-pre> -->
	{@render pageByPageMiddleColumn()}
{/snippet}
<div id="crudUIBlockId" class="cr-main-grid">
	<div class="application-settings">
		{#if isActive}
			{@render pagePurpose()}
		{/if}
		{@render pageByPageNote()}
	</div>
	<CRRBTooltip {models} bind:selectedModels bind:isLoading {userRoles}></CRRBTooltip>
</div>

<!-- no display just a showTooltip utils with markup -->
<ShowMessage bind:this={sm} />

<style lang="scss">
	.spinner-wrapper {
		position: relative;
		display: flex;
		// grid-template-columns: 1em 10rem;
		justify-content: center;
		align-items: center;
		font-size: 14px;
		column-gap: 0.5rem;
		line-height: 20px;
	}
	.spinner {
		position: absolute;
		top: 5.5px;
		left: -8px;
		display: inline-block;
		width: 0.8em;
		height: 0.8em;
		border: 3px solid #a1c1eb;
		border-top-color: #1b4891;
		border-radius: 50%;
		margin: 0 4px -3px 0.5rem;

		animation: spin 900ms linear infinite;
		span {
			display: inline-block;
		}
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.cr-main-grid {
		position: relative;
		display: grid;
		grid-template-columns: 30rem 30rem;
		column-gap: 1rem;
		margin: 0.5rem 0 0 1rem;
		width: max-content;
		height: auto;
		align-items: start;
	}
	.application-settings {
		width: 30rem;
		align-items: start;
		height: 100%;
	}
	.cr-left-column {
		@include container($head: 'Application Settings', $head-color: navy);
		position: relative;
		border: 1px solid gray;
		border-radius: 8px;
		height: 74vh;
		width: 30rem;
		margin-top: 1rem;
		padding: 1rem 0 0 0.7rem;
		background-color: var(--panel-bg-color);

		label {
			display: block;
			color: var(--candidate-color);
			cursor: pointer;
		}
		div {
			display: block;
		}
	}

	.embellishments {
		@include container($head: 'Include Components', $head-color: navy);
		background-color: var(--panel-bg-color);

		position: relative;
		display: grid;
		grid-template-columns: 1rem 7rem;
		width: 97.2%;
		column-gap: 0.5rem;
		row-gap: 0.1rem;
		align-items: center;
		padding: 8px 1rem;
		border: 1px solid gray;
		border-radius: 6px;
		user-select: none;
	}

	#createBtnId {
		position: absolute;
		top: 20rem;
		left: 1.2rem;
		outline: none;
		border: 1px solid gray;
		border-radius: 5px;
		font-weight: 400;
		padding: 4px 1rem;
		color: var(--candidate-color);
		margin: 6rem 6.5rem;
		width: max-content;
		cursor: pointer;
	}
	.notallowed {
		opacity: 0.3;
		cursor: not-allowed;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.app-labels {
		color: var(--checkbox-label-color);
		margin: 3px 0 3px 1rem;

		&:last-of-type {
			margin-bottom: 1rem;
		}
	}

	.authentication,
	.authorization {
		@include container(
			$head: 'Authentication',
			$head-color: navy,
			$padding: 0.5rem 1rem,
			$left: 1rem,
			$width: max-content
		);
		label {
			cursor: pointer;
		}
		margin: 0.5rem 0 1rem 0;
	}
	.authorization {
		@include container($head: 'Authorization', $left: 0.5rem);
		width: 16rem;
	}
	.radio-check-groups {
		display: grid !important;
		grid-template-columns: 11rem 14rem;
		column-gap: 0.5rem;
	}
	.hidden {
		display: none;
	}
	.not-allowed {
		cursor: not-allowed;
		background-color: lightgray;
	}
	.page-info {
		position: absolute;
		top: 0;
		left: 0;
		width: max-content;
		height: auto;
		padding: 1rem;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		border: 1px solid gray;
		border-radius: 6px;
		z-index: 20;
	}
</style>
