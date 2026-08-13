<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	// import { createEventHandler } from '$lib/utils';
	import { createEventHandler } from './event-handler';
	import * as utils from '$lib/utils';
	const eh = createEventHandler();
	// let cleanup: (() => void) | null = null;
	let grid: HTMLDivElement | null = null;
	let activityEl: HTMLElement | null = null;
	type TEventsList = string;
	let noMouseOutEventList: Record<string, TEventsList> = {
		AA: 'click',
		BB: 'mouseover',
		CC: 'click',
		DD: 'click mouseout',
		EE: 'mouseover mouseout click'
	};
	let rightEventList: Record<string, TEventsList> = {
		One: 'click',
		Two: 'mouseover',
		Three: 'click',
		Four: 'click mouseout',
		Five: 'mouseover mouseout click'
	};
	let listCount = $state(0);
	const scroll = (el: HTMLElement) => {
		const els = el.children;
		const max = 50;
		if (els.length > max) {
			for (let i = 0; i < max / 2; i++) {
				els[0].remove(); // always delete the top one
			}
			// eventListEl.style.color = eventListEl.style.color === 'navy' ? 'green' : 'navy';
		}
		listCount = els.length;
		// count = listLength = els.length;
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};
	function clickHandler(e: MouseEvent) {

		report(e);
	}
	function report(e: MouseEvent) {

		const el = e.target as HTMLElement;
		const style = el.style;
		style.color = style.color === 'red' ? 'green' : 'red';

		const column = Number(el.parentElement?.dataset.column);
		const color = column === 1 ? 'tomato' : 'blue';
		let header = ([...Object.entries((grid as HTMLElement).children)][column][1] as HTMLElement)
			.innerText;
		header = header
			.replace(/(no)/, `<span style='color:${color};'>$1</span>`)
			.replace(/(all)/, `<span style='color:${color};'>$1</span>`);
		if (activityEl) {
			activityEl.innerHTML += `<p style='padding:3px 1rem;margin:3px 0 3px 0;'>[${header}]: <span style='color:${color}'>${e.type}</span>Handler</p>`;
			scroll(activityEl);
		}
	}
	function cHandler(e: MouseEvent) {
		report(e);
	}
	function mouseoverHandler(e: MouseEvent) {
		report(e);
	}
	function overHandler(e: MouseEvent) {
		report(e);
	}
	function mouseoutHandler(e: MouseEvent) {
		report(e);
	}
	function onDrop(e: MouseEvent) {
		report(e);
	}
	function clearActivity() {
		activityEl.innerText = '';
		listCount = 0;
	}
	onMount(() => {
		activityEl = document.querySelector('.activity');
		const container = utils.resolveElement('.first-column');
		(container as HTMLElement).ondrop = onDrop;
		eh.setup(container as HTMLElement);

		eh.setup('.second-column', { click: cHandler, mouseout: mouseoutHandler });
		eh.setup('.third-column', {
			click: clickHandler,
			mouseover: mouseoverHandler,
			mouseout: mouseoutHandler
		});
		const forth = document.querySelector('.forth-column') as HTMLElement;
		if (forth) {
			forth.ondrop = onDrop;
			eh.setup(forth);
		}
		grid = document.querySelector('.grid-wrapper');
	});
	onDestroy(() => {
		eh.destroy();
	});
	const user: Record<string, string> = {
		id: 'string',
		firstName: 'string',
		lastName: 'string',
		email: 'string',
		role: 'Role',
		updatedAt: 'Date'
	};
	const forthColumn: Record<string, string> = {
		ONE: 'string',
		TWO: 'string',
		THREE: 'string',
		FOUR: 'string',
		FIVE: 'Role',
		SIX: 'Date'
	};
</script>

<div class="grid-wrapper">
	<div>Drag Drop Record</div>
	<div>Wrapper no mouseout</div>
	<div>Wrapper all mouse events</div>
	<div>Drag Drop Number</div>

	<div class="first-column" data-column="0">
		{#each Object.entries(user) as [key, value] (key)}
			<div class="cr-list-el" aria-hidden={true}>
				<span>{key}: {value}</span>
			</div>
		{/each}
	</div>
	<div class="second-column" data-column="1">
		{#each Object.entries(noMouseOutEventList) as [title, list] (title)}
			<div data-event-list={list}>
				<span>{title} &nbsp; {list}</span>
			</div>
		{/each}
	</div>
	<div class="third-column" data-column="2">
		{#each Object.entries(rightEventList) as [title, list] (title)}
			<div data-event-list={list}>{title} &nbsp {list}</div>
		{/each}
	</div>
	<div class="forth-column" data-column="3">
		{#each Object.entries(forthColumn) as [title, list] (title)}
			<div><span>{title} {list}</span></div>
		{/each}
	</div>
	<div class="activity"></div>
</div>
<div class="fired-events-list">
	Fired Events List {listCount} item{listCount !== 1 ? 's' : ''}
	<p class="clear-list" onclick={clearActivity}>(clear list)</p>
</div>

<style lang="scss">
	.grid-wrapper {
		position: relative;
		display: grid;
		grid-template-columns: repeat(4, 20rem);
		align-items: start;
		gap: 0.5rem;
		margin-left: 1rem;
		&.grid-wrapper > *:nth-child(-n + 4) {
			background-color: #ffeaa7;
			font-weight: bold;
			color: #2c3e50;
			padding: 4px 0 4px 1rem;
			width: 94.5%;
		}
	}
	.first-column,
	.second-column,
	.third-column,
	.forth-column {
		border: 1px solid gray;
		border-radius: 10px;
		width: 17rem;
		padding: 1rem;
		div {
			color: navy;
			font-size: 18px;
			background-color: cornsilk;
			margin: 4px 0 4px 0;
			padding: 6px 1rem;
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
	.second-column {
		border: 1px solid gray;
		border-radius: 10px;
		div {
			cursor: pointer;
		}
	}
	.third-column,
	.forth-column {
		border: 1px solid gray;
		border-radius: 10px;
		color: navy;
		cursor: pointer;
		div {
			margin: 3px;
		}
	}
	.forth-column {
		position: relative;
	}
	.activity {
		grid-column: span 4;
		border: 1px solid gray;
		border-radius: 10px;
		padding: 2rem 0 1rem 1rem;
		grid-column: span 4;
		margin-top: 1rem;
		height: 14rem;
		overflow-y: auto;
	}
	.fired-events-list {
		position: absolute;
		top: 23.3rem;
		left: 4rem;
		padding: 0 0.5rem;
		margin: 0;
		outline: none;
		width: max-content;
		background-color: white;
	}
	.clear-list {
		display: inline-block;
		cursor: pointer;
		padding: 0;
		margin: 0;
		color: navy;
		&:hover {
			color: red;
		}
	}
</style>
