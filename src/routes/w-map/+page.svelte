<script lang="ts">
	import { onMount } from 'svelte';
	import { resolveElement, createEventHandler, type TEventType } from '$lib/utils';

	type THandler = (event: MouseEvent) => void;
	type THandlers = Record<string, THandler>;
	let eventListEl: HTMLDivElement;
	let selectEl: HTMLSelectElement;
	const eh = createEventHandler();

	let listLength = $state(0);
	const clearEventList = () => {
		eventListEl.innerHTML = '';
	};
	const scroll = (el: HTMLDivElement) => {
		const els = el.children;
		const max = 50;
		if (els.length > max) {
			for (let i = 0; i < max / 2; i++) {
				els[0].remove(); // always delete the top one
			}
			eventListEl.style.color = eventListEl.style.color === 'navy' ? 'green' : 'navy';
		}
		listLength = els.length;
		if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
			setTimeout(() => {
				el.scrollTo(0, el.scrollHeight);
			}, 0);
		}
	};

	// handlers
	function handleList(e: MouseEvent) {
		(eventListEl as HTMLDivElement).innerHTML += `${e.type}!<br/>`;
		scroll(eventListEl);
	}
	// Callbacks
	function onClick(e: MouseEvent) {
		handleList(e);
	}
	function onClickA(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOver(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOverA(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOut(e: MouseEvent) {
		handleList(e);
	}
	function onMouseOutA(e: MouseEvent) {
		handleList(e);
	}

	// function getSelectedOptionDetails() {
	// 	const selIx = selectEl.selectedIndex;
	// 	const selOption = selectEl.options[selIx] as HTMLOptionElement;
	// 	const groupText =
	// 		((selOption as HTMLOptionElement).parentNode as HTMLOptGroupElement).label || 'No Group';
	// 	if (groupText !== 'No Group') {
	// 		selectedGroup = groupText
	// 			.replace(/^./, (m) => m.toUpperCase())
	// 			.replace(/-./, (m) => ' ' + m[1].toUpperCase());
	// 	}
	// }
	const eventTypes = ['click', 'mouseover', 'mouseout'];
	let options: Record<string, typeof eventTypes> = {
		'First Container': eventTypes,
		'Second Container': eventTypes,
		'Third Container': eventTypes,
	};
	function oLength(group?: string) {
		try {
			if (group) {
				return Object.keys(options[group]).length;
			}
			let length = 0;
			for (const group of Object.keys(options)) {
				length += options[group].length;
			}
			return length;
		} catch (err) {
			console.log(err);
			return 0;
		}
	}
	function removeSelected() {
		let selIx = selectEl.selectedIndex;

		const { group, opt } = JSON.parse((selectEl.options[selIx] as HTMLOptionElement).value);
		options[group] = options[group].filter((el) => el !== opt);
		if (!oLength(group)) {
			delete options[group];
		}
		const ol = oLength();
		if (!ol) {
			selIx = -1;
		} else {
			if (selIx >= ol - 1) {
				selIx = selIx - 1;
			}
		}
		selectEl.selectedIndex = selIx;
	}
	function st(obj: unknown) {
		return JSON.stringify(obj);
	}
	function selectAndSetup(selector: HTMLElement | string, handlers: THandlers) {
		const wrapper = resolveElement(selector) as HTMLElement;
		let group = '';
		if (wrapper.id) {
			group = wrapper.id;
		} else if (wrapper.classList) {
			group = wrapper.classList[0];
		}
		const eventTypes = [];
		for (const eventType of Object.keys(handlers)) {
			eventTypes.push(eventType);
		}
		options[group] = eventTypes; //Object.keys(handler);
	}
	// attach event handlers
	onMount(() => {
		eventListEl = document.getElementById('eventListId') as HTMLDivElement;
		eventListEl.style.color = 'navy';
		selectAndSetup('.first-container', {
			click: onClick,
			mouseover: onMouseOver,
			mouseout: onMouseOut,
		});
		selectAndSetup('.second-container', {
			click: onClickA,
			mouseover: onMouseOverA,
			mouseout: onMouseOutA,
		});
		eh.setup('.first-container', { click: onClick, mouseover: onMouseOver, mouseout: onMouseOut });
		eh.setup('.second-container', {
			click: onClickA,
			mouseover: onMouseOverA,
			mouseout: onMouseOutA,
		});
		// selectEl = document.getElementById('selbox') as HTMLSelectElement;
		setTimeout(() => {
			selectEl.selectedIndex = 8; // = 'mouseover';
		}, 400);
		return () => {
			eh.destroy();
		};
	});
	// @ts-expect-error onMount bindings should be established
	selectEl.selectedIndex = 8;
</script>

<!-- dismantling the handlers is possible on demand -->
<div class="command-row">
	<button onclick={eh.destroy} style="margin-top:1rem;">kill WeakMap</button>

	<select bind:this={selectEl}>
		{#each Object.entries(options) as [group, opts] (group)}
			<optgroup label={group}>
				{#each opts as opt (opt)}
					<option value={st({ group, opt })}>{opt}</option>
				{/each}
			</optgroup>
		{/each}
	</select>

	<button onclick={removeSelected}>remove selected</button>
</div>

<!-- wrapper for elements to obtain event handlers -->
<div class="grid-wrapper">
	<div class="first-container">
		<p data-event-list="mouseover mouseout">The First Paragraph mouseover mouseout</p>
		<p data-event-list="click mouseover">The Second Paragraph click mouseover</p>
		<p data-event-list="click">The Third Paragraph click</p>
		<p data-event-list="click mouseover mouseout">The Fourth Paragraph click mouseover mouseout</p>
	</div>

	<div class="second-container">
		<div data-event-list="click">Paragraph One -- click</div>
		<div data-event-list="mouseover">Paragraph Two -- mouseover</div>
		<div data-event-list="click mouseover mouseout">Paragraph Three -- click, mouseover, mouseout</div>
		<div data-event-list="mouseout">Paragraph Four -- mouseout</div>
	</div>
	<div class="third-container">
		<p data-event-list="mouseover mouseout">The First Paragraph mouseover mouseout</p>
		<p data-event-list="click mouseover">The Second Paragraph click mouseover</p>
		<p data-event-list="click">The Third Paragraph click</p>
		<p data-event-list="click mouseover mouseout">The Fourth Paragraph click mouseover mouseout</p>
	</div>
	<div class="right-column">
		<p onclick={clearEventList} onkeyup={clearEventList} aria-hidden={true}>
			list length: {listLength} (clear)
		</p>
		<div id="eventListId" class="event-list"></div>
	</div>
</div>

<style lang="scss">
	:root {
		--first-container: 'First Container';
		--second-container: 'Second Container';
	}
	.command-row {
		position: relative;
		margin: 0;
		padding: 0;
		width: max-content;
		p {
			position: absolute;
			top: -1.2rem;
			left: 5.3rem;
			padding: 0 0.5rem;
			color: navy;
			background-color: white;
			z-index: 3;
		}
	}
	.grid-wrapper {
		display: grid;
		grid-template-columns: repeat(3, 21rem);
		gap: 1rem;
		margin-top: 2rem;
		align-items: start;
	}
	.first-container {
		@include container($head: 'First Container', $head-color: skyblue);
		border: 1px solid gray;
		border-radius: 10px;
		color: navy;
		margin: 0;
		padding: 0 0 0 6px;
		p {
			padding: 0;
			margin: 5px 6px;
			&:first-child {
				margin-top: 1rem;
			}
		}
	}
	.right-column {
		position: relative;
		border: 1px solid gray;
		border-radius: 10px;
		p {
			position: absolute;
			top: -1.5rem;
			left: 1rem;
			padding: 0 0.3rem;
			color: navy;
			background-color: white;
			z-index: 3;
		}
	}
	.event-list {
		height: 10rem;
		overflow-y: auto;
		padding: 1rem;
		&::before {
			position: absolute;
			content: ' ';
			top: 0;
			left: 0;
			border-radius: 12px;
			height: 1rem;
			width: 100%;
			opacity: 1;
			background-color: white;
			z-index: 2;
		}
	}
	p {
		cursor: pointer;
	}
	.select-list {
		position: relative;
		margin: 0;
		padding: 0;
		width: 8rem;
		p {
			position: absolute;
			top: -1.2rem;
			left: 1rem;
			padding: 0 0.5rem;
			z-index: 5;
		}
	}
	.second-container,
	.third-container {
		@include container($head: 'Second Container', $head-color: skyblue);
		color: green;
		padding: 1rem;
		border: 1px solid gray;
		border-radius: 6px;
		width: max-content;
		margin-top: 2rem;
		div {
			padding: 2px 0;
			cursor: pointer;
		}
	}
	.third-container {
		@include container($head: 'Third Container', $head-color: skyblue);
	}
</style>
