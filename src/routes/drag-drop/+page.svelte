<script lang="ts">
	import { onMount } from 'svelte';
	import { globalEH } from '../+layout.svelte';
	// import { enableDragReorder } from './dragdrop';
	// import { createEventHandler } from '$lib/utils';
	// import * as utils from '$lib/utils';
	// const eh = createEventHandler();

	type TEventsList = string;
	let reportClicksEl: HTMLDivElement;
	let grid: HTMLDivElement | null = null;
	let count = $state(0);
	let middleEventList: Record<string, TEventsList> = {
		AA: 'click',
		BB: 'mouseover',
		CC: 'click',
		DD: 'click mouseout',
		EE: 'mouseover mouseout click',
	};
	let rightEventList: Record<string, TEventsList> = {
		One: 'click',
		Two: 'mouseover',
		Three: 'click',
		Four: 'click mouseout',
		Five: 'mouseover mouseout click',
	};
	const scroll = (el: HTMLDivElement) => {
		const els = el.children;
		const max = 50;
		if (els.length > max) {
			for (let i = 0; i < max / 2; i++) {
				els[0].remove(); // always delete the top one
			}
		}
		count = els.length;
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};
	function gridColumns(grid: HTMLElement) {
		// const computedStyle = window.getComputedStyle(grid) as CSSStyleProperties;
		return getComputedStyle(grid).gridTemplateColumns.split(' ').length;
	}
	function gridRows(grid: HTMLElement) {
		// const computedStyle = window.getComputedStyle(grid) as CSSStyleProperties;
		return getComputedStyle(grid as HTMLElement).gridTemplateRows.split(' ').length;
	}
	// function gridCell(row: number, column: number);
	const colors = ['violet', 'tomato', 'blue', 'green', 'navy'];
	function toggleColor(e: MouseEvent) {
		const el = e.target as HTMLElement;
		const style = el.style;
		style.color = style.color === 'red' ? 'green' : 'red';

		const column = Number(el.parentElement?.dataset.column);
		const color = colors[column];
		let header = ([...Object.entries((grid as HTMLElement).children)][column][1] as HTMLElement).innerText;
		header = header
			.replace(/(no)/, `<span style='color:${color};'>$1</span>`)
			.replace(/(all)/, `<span style='color:${color};'>$1</span>`);

		// array of all function names on this page
		// const fNames = new Error().stack?.match(/^([^@]+)/gm);
		// console.log(fNames);
		reportClicksEl.innerHTML += `<p>[${header}]: <span style='color:${color}'>${e.type}</span>Handler</p>`;
		scroll(reportClicksEl);
	}
	// handlers
	function clickHandler(e: MouseEvent) {
		toggleColor(e);
	}
	function cHandler(e: MouseEvent) {
		toggleColor(e);
	}
	function mouseoverHandler(e: MouseEvent) {
		toggleColor(e);
	}
	function overHandler(e: MouseEvent) {
		toggleColor(e);
	}
	function mouseoutHandler(e: MouseEvent) {
		toggleColor(e);
	}
	function onDrop(e: MouseEvent) {
		toggleColor(e);
	}
	let handlers = ''; //
	function makeHandlerList(el: HTMLElement | Node) {}

	onMount(() => {
		document.querySelectorAll<HTMLElement>('[data-event-handler]').forEach(makeHandlerList);
		// for (const pair of pairs) {
		//   const [eventName, handlerName] = pair.split(':').map(s => s.trim())
		// const draggables = document.querySelectorAll<HTMLElement>('[class~="draggable"]') as NodeListOf<HTMLElement>
		// Object.entries(draggables).forEach(([s, el]) =>{console.log(s,el.classList)})
		// const container = utils.resolveElement('.draggable-one') as HTMLElement;
		// container.ondrop = onDrop;
		// eh.setup(container as HTMLElement);
		// const ddcol = utils.resolveElement('.dd-column') as HTMLElement;
		// ddcol.ondrop = onDrop;
		// eh.setup(ddcol);

		// eh.setup('.middle-column', { click: cHandler, mouseover: overHandler });
		// eh.setup('.right-column', {
		// 	click: clickHandler,
		// 	mouseover: mouseoverHandler,
		// 	mouseout: mouseoutHandler
		// });
		// reportClicksEl = document.querySelector('.report-clicks') as HTMLDivElement;
		// grid = document.querySelector('.grid-wrapper');

		// return () => {
		// 	eh.destroy();
		// };
	});
	const options: Record<string, string> = {
		id: 'string',
		firstName: 'string',
		lastName: 'string',
		email: 'string',
		role: 'Role',
		updatedAt: 'Date',
	};
	const forthColumn: Record<string, string> = {
		ONE: 'string',
		TWO: 'string',
		THREE: 'string',
		FOUR: 'string',
		FIVE: 'Role',
		SIX: 'Date',
	};
