<script lang="ts">
	import { onMount } from 'svelte';
	import { createEventDispatcher } from 'svelte';

	export let categoryIDs: number[] = [];
	export let data: { id: number; name: string }[];

	export let select_box: any;
	export let selected_categories: any;

	// to silence TS as props are quoted class names and so hidden from it
	let x = select_box !== null && selected_categories !== null;

	export let selected: string[] = [];
	let selectBox: HTMLSelectElement;
	let selectedOptions: HTMLParagraphElement;
	const msg = 'Please select corresponding categories';
	const dispatcher = createEventDispatcher<{ categoryids: { ids: number[]; names: string[] } }>();

	const onClick = (event: MouseEvent) => {
		// const opts = Array.from(document.querySelectorAll('#categories option'));
		const opts = (event.currentTarget as HTMLSelectElement).options;
		// console.log(opts);
		const isSelected = (option: HTMLOptionElement) => {
			return selected.includes(option.value);
		};
		const removeSelected = (option: HTMLOptionElement) => {
			selected = selected.filter((opt) => opt !== option.value);
			categoryIDs = categoryIDs.filter((id) => id !== Number(option.id));
		};
		for (var i = 0; i < opts.length; i++) {
			if (opts[i]?.selected) {
				if (isSelected(opts[i] as HTMLOptionElement)) {
					removeSelected(opts[i] as HTMLOptionElement);
				} else {
					selected.push((opts[i] as HTMLOptionElement).value);
					categoryIDs.push(Number((opts[i] as HTMLOptionElement).id));
				}
			}
		}
		dispatcher('categoryids', { ids: categoryIDs, names: selected });
		selectedOptions.innerText = selected.length > 0 ? selected.join(', ') : msg;
	};
	onMount(() => {
		let options = '';
		data.forEach((opt) => {
			options += '<option id="' + opt.id + '" value="' + opt.name + '">' + opt.name + '</option>';
		});
		selectBox.innerHTML = options;
	});
</script>

<div class="class.select-container">
	<p class="selected_categories" bind:this={selectedOptions}>{msg}</p>
	<select class="select_box" bind:this={selectBox} on:click={onClick} name="categories" multiple> </select>
</div>
