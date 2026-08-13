<!--
@component
Ctrl+Shift+P   Local History: Find Entry to Restore
-->

<script lang="ts">
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';

	const allRoles = ['USER', 'ADMIN', 'VISITOR', 'MODERATOR'];
	const roles = new SvelteMap<string, SvelteSet<string>>();

	// when dropdown is opened set the current selectedModel
	let selectedModel = $state('');
	let dropdownEl: HTMLDivElement;

	function roleSelected(e: MouseEvent, model: string) {
		const el = e.target as HTMLElement;
		// console.log('roleSelected', el.classList[0]);
		if (!el.classList[0]) {
			return;
		}
		switch (el.classList[0]) {
			case 'selectedRoles': {
				selectedModel = (el.parentElement as HTMLElement)?.dataset.model as string;
				// console.log('switch selectedRoles', selectedModel);
				// in order to position drop down find rect of currently selected role-list
				const { x, bottom } = el.getBoundingClientRect();
				Object.assign(dropdownEl.style, {
					top: `${bottom}px`,
					left: `${x}px`,
				});
				dropdownEl.classList.toggle('hidden');
				break;
			}
			case 'role-list':
				dropdownEl.classList.toggle('hidden');
				break;
			default: {
				// Svelte cryptic class name
				const role = el.innerText.match(/(\w+)\s*$/)?.[0];
				if (role && !el.classList.contains('role-list')) {
					toggleRole(model as string, role);
				}
			}
		}
	}
	function toggleRole(model: string, role: string) {
		// console.log('toggleRole', model, role);

		let set = roles.get(model);

		if (!set) {
			set = new SvelteSet<string>();
			roles.set(model, set);
		}

		if (set.has(role)) {
			set.delete(role);
		} else {
			set.add(role);
		}
	}
	function dismiss(e: MouseEvent) {
		(e.target as HTMLElement).querySelector('.dropdown')?.classList.add('hidden');
	}
</script>

{#snippet multiSelect(model: string)}
	{@const selected = roles.get(model) ?? new SvelteSet<string>()}

	<div
		class="select-wrapper"
		aria-hidden={true}
		onclick={(e: MouseEvent) => roleSelected(e, model)}
		onmouseleave={dismiss}
	>
		<!-- selected roles -->
		<div class="role-list" aria-hidden={true} data-model={model}>
			{#if selected.size}
				{#each [...selected] as role (role)}
					<span class="badge">
						{role[0]}
					</span>
				{/each}
			{:else}
				<span class="selectedRoles">none selected</span>
			{/if}
		</div>
	</div>
{/snippet}
<!-- dropdown -->
<div
	bind:this={dropdownEl}
	class="dropdown hidden"
	onclick={(e: MouseEvent) => toggleRole(selectedModel, (e.target as HTMLElement)?.innerText.slice(2))}
	onkeyup={undefined}
	onmouseleave={(e: MouseEvent) => {
		(e.currentTarget as HTMLElement).classList.add('hidden');
	}}
	aria-hidden={true}
>
	{#each allRoles as role (role)}
		<p class:selected={roles.get(selectedModel)?.has(role)}>
			<span class="letter">
				{role[0]}
			</span>
			{role}
		</p>
	{/each}
</div>
{@render multiSelect('User')}

<style lang="scss">
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
	.select-wrapper {
		width: 8rem;
		margin-left: 2rem;
		user-select: none;
		.role-list {
			display: flex;
			gap: 0.4rem;

			border: 1px solid lightgray;
			width: 100%;
			border-radius: 4px;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			.badge {
				display: inline-block;
				// color: var(--candidate-color);
				// background-color: var(--candidate-bg-color);
				font-size: 11px;
				border: 1px solid gray;
				border-radius: 4px;
				padding: 0 2px !important;
			}
			.selectedRoles {
				display: inline-block;
				text-align: center;
				width: 8rem;
				cursor: pointer;
			}
		}
	}
	.selected {
		opacity: 0.5;
	}
	.dropdown {
		position: absolute;
		top: 3rem;
		left: 5rem;
		width: 8rem;
		padding: 2px 1rem;
		border: 1px solid gray;
		border-radius: 6px;
		background-color: var(--candidate-bg-color);
		cursor: pointer;
		user-select: none;
		p {
			font-size: 10px;
			margin: 0;
			padding: 1px 0;
			/*color: var(--clickable-label-color);
			background-color: var(--candidate-bg-color);*/
			&:hover {
				width: 100%;
				background-color: cornsilk;
			}
		}
		.letter {
			// 	color: var(--candidate-color);
			// 	background-color: var(--candidate-bg-color);
			font-size: 11px;
			border: 1px solid gray;
			border-radius: 4px;
			padding: 0 4px;
			// margin: 0 4px;
		}
	}
	.role-line {
		// color: var(--clickable-label-color);
		// background-color: var(--candidate-bg-color);
	}
	.hidden {
		display: none;
	}
</style>
