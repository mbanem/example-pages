<script lang="ts">
	import { tooltipRBBlock } from './tooltipRBBlock';
	import { contextMenu } from './context-menu';
	import { dropdown } from './drop-down';

	// contextMenuEl is used in two cases as only one is active at a time
	let contextMenuEl: HTMLDivElement; // not $state() squiggle
	let contextMenuEl2: HTMLDivElement; // not $state() squiggle
	let dropdownMenuEl: HTMLDivElement; // not $state() squiggle

	// radio button uses popup hover action wjich calls onItemHover to decide
	// whether to show radio buttons or 'not data entry field' so user has no
	// confusion about why no radio buttons are shown for some fields
	let isDataEntry = $state(true);
	const noDataEntry = new Set(['todos', 'profile', 'posts', 'createdAt', 'blogs']);
	function onItemHover(e: MouseEvent) {
		const fieldName = (e.target as HTMLElement).innerText.split(':')[0];
		isDataEntry = !noDataEntry.has(fieldName);
	}
	// function onItemHover2(e: MouseEvent) {
	// 	const fieldName = (e.target as HTMLElement).innerText.split(':')[0];
	// 	isDataEntry = !noDataEntry.has(fieldName);
	// }
	// when radio button is clicked we want to know which field
	// it is for and to which model(s) to add it
	const fnm: Record<string, string> = {}; // {fieldName, model}

	// this function extracts model from radio button block wrapped with a
	// <label><radio button>model</label>
	// or a span as <radio button><span>model</span>
	function radioLRBSelected(e: MouseEvent, hoveringEl?: HTMLElement) {
		fnm.fieldName = hoveringEl?.innerText as string;
		const el = e.target as HTMLElement;
		// }
		if ((el?.innerText as string) === '') {
			fnm.model = (el?.nextElementSibling as HTMLElement).innerText;
		} else {
			fnm.model = el?.innerText as string;
		}
		console.log('fnm', fnm);
	}
	// function radioLRBSelected2(e: MouseEvent, hoveringEl?: HTMLElement) {
	// 	fnm.fieldName = hoveringEl?.innerText as string;
	// 	const el = e.target as HTMLElement;
	// 	// }
	// 	if ((el?.innerText as string) === '') {
	// 		fnm.model = (el?.nextElementSibling as HTMLElement).innerText;
	// 	} else {
	// 		fnm.model = el?.innerText as string;
	// 	}
	// 	console.log('fnm', fnm);
	// }

	// dropdown action callback when dropdown item is clicked we want to know
	// which item is clicked to perform some action
	function dropdownSelected(e: MouseEvent) {
		console.log('callbackdropdownSelected', (e.target as HTMLElement).innerText);
	}

	// used as a callback for two different context menus jets for testing and not for
	// production as it is not clear which menu item is clicked as they have same items
	function itemCallback(e: MouseEvent) {
		console.log('itemCallback', (e.target as HTMLElement).innerText);
	}

	function onPopupClick(e: MouseEvent) {
		console.log('onPoppupClick', (e.target as HTMLElement).innerText);
	}

	function improvedCallback(e: MouseEvent) {
		console.log('improvedCallback', (e.target as HTMLElement).innerText);
	}
</script>

