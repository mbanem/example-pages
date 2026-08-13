<script lang="ts">
	import { onMount } from 'svelte';
	import * as utils from '$lib/utils';
	import CRShowTooltip from '$lib/components/CRShowTooltip.svelte';

	// fake part for Extension
	const vscode = {
		postMessage: (msg: { command: string; payload?: string | object }) => {
			console.log(msg.command, msg.payload);
		},
	};
	function cancelAnyPart() {
		startPartOne();
	}
	// fake part for Extension

	type Tdb = { name: string; owner: string; password: string; host: string; port: string };

	let tt: CRShowTooltip;
	let noPrismaSchema: boolean = true;
	let installPartTwoPending: boolean = false;
	let installPartOneEl: HTMLPreElement;
	let installPartTwoEl: HTMLPreElement;
	let installPartOneBtnEl: HTMLButtonElement;
	let cancelPartOneBtnEl: HTMLButtonElement;
	let sudoName_: string = 'mili';
	let tooltipEl: HTMLDivElement;
	let theStick = $state<TStick>('below');
	const initialTooltip = 'This is a tooltip';
	let theTooltip: HTMLElement | string = initialTooltip;
	const createCyclicPicker = <T,>(items: T[]): (() => T) => {
		let index = 0;
		return function next(): T {
			const item = items[index];
			index = (index + 1) % items.length;
			return item as T;
		};
	};
	const getNextStick = createCyclicPicker<TStick>(['left', 'right', 'middle', 'middle-over-left', 'below']);
	function changeStick() {
		theStick = getNextStick();
		// console.log('theStick', theStick);
	}
	const startPartOne = () => {
		installPartOneBtnEl.innerText = 'Install Prisma ORM';
		installPartOneBtnEl.addEventListener('click', async (_: MouseEvent) => {
			installPartOneBtnEl.innerText = 'installing...';
			await utils.sleep(2500);

			noPrismaSchema = false;
			vscode.postMessage({ command: 'log', payload: 'InstallPartOneBtn clicked' });
			// get dbname, owner and owner password if specified
			try {
				const db: Tdb = {
					name: (document.getElementById('dbNameId') as HTMLInputElement).value,
					owner: (document.getElementById('dbOwnerId') as HTMLInputElement).value,
					password: (document.getElementById('dbOwnerPasswordId') as HTMLInputElement).value,
					host: (document.getElementById('dbHostId') as HTMLInputElement).value,
					port: (document.getElementById('dbPortId') as HTMLInputElement).value,
				};
				vscode.postMessage({ command: 'setDbAndOwner', payload: db });
			} catch (err) {
				const msg = err instanceof Error ? err.message : String(err);
				vscode.postMessage({ command: 'log', payload: 'get db err ' + msg });
			}
			vscode.postMessage({ command: 'installPrismaPartOne' });
			installPartTwoPending = true;
		});

		vscode.postMessage({ command: 'installPrismaPartOne' });
		// installPartOneBtnEl.innerText = 'installing...';
	};

	onMount(() => {
		installPartOneEl = document.getElementById('installPartOneId') as HTMLPreElement;
		installPartTwoEl = document.getElementById('installPartTwoId') as HTMLPreElement;
		// installPartOneEl.classList.remove('hidden');
		installPartOneBtnEl = document.getElementById('installPartOneBtnId') as HTMLButtonElement;
		cancelPartOneBtnEl = document.getElementById('cancelPartOneBtnId') as HTMLButtonElement;
		// rightColumnEl = document.getElementById('rightColumnId');

		cancelPartOneBtnEl.addEventListener('click', cancelAnyPart);
		// fires once so be ready it extension waits for schema and connection
		// if (installPartTwoPending) {
		// 	vscode.postMessage({ command: 'log', payload: 'pending!' });
		// 	installPartTwoBtnEl.addEventListener('click', installPartTwo);
		// 	cancelPartTwoBtnEl.addEventListener('click', cancelAnyPart);
		// }

		if (noPrismaSchema) {
			//startPartOne();
		}
	});
	function handleTooltip(e: MouseEvent) {
		if (e.type === 'mouseenter') {
			// console.log('handleTooltip theStick', theStick);
			tt.showTooltip(e, theTooltip, theStick, { backgroundColor: 'navy', color: 'white' });
		} else if (e.type === 'mouseleave') {
			tt.hideTooltip();
			changeStick();
		}
	}
	function changeTooltip() {
		theTooltip = theTooltip === initialTooltip ? tooltipEl : initialTooltip;
	}
</script>

<CRShowTooltip bind:this={tt} />
<div class="main">
	<button onmouseenter={handleTooltip} onmouseleave={handleTooltip} class="tooltip-button">tooltip</button>

	<button onclick={changeTooltip}>change tooltip</button>
	<button id="installPartOneBtnId" style="margin-left:4rem;">Install Prisma ORM</button><button id="cancelPartOneBtnId">
		Close
	</button>
</div>

<div bind:this={tooltipEl} class="tooltip-block">
	<p>firstName Filip</p>
	<p>lastName Isakovic</p>
</div>

<style lang="scss">
	.main {
		position: relative;
		margin-left: 2rem;
	}
	.tooltip-button {
		margin: 100px 0 0 200px;
	}
	.container {
		@include container($head: 'Database Attributes', $head-color: skyblue);
		padding: 1rem;
	}

	pre {
		grid-column: 1 / span 2;
		text-align: justify;
		font-size: 12px;
		color: var(--pre-color);
	}

	// input[type='text'] {
	// 	width: 18rem;
	// 	height: 20px;
	// 	padding: 6px 0 8px 1rem;
	// 	outline: none;
	// 	font-size: 16px;
	// 	border: 1px solid gray;
	// 	border-radius: 4px;
	// 	outline: 1px solid transparent;
	// 	margin-top: 8px;
	// 	margin-bottom: 10px;
	// }

	// input[type='text']:focus {
	// 	outline: 1px solid gray;
	// }

	// button {
	// 	display: inline-block;
	// 	margin-left: 1rem;
	// 	width: 9rem;
	// 	padding: 2px 1rem;
	// 	text-align: center;
	// 	&:first-child {
	// 		margin-right: 1rem;
	// 	}
	// }

	.dbname-block {
		display: grid;
		grid-template-columns: repeat(3, 12rem);
		column-gap: 0.2rem;
		margin: 0;
		padding: 0;

		label {
			width: 10rem;
			padding: 0;
			margin: 0 1rem 6px 0;
			color: var(--candidate-color);
		}

		input {
			width: 11rem;
			margin: 0;
			padding: 3px 0 3px 0.5rem !important;
			border: 1px solid lightgray;
			border-radius: 3px;

			&:focus {
				outline: 1px solid skyblue;
			}
		}
	}
	.tooltip-block {
		position: absolute;
		opacity: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
		top: 200px;
		left: 200px;
		border: 1px solid gray;
		border-radius: 5px;

		background-color: navy;
		color: yellow;
		p {
			padding: 0;
			margin: 0;

			&:first-child {
				padding: 5px 0.5rem 0 0.5rem;
			}
			&:last-child {
				padding: 0 0.5rem 5px 0.5rem;
			}
		}
	}
</style>
