<!--
@component
  This component displays prisma model fields with types and prisma attributes.
  When field is hovered and is acceptable as UI data entry field id displays
  as a tooltip a radio button block with labels: Login,Register,Both for
  user to select which new model to get the field or a 'not data entry field' otherwise.
  A popup action on field-hover calls triggerCallback bound to parent isAcceptable
  function with the MouseEvent argument to set what markup from radioGroupEl should
  be displayes as a tooltip.
  This component uses only the following  parameters for popup action
    content: radioGroupEl,
    trigger: 'hover',
    triggerCallback: isAcceptable,
    onItemClick: radioLRBSelected
-->

<script lang="ts">
	import { popup } from './popup';
	let showingData = $state(false);
	let radioGroupEl: HTMLDivElement;
	const notAcceptable = new Set(['createdAt', 'todos', 'profile', 'user', 'posts']);
	function radioLRBSelected(e: MouseEvent) {
		console.log((e.target as HTMLElement).innerText);
	}
	function isAcceptable(e: MouseEvent) {
		const fieldName = (e.target as HTMLElement).innerText.split(':')[0];
		showingData = !notAcceptable.has(fieldName);
		console.log(fieldName, showingData);
		// return showingData; // for debugging
	}
</script>

<!-- popup action -- radio button group 
  hidden class is initially set to preven HTML to displays it
  before popup action is activated, which immediatelly toggle it 
  so it could be available for rendering 
-->
<div class="radio-wrapper hidden" bind:this={radioGroupEl}>
	{#if showingData}
		<p><input type="radio" name="LRB" value="L" />Login</p>
		<p><input type="radio" name="LRB" value="R" />Register</p>
		<p><input type="radio" name="LRB" value="LR" />Both</p>
	{:else}
		<p>not data-entry field</p>
	{/if}
</div>
<!-- <div class="list-container"> -->
<div
	class="to-add-where"
	use:popup={{
		content: radioGroupEl,
		trigger: 'hover',
		triggerCallback: isAcceptable,
		radioGroupClass: 'radio-wrapper',
		containerClass: 'list-container',
		onItemClick: radioLRBSelected,
	}}
>
	<p>firstName: string</p>
	<p>lastName: string</p>
	<p>updatedAt: Date</p>
	<p>role: Role</p>
	<p>user: User</p>
	<p>posts: Post[]</p>
	<p>todos: Todo[]</p>
	<p>createdAt: Date</p>
	<p>profile: Profile</p>
	<p>passwordHash: string</p>
</div>

<!-- </div> -->

<style lang="scss">
	.list-container {
		--back-color: skyblue;
		--hover-color: red;

		position: relative;
		margin-left: 3rem;
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
	}
	.to-add-where {
		position: relative;
		display: flex;
		flex-direction: column;
		width: max-content;
		height: auto;
		padding: 2px 1rem 2px 1rem;
		border: 1px solid gray;
		border-radius: 6px;
		opacity: var(--opacity);
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		margin-left: 2rem;
		transition: opacity ease 1s;
		cursor: default;
		p {
			color: navy;
			margin: 0;
			padding: 3px 0;
			&:first-of-type {
				margin-top: 5px;
			}
			&:last-of-type {
				margin-bottom: 1rem;
			}
			:hover {
				background-color: cornsilk;
			}
		}
	}
	.radio-wrapper {
		justify-content: center;
		align-items: center;
		display: flex;
		flex-direction: row;
		width: max-content;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
		padding: 3px 0.5rem;
		outline: 2rem solid transparent;

		label,
		input,
		p {
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
	.not-data-entry {
		padding: 2px -0.5rem;
		border-radius: 5px;
		color: var(--candidate-color);
		background-color: var(--candidate-bg-color);
	}
	.hidden {
		display: none;
	}
</style>