</script>

<!-- 🔥Ctrl+Shipt+U1F525 -->
<div class="grid-wrapper">
	<div>Drag Drop First 🔥</div>
	<div>Wrapper no mouseout 🔥</div>
	<div>Wrapper all mouse events</div>
	<div>Drag Drop Last 🔥</div>

	<div class="draggable-one" data-column="0">
		{#each Object.entries(options) as [key, value] (key)}
			<div class="cr-list-el" aria-hidden={true} draggable="true">
				{key}: {value}
			</div>
		{/each}
	</div>
	<div class="middle-column" data-column="1">
		{#each Object.entries(middleEventList) as [title, list] (title)}
			<div data-event-list={list}>
				{title} &nbsp; on: {list}
			</div>
		{/each}
	</div>
	<div class="right-column" data-column="2">
		{#each Object.entries(rightEventList) as [title, list] (title)}
			<div data-event-list={list}>{title} &nbsp; on: {list}</div>
		{/each}
	</div>
	<div
		class="dd-column"
		data-column="3"
		data-event-handler="dragstart:handleDragStart, dragover:handleDragOver, drop:handleDrop, dragend:handleDragEnd"
	>
		{#each Object.entries(forthColumn) as [title, list] (title)}
			<div draggable="true">{title} {list}</div>
		{/each}
	</div>
	<div class="report-clicks-wrapper" style="grid-column: span 4;margin-right:2rem;">
		<div class="report-clicks-label">Event Report List {count}</div>
		<div class="report-clicks"></div>
	</div>
</div>

<style lang="scss">
	.grid-wrapper {
		display: grid;
		grid-template-columns: 12rem 17.3rem 23rem 12rem;
		align-items: start;
		gap: 1rem;
		margin-left: 2rem;
		z-index: 0;
		&.grid-wrapper > *:nth-child(-n + 4) {
			background-color: #ffeaa7;
			font-weight: bold;
			color: #2c3e50;
			padding: 4px 0 4px 1rem;
			width: 94.5%;
		}
	}
	.cr-list-el {
		color: var(--drag-color);
	}
	.draggable-one,
	.dd-column {
		border: 1px solid gray;
		border-radius: 10px;
		width: 10rem;
		padding: 1rem;
		color: var(--drag-color);
		div {
			/* width:100%; */
			background-color: cornsilk;
			margin: 4px 0 4px 0;
			padding: 2px 1rem;
			cursor: pointer;
			user-select: none;
			cursor: pointer;
			&:first-child {
				border-top-left-radius: 10px;
				border-top-right-radius: 10px;
			}
			&:last-child {
				border-bottom-left-radius: 10px;
				border-bottom-right-radius: 10px;
			}
		}
	}
	.middle-column {
		border: 1px solid gray;
		border-radius: 10px;
		padding: 0.5rem;
		margin: 0;
		width: max-content;
		div {
			color: var(--candidate-color);
			padding: 4px 0 2px 1rem;
			cursor: pointer;
		}
	}
	.right-column {
		border: 1px solid gray;
		border-radius: 10px;
		padding: 6px 1.5rem;
		width: max-content;
		margin: 0;
		font-size: 20px;
		color: var(--candidate-color);
		cursor: pointer;
		div {
			margin: 0;
			padding: 0;
		}
	}
	.report-clicks-wrapper {
		position: relative;
	}

	.report-clicks-label {
		position: absolute;
		top: -0.4rem;
		left: 1rem;
		padding: 0 0.5rem;
		grid-column: span 4;
		background: white;
		color: navy;
		pointer-events: none;
	}

	.report-clicks {
		position: relative;
		grid-column: span 4;
		height: 16rem;
		padding: 1rem;
		width: 100%;
		margin-top: 1rem;
		border: 1px solid gray;
		border-radius: 10px;
		overflow-y: auto;
		:global(p) {
			color: navy;
			padding: 0;
			margin: 0;
		}
	}
</style>
