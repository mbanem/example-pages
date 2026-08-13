<script lang="ts">
	import { onMount } from 'svelte';
	import { getCSSValue, setCSSValue } from '$lib/utils';
	let count = $state(0);

	// radio buttons group to select Login, Register or both
	// rqdio button group containeer
	let toAddWhereEl: HTMLDivElement | null = null;
	let schemaContainerEl: HTMLDivElement | null = null;
	let LRB = $state('');
	const changeColorPseudoEle = () => {
		const root = document.querySelector(':root') as HTMLElement; //grabbing the root element
		let color = root.style.getPropertyValue('--before-background-color');
		root.style.setProperty('--before-background-color', color === 'blue' ? 'darkcyan' : 'blue');
		color = root.style.getPropertyValue('--after-background-color');
		root.style.setProperty('--after-background-color', color === 'orangered' ? 'rebeccapurple' : 'orangered');
	};

	let r: { left: number; right: number; top: number; bottom: number } = {}; // bounding rectangle
	function insideElBounds(e: MouseEvent) {
		return e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
	}
	function toggleOpacity(e: MouseEvent) {
		if (e.type === 'mouseout' && !insideElBounds(e)) {
			setCSSValue('--opacity', 0);
			return;
		}
		const target = e.target as HTMLElement;
		const related = e.relatedTarget as HTMLElement | null;
		const p = target.closest('p');
		if (!p) return;

		// Ignore moves within the same <p>
		if (related && p.contains(related)) return;

		if (!toAddWhereEl) {
			toAddWhereEl = document.getElementById('ormModelTooltipId') as HTMLDivElement;
		}
		toAddWhereEl.style.top = String(p.offsetTop - p.offsetHeight) + 'px';
		toAddWhereEl.style.left = String(p.offsetLeft + 12) + 'px';
		setCSSValue('--opacity', 1);
	}

	function onChangeLRB() {
		const el = document.querySelector('input[name=LRB]:checked');
		setTimeout(async () => {
			setCSSValue('--opacity', '0');
		}, 100);
		setTimeout(async () => {
			document.querySelectorAll('input[name=LRB]').forEach((rb) => {
				(rb as HTMLInputElement).checked = false;
			});
		}, 1000);
		LRB = (el as HTMLInputElement)?.value;
	}
	onMount(() => {
		toAddWhereEl = document.querySelector('.to-add-where') as HTMLDivElement;
		schemaContainerEl = document.getElementById('schemaContainerId') as HTMLDivElement;
		r = schemaContainerEl?.getBoundingClientRect();
	});
</script>

<p>opacity {getCSSValue('--opacity')}</p>
<h2 style="color: green;">GeeksforGeeks</h2>

<h3>How to update the CSS properties of pseudo element ::after and ::before using javascript</h3>

<div id="box">Hello Geek!</div>

<br />
<button onclick={changeColorPseudoEle} style="display:block;margin-left:2rem;padding:0 1.5rem;">
	change color
</button><br />
<div class="count" style="--before-count: '{String(count)}';margin-left:2rem;">Count as ::before element</div>
<button
	onclick={() => {
		return count > 0 ? count-- : count;
	}}
	style="margin:0.2rem 0 0 2rem;padding:0;"
>
	decreament
</button>
<button onclick={() => count++} style="margin-left:10px;padding:0;"> increment </button>
<div
	id="schemaContainerId"
	onmouseover={toggleOpacity}
	onmouseout={toggleOpacity}
	role="status"
	onblur={undefined}
	onfocus={undefined}
>
	{#each Array(5) as _, i (10 * i)}
		<p>field number {i + 10}</p>
	{/each}
	<div class="to-add-where">
		<div class="radio-wrapper">
			<label><input type="radio" name="LRB" value="L" onchange={onChangeLRB} />Login</label>
			<label><input type="radio" name="LRB" value="R" onchange={onChangeLRB} />Register</label>
			<label><input type="radio" name="LRB" value="LR" onchange={onChangeLRB} />Both</label>
		</div>
	</div>
</div>

<style>
	:root {
		--before-background-color: darkcyan;
		--before-color: white;
		--after-background-color: orangered;
		--after-color: white;
		--opacity: 0;
	}
	#schemaContainerId {
		position: relative;
		margin-left: 3rem;
		width: max-content;
		padding: 0 2.5rem 0 2rem;
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
				cursor: pointer;
				label,
				input {
					margin: 0;
					padding: 0;
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
	#box {
		width: max-content;
		height: auto;
		background-color: green;
		padding: 40px;
		color: white;
		font-size: 20px;
		font-weight: 200;
		position: relative;
		margin-left: 300px;
	}

	#box::after {
		position: absolute;
		content: '::after pseudo element';
		top: 0;
		left: 100%;
		padding: 40px;
		color: white;
		width: max-content;
		height: auto;
		background-color: var(--after-background-color);
		font-size: 20px;
		font-weight: 200;
	}

	#box::before {
		position: absolute;
		content: '::before pseudo element';
		top: 0%;
		right: 100%;
		padding: 40px;
		color: white;
		width: max-content;
		height: auto;
		background-color: var(--before-background-color);
		font-size: 20px;
		font-weight: 200;
	}
	.count {
		position: relative;
		margin-top: 2rem;
		&::before {
			position: absolute;
			top: -1.8rem;
			left: 4rem;
			content: var(--before-count);
			font-size: 24px;
			color: navy;
		}
	}
</style>