<div class="radio-wrapper hidden" bind:this={contextMenuEl}>
	{#if isDataEntry}
		<input type="radio" name="LRB" value="L" /><span>Login</span>
		<input type="radio" name="LRB" value="R" /><span>Register</span>
		<input type="radio" name="LRB" value="LR" /><span>Both</span>
	{:else}
		<span class="not-data-entry">not data-entry field</span>
	{/if}
</div>
<details style="margin-left: 5rem;">
	<summary class="summary">data models one</summary>
	<div class="list-container">
		<div
			class="to-add-where"
			use:tooltipRBBlock={{
				contentEl: contextMenuEl,
				trigger: 'hover',
				onItemHover: onItemHover,
				onItemCallback: radioLRBSelected,
			}}
		>
			<p>firstName: string</p>
			<p>lastName: string</p>
			<p>updatedAt: Date</p>
			<p>role: Role</p>
			<p>passwordHash: string</p>
			<p>todos: Todo[]</p>
			<p>profile: Profile</p>
			<p>posts: Posts</p>
			<p>createdAt: Date</p>
			<p>blogs: Blogs[]</p>
		</div>
	</div>
</details>
<div class="radio-wrapper hidden" bind:this={contextMenuEl2}>
	{#if isDataEntry}
		<input type="radio" name="LRB" value="L" /><span>Login</span>
		<input type="radio" name="LRB" value="R" /><span>Register</span>
		<input type="radio" name="LRB" value="LR" /><span>Both</span>
	{:else}
		<span class="not-data-entry">not data-entry field</span>
	{/if}
</div>
<details style="margin-left: 5rem">
	<summary class="summary">data models two</summary>
	<div class="list-container" style="margin-left: 10rem">
		<div
			class="to-add-where"
			use:tooltipRBBlock={{
				contentEl: contextMenuEl,
				trigger: 'hover',
				onItemHover: onItemHover,
				onItemCallback: radioLRBSelected,
			}}
		>
			<p>firstName: stringx</p>
			<p>lastName: stringx</p>
			<p>updatedAt: Datex</p>
			<p>role: Rolex</p>
			<p>passwordHash: stringx</p>
			<p>todos: Todo[]x</p>
			<p>profile: Profilex</p>
			<p>posts: Postsx</p>
			<p>createdAt: Datex</p>
			<p>blogs: Blogs[]x</p>
		</div>
	</div>
</details>
<!-- context menu action -- hidden used until action kicks in and toggle it-->

<div bind:this={contextMenuEl} class="context-menu hidden">
	<p>Edit</p>
	<p>Transport</p>
	<p>Delete</p>
</div>
<div class="context-menu-area" use:contextMenu={{ contentEl: contextMenuEl, onItemCallback: itemCallback }}>
	contextMenu Right click anywhere
</div>

<!-- drop down action  -- hidden used until action kicks in and toggle it-->

<div class="dropdown-menu" use:dropdown={{ contentEl: dropdownMenuEl, onItemCallback: dropdownSelected }}>
	Dropdown Menu
	<!-- hidden class is necessary to prevent rendering markup
			of displaying dropdown-items as the dropdown component 
			will remove hidden class when it starts and use opacity 
			to toggle items visibility
	-->
	<div bind:this={dropdownMenuEl} class="dropdown-items hidden">
		<p>Profile</p>
		<p>Settings</p>
		<p>Logout</p>
	</div>
</div>

<!-- using improved contMenu -->
<div class="context-menu-area" use:contextMenu={{ contentEl: contextMenuEl, onItemCallback: improvedCallback }}>
	Improved contextMenu Right click
	<div bind:this={contextMenuEl} class="context-menu hidden">
		<span>Edit</span>
		<span>Duplicate</span>
		<span>Delete</span>
	</div>
</div>

<!-- using popup action TODO mouse out of container hide context menu -->

<div
	class="popup-wrapper"
	use:contextMenu={{
		contentEl: contextMenuEl,
		onItemCallback: onPopupClick,
	}}
>
	Right click contextMenu action
	<div bind:this={contextMenuEl} class="popupMenu hidden">
		<p data-item data-action="edit">Popup Edit</p>
		<p data-item data-action="delete">Popup Delete</p>
	</div>
</div>

<style lang="scss">
	:root {
		--hover-color: navy;
		--hover-off-color: navy;
	}
	/* test */
	.context-menu-area {
		display: flex;
		justify-content: center;
		align-items: center;
		width: max-content;
		padding: 1px 1rem;
		height: 4rem;
		/* padding: 1rem; */
		margin: 1rem 0 0 5rem;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		border: 1px solid lightgray;
		border-radius: 5px;
		cursor: default !important;
	}
	.summary {
		cursor: pointer;
		// list-style: none;
		width: max-content;
		padding: 4px 1rem;
		border: 1px solid lightgray;
		border-radius: 5px;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
	}
	.context-menu {
		position: relative;
		background: white;
		border: 1px solid #ccc;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		width: max-content;
		// padding: 0 0.5rem;
		cursor: defaul !important;
		& > * {
			display: block;
			color: blue;
			cursor: inherit !important;
			padding: 1px 0.5rem;
			margin: 0;
			border: none;
			transition: background 0.3s;
			&:hover {
				/* to strech bg color container parent .ctx-menu-item
				should not have padding to cut the strech
				*/
				background-color: cornsilk;
				/* without this background-color will not stretch */
				padding: 1px 0.5rem;
				cursor: pointer;
			}
		}
	}
	.not-data-entry {
		position: absolute;
		top: -0.6rem;
		left: 0;
		color: tomato;
		width: max-content;
		border: 1px solid lightgray;
		border-radius: 5px;
		padding: 1px 1rem;
		background-color: white;
	}
	.dropdown-menu {
		position: relative !important;
		color: var(--candidate-color);
		height: 1.5rem;
		background-color: var(--candidate-bg-color);
		border: 1px solid gray;
		border-radius: 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		width: 8rem;
		text-align: center;
		cursor: pointer;
		margin-left: 5rem;

		.dropdown-items {
			margin-top: 0.4rem;
			// height: 1rem;
			width: 100%;
			border: 1px solid lightgray;
			border-radius: 4px;
			background: white;
			// z-index: 1000;
			p {
				// position: absolute !important;
				// top: 6px;
				// left: 0;
				color: var(--candidate-color);
				background-color: var(--candidate-bg-color);
				cursor: inherit !important;
				width: calc(100% - 0.7rem);
				padding-left: 0.5rem;
				margin: 0;
				height: 1.3rem;
				text-align: left;
				:first-of-type {
					border-top-left-radius: 4px;
					border-top-right-radius: 4px;
				}
				:last-of-type {
					border-bottom-left-radius: 4px;
					border-bottom-right-radius: 4px;
				}
				border-radius: 4px;
				transition: background 0.5s;

				&:hover {
					/* to strech bg color container parent .ctx-menu-item
						should not have padding to cut the strech
						*/
					background-color: cornsilk;
					cursor: pointer;
				}
			}
		}
	}
	/* send CSS class names to contMenu action
		as actions are in the app scope and can
		access classes by name
	*/
	.ctx-menu-parent {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 8rem;
		height: 4rem;
		border: 1px solid lightgray;
		border-radius: 5px;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		margin: 1rem 0 0 2rem;
		cursor: default;
	}

	.ctx-menu-item {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		cursor: default !important;
		border: 1px solid gray;
		border-radius: 4px;
		background: white;
		p {
			color: blue;
			cursor: default !important;
			padding: 1px 5px;
			margin: 0;
			border: none;
			transition: background 0.3s;
			&:hover {
				/* to strech bg color container .ctx-menu-item
				should not have padding to cut the strech
				*/
				background-color: cornsilk;
				cursor: pointer;
			}
		}
	}

	.popupMenu {
		height: auto;
		border: 1px solid gray;
		border-radius: 5px;
		color: navy;
		cursor: default !important;
		p {
			color: blue;
			width: inherit;
			padding: 0;
			margin: 0;
			padding: 1px 5px;
			cursor: inherit !important;
			background-color: white;
			&:first-of-type {
				margin-top: 6px;
			}
			&:last-of-type {
				margin-bottom: 6px;
			}
			&:hover {
				cursor: pointer;
				background-color: cornsilk;
			}
		}
	}
	.popup-wrapper {
		display: flex;
		justify-content: center;
		align-items: center;
		width: max-content;
		padding: 4px 1rem;
		margin: 1rem 0 0 5rem;
		height: 3rem;
		/* padding: 5px 1rem; */
		border: 1px solid gray;
		border-radius: 5px;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		cursor: default !important;
	}
	/* 
		list container firstName, lastName,...
	*/
	.list-container,
	.list-container2 {
		--back-color: skyblue;
		/* --hover-color: red; */

		position: relative;
		margin: 1rem 0 0 3rem;
		width: max-content;
		padding: 0;
		background-color: transparent;
		cursor: default;
		p {
			display: inline-block;
			width: max-content;
			padding: 1px 0.5rem;
			margin: 0;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			&:first-child {
				margin-top: 0.2rem;
			}
		}
		.to-add-where,
		.to-add-where2 {
			position: relative;
			display: flex;
			flex-direction: column;
			/* width: max-content; */
			height: auto;
			padding: 0; /*1px 0.4rem 1rem 0.1rem;*/
			/* border: 1px solid gray; */
			opacity: var(--opacity);
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			p {
				color: var(--candidate--color);
				background-color: var(--candidate-bg-color);
			}
			transition: opacity ease 1s;
		}
	}
	.radio-wrapper {
		justify-content: center;
		align-items: center;
		display: flex;
		flex-direction: row;
		width: max-content;
		color: var(--candidate-color);
		border: 1px solid lightgray;
		border-radius: 5px;
		background-color: var(--candidate-bg-color);
		padding: 3px 0.5rem;
		outline: 1rem solid transparent;

		label,
		input {
			display: inline;
			height: auto;
			cursor: pointer;
			background-color: rgb(128, 204, 234);
			&:first-of-type {
				padding-left: 0.2rem;
			}
			&:last-of-type {
				padding-right: 0.5rem !important;
			}
			border-radius: 5px;
			label {
				width: max-content;
				padding: 0;
				margin: 0;
			}
		}
	}
	.hidden {
		display: none;
	}
</style>
