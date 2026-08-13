<script module lang="ts">
	let categoryIsRequired: string = '2,4';
	type Category = { id: number; name: string; selected?: boolean };

	let selectedOptions: HTMLParagraphElement;
	// cannot be const as the setSelectedOptions rebuilds them via new Set()
	let selectedIds = new Set<string>();
	let selectedNames = new Set<string>();
	let categories = $state<Category[]>([]);

	export const setSelectedOptions = (arr: number[], selOptions: string) => {
		selectedIds = new Set(arr.map((n) => String(n)));
		selectedNames = new Set(selOptions.split(','));
		if (arr.length === 0) {
			// selectedOptions.innerText = categoryIsRequired;
			utils.setTextColor('--MESSAGE-COLOR', 'lightgreen');
		} else {
			selectedOptions.innerText = selOptions.replaceAll(',', ', ');
			utils.setTextColor('--MESSAGE-COLOR', 'yellow');
		}
		categories = categories.map((cat) => {
			return { id: cat.id, name: cat.name, selected: arr.includes(cat.id) };
		});
	};
</script>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import * as utils from '$lib/utils';
	import { page } from '$app/state'; // for $age.status code on actions

	let pEl: HTMLParagraphElement;
	const pleaseSelect = 'Please select corresponding categories';
	const requiredCategory = 'category is required';

	type ARGS = {
		categories: Category[];
		selectedCategoryIds: string; // CSV string
		categoryIsRequired: string;
		class_multiselect: string;
	};
	let {
		categories: cat,
		selectedCategoryIds = $bindable(),
		categoryIsRequired: required = $bindable('2,4'),
		class_multiselect,
	}: ARGS = $props();

	let extractedColor = '';
	let cssTarget: HTMLUListElement | null = null;
	$effect(() => {
		if (cssTarget && class_multiselect) {
			// get the computed style for the element
			const style = getComputedStyle(cssTarget);
			extractedColor = style.color;
			// extractedColor will be "skyblue" or "rgb(...)" depending on browser
		}
	});

	categoryIsRequired = required;
	categories = cat;

	const idFromName = (name: string) => {
		for (let i = 0; i < categories.length; i++) {
			if (categories[i]?.name === name) {
				// @ts-expect-error
				return categories[i].id;
			}
		}
	};
	const onClick = (event: MouseEvent) => {
		event.preventDefault();
		const btn = event.target as HTMLButtonElement;
		const name = btn.innerText as string;
		const id = String(idFromName(name));

		if (selectedOptions.innerText === pleaseSelect || selectedOptions.innerText === requiredCategory) {
			selectedNames = new Set<string>();
		}

		const add = () => {
			selectedIds.add(id);
			selectedNames.add(name);
			btn.style.color = 'lightgreen';
		};
		const remove = () => {
			selectedIds.delete(id);
			selectedNames.delete(name);
			btn.style.color = 'white';
		};
		selectedIds.has(id) ? remove() : add();
		selectedCategoryIds = [...selectedIds].join(',');
		// we place CSV string in selectedOptions HTML paragraph element
		if (selectedNames.size) {
			// if (selectedOptions.innerText === pleaseSelect) {
			selectedOptions.innerText = '';
			// }
			selectedNames.forEach((name: string) => {
				const prev = selectedOptions.innerText;
				selectedOptions.innerText += name + ',';
				// if overflow-x kicks in replace last comma from previous with <br/>
				if (selectedOptions.scrollWidth > selectedOptions.clientWidth) {
					// name = name.replace(/\s+/g, '&nbsp;') + ',';
					selectedOptions.innerHTML = prev.replace(/,\s*$/, '<br />') + name.replace(/\s+/g, '&nbsp;') + ',';
				}
			});
		}
		scroll();
	};
	const scroll = () => {
		if (pEl.offsetHeight + pEl.scrollTop > pEl.getBoundingClientRect().height - 20) {
			tick().then(() => {
				pEl.scrollTo(0, pEl.scrollHeight);
			});
		}
	};
	onMount(() => {
		return () => {
			utils.setMrPath(page.url.pathname);
		};
	});

	// color is a colorName as string
	// let color = $derived(() => {
	// 	categoryIsRequired === 'Category is required' ? 'red' : 'skyblue'
	// })
</script>

<!-- <pre style="font-size:11px;">data {JSON.stringify(categories, null, 2)}</pre> -->

<p bind:this={selectedOptions} class="selected-cats" bind:this={pEl}>
	{pleaseSelect}
</p>
<ul bind:this={cssTarget} class="category-list {class_multiselect}">
	{#key categories}
		{#each categories as category}
			<li>
				<p
					onclick={onClick}
					class:selected={category.selected}
					aria-hidden={true}
					style="color:{extractedColor} !important;"
				>
					{category.name}
				</p>
			</li>
		{/each}
	{/key}
</ul>

<style lang="scss">
	.selected-cats {
		width: 30rem;
		height: 2rem; // more entries? 2.7rem
		line-height: 1.5rem;
		padding: 4px 1rem;
		margin: 5px 0;
		border: 1px solid gray;
		border-radius: 5px;
		color: var(--MESSAGE-COLOR);
		font-weight: 300;
		font-family: Arial, sans-serif;
		overflow-y: auto;
		height: auto;
	}
	.category-list {
		margin: 8px 0 0 0;
		height: 16.8rem;
	}
	ul {
		list-style: none;
		border: 1px solid yellow;
		border-radius: 5px;
		padding: 8px 1rem 8px 1.5rem;
		margin: 0;
		height: 12.2rem;
		width: 8rem;
		overflow-y: auto;
		li {
			// margin: 0;
			padding-bottom: 4px;
			// border: none;
			// outline: none;
			// margin-bottom: 4px;
			&:first-child {
				margin-top: 5px;
				color: red;
			}
			&:last-child {
				margin-bottom: 1rem;
			}
		}
	}
	p {
		margin: 0;
		padding: 0;
		color: var(--SELECT-OPTION-COLOR);
		border: none;
		outline: none;
		&:hover {
			color: var(--SELECT-OPTION-HOVER-COLOR);
			cursor: pointer;
		}
	}
	.selected {
		color: var(--SELECT-OPTION-SELECTED-COLOR);
		width: 100%;
	}
</style>
