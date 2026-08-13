<script lang="ts">
	import { onMount } from 'svelte';
	import { setCSSValue } from '$lib/utils';
	export type RadioButtonValue = string | number;
	export type TRadioButtons = Record<string, RadioButtonValue>;
	export type TProps = {
		callback: (lrb: string) => void;
		radioButtons: TRadioButtons;
		listContainerId: string;
	};
	let listEl: HTMLElement | null = null;
	let { callback, radioButtons, listContainerId }: TProps = $props();
	// radio buttons group to select Login, Register or Both
	// Login, Register, Both radio button group container
	let toAddWhereEl: HTMLDivElement | null = null;

	let LRB = $state(''); // LRB for Login, Register or Both
	// schema summary/detail container bounding rect used to hide radio buttons
	// group when mouse gets out of its bounds (set inside onMount)
	let r: { left: number; right: number; top: number; bottom: number } = {}; // bounding rectangle

	function insideElBounds(e: MouseEvent) {
		const res = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
		return res;
	}
	// visibility is achieved via toggling the opacity of radio buttons container
	function toggleOpacity(e: MouseEvent) {
		// e.preventDefault();
		if (insideElBounds(e) === false) {
			// necessary separate it from the return
			setTimeout(() => {
				setCSSValue('--opacity', 0);
			}, 0);
			return;
		}
		const target = e.target as HTMLElement;
		if (target === listEl) {
			return;
		}
		const related = e.relatedTarget as HTMLElement | null;
		const p = target.closest('p');
		if (!p) return;

		// Ignore moves within the same <p> tag
		if (related && p.contains(related)) return;

		if (!toAddWhereEl) {
			// probably unnecessary
			toAddWhereEl = document.querySelector('.to-add-where') as HTMLDivElement;
		}
		toAddWhereEl.style.top = String(p.offsetTop - p.offsetHeight) + 'px';
		toAddWhereEl.style.left = String(p.offsetLeft + 12) + 'px';
		setCSSValue('--opacity', 1);
	}

	// when radio is selected take its value L,R or RL for both
	// and turn it hidden when timeout elapse
	function onChangeLRB() {
		const el = document.querySelector('input[name=cr-radio-group]:checked');
		setTimeout(async () => {
			setCSSValue('--opacity', '0');
		}, 100);
		setTimeout(async () => {
			document.querySelectorAll('input[name=cr-radio-group]').forEach((rb) => {
				(rb as HTMLInputElement).checked = false;
			});
		}, 1000);
		callback((el as HTMLInputElement)?.value);
	}
	onMount(() => {
		listEl = document.getElementById(listContainerId);
		if (!listEl) {
			return;
		}
		r = listEl.getBoundingClientRect();
		listEl.style.width = 'max-content';
		listEl.classList.add('list-container');
		listEl.addEventListener('mouseover', toggleOpacity);
		listEl.addEventListener('mouseout', toggleOpacity);
		listEl.style.border = '1px solid gray';
		// listEl.classList.value = `${'list-container'} ${listEl.classList.value}`.trim();
		toAddWhereEl = document.querySelector('.to-add-where') as HTMLDivElement;
	});
</script>

<div class="to-add-where">
	<div class="radio-wrapper">
		{#each Object.entries(radioButtons) as [name, value] (name)}
			<label><input type="radio" name="cr-radio-group" {value} onchange={onChangeLRB} />{name}</label>
		{/each}
	</div>
</div>

<style lang="scss">
	:root {
		--opacity: 0;
	}
	:global(.list-container) {
		position: relative;
		margin-left: 3rem;
		padding: 0 1.5rem 0 1rem;
		p {
			width: max-content;
			padding: 1px 0.5rem;
		}
		.to-add-where {
			position: absolute;
			top: -1.5rem;
			left: 0 !important;
			width: max-content;
			height: 1.1rem;
			padding: 1px 0.4rem 1rem 0.1rem;
			color: var(--model-name);
			opacity: var(--opacity);
			.radio-wrapper {
				background-color: skyblue;
				padding: 3px 0.5rem;
				border-radius: 5px !important;
				color: navy !important;
				width: max-content;
				cursor: pointer;
				label,
				input {
					margin: 0;
					padding: 0;
					// width: max-content;
					/* opacity: var(--opacity); */
				}
			}
			/* opacity: var(--opacity); */
			transition: opacity ease 1s;
		}
		&:hover .to-add-where {
			/* opacity: var(--opacity); */
			cursor: pointer;
			user-select: none;
		}
	}
</style>
