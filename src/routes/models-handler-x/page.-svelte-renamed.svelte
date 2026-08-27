<script lang="ts">
	import type { PageProps } from './$types';
	import CRReactiveTooltip from './CRReactiveTooltip.svelte';
	import { CRTooltip } from './CRReactiveTooltip';
	import CRModelsHandler from './CRModelsHandler.svelte';

	type Field = {
		name: string;
		type: string;
		isArray: boolean;
		isOptional: boolean;
		isDataEntry: boolean;
		attrs?: string;
	};
	// no name; it should be part of Models with their name as a key
	type Model = {
		fields: Field[];
		attrs?: string[];
	};
	// type Models = Record<string, Model>;
	type TEnum = Record<string, string>;
	// type TEnums = Record<string, TEnum>;

	// Create as many independent tooltips as you want
	let tt1: CRTooltip;
	let tt2: CRTooltip;
	// const tip3 = new CRTooltip();

	let btn1: HTMLButtonElement;
	let btn2: HTMLButtonElement;

	let { data }: PageProps = $props();
	let isActive = $state(false);
	let models = data.models; // avoid $derived as we use this one-time only
	// console.log('data.enums', data.enums); // type TEnums = Record<string, Record<string, string>>;
	let isLoading = $state(false);
	// let userRoles = ['USER', 'ADMIN', 'VISITOR', 'MODERTOR'];
	let userRoles = Object.keys(Object.values(data.enums)[0] as TEnum).filter(Boolean);
	// let models = data.data.models

	let selectedModels = $state<SelectedModels>({});
	let msg = 'First tooltip,can stay open';
	function show1() {
		if (!tt1) {
			tt1 = new CRTooltip();
		} else {
			msg = 'another information,for tooltip one';
		}
		tt1.show(
			btn1,
			msg,
			0, // stays until closed
			'above',
			{ backgroundColor: '#fff0f0', color: 'crimson', border: '1px solid crimson' }
		);
	}

	function show2() {
		if (!tt2) {
			tt2 = new CRTooltip();
		}
		tt2.show(btn2, 'Second tooltip,different style', 0, 'right', {
			backgroundColor: 'cornsilk',
			color: 'navy',
			border: '1px solid goldenrod',
		});
	}

	function showBoth() {
		show1();
		show2(); // both will be visible at the same time
	}

	let tooltip: CRReactiveTooltip;

	let buttonEl: HTMLButtonElement; // call with anchor HTMLElement | MouseEvent
	let buttonX: HTMLButtonElement; // call with anchor TPosition {x:number, y:number}

	function tooltipOnClose() {
		console.log('[OrmOne] TOOLTIP MADE A CALL TO callMe');
	}
	let ix = 0;
	function showTooltip() {
		const pos = ['above' as TStick, 'right' as TStick, 'below' as TStick, 'left' as TStick];
		// const pos = Array.from(CStick) as TStick[];
		tooltip.showTooltip(
			buttonEl,
			`some test message,to be shown - ${pos[ix]}`,
			0,
			pos[ix] as TStick,
			{
				color: 'crimson',
				backgroundColor: '#fff0f0',
				border: '1px solid crimson',
			},
			tooltipOnClose
		);

		ix = (ix + 1) % pos.length;
	}
	function showTooltipX() {
		tooltip.showTooltip(
			{ x: 450, y: 200 },
			'This is positional,message to be displayed,at point {450x200}',
			0,
			'below',
			{
				color: 'crimson',
				backgroundColor: 'cornsilk',
				border: '1px solid red',
			},
			tooltipOnClose
		);
	}
	function toggleActive() {
		isActive = isActive ? false : true;
	}
</script>

<div class="main">
	<p onclick={toggleActive} aria-hidden={true} style="cursor:pointer">toggle isActive {isActive}</p>
	<CRModelsHandler {models} bind:selectedModels bind:isLoading {userRoles}></CRModelsHandler>
	<button bind:this={buttonEl} onclick={showTooltip} class="show-tooltip">show tooltip</button>
	<button bind:this={buttonX} onclick={showTooltipX} class="show-tooltip-x">show tooltip x</button>
	<button bind:this={btn1} class="button-1" onclick={show1}>Tooltip 1</button>
	<button bind:this={btn2} class="button-2" onclick={show2}>Tooltip 2</button>
	<button onclick={showBoth}>Show both</button>
	<CRReactiveTooltip bind:this={tooltip}></CRReactiveTooltip>
</div>

<style lang="scss">
	.main {
		position: relative;
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
	.show-tooltip {
		position: absolute;
		margin: 5rem 0 0 30rem;
	}
	.show-tooltip-x {
		position: absolute;
		margin: 8rem 0 0 30rem;
	}
	.button-1,
	.button-2 {
		position: absolute;
		margin: 12rem 0 0 20rem;
	}
	.button-2 {
		margin: 12rem 0 0 27rem;
	}
</style>
