<!--
@component
-->

<script lang="ts">
	let inAction = $state(true);
	let buttonNotAllowed = $state(true);
</script>

<div class="cr-left-column">
	<div class="buttons-row">
		<button
			id="createBtnId"
			style="font-size: 14px !important;cursor:pointer;margin:0'"
			disabled={buttonNotAllowed}
			class:notallowed={buttonNotAllowed}
			aria-hidden={true}
		>
			<span class:spinner={inAction}></span>
			Create CRUD Support
		</button>
		<button class="button-close">close</button>
	</div>
</div>

<style lang="scss">
	.cr-left-column {
		@include container($head: 'Application Settings', $head-color: navy);
		position: relative;
		border: 1px solid gray;
		border-radius: 8px;
		height: 40.2rem;
		width: 30rem;
		padding: 1rem 0 0 0.7rem;
		background-color: var(--panel-bg-color);

		label {
			display: block;
			color: var(--candidate-color);
			cursor: pointer;
		}
		div {
			display: block;
		}
	}
	.buttons-row {
		display: grid;
		grid-template-columns: 10rem 4rem;
		gap: 1rem;
		position: absolute;
		top: 24rem;
		left: 5rem;
		#createBtnId {
			display: flex;
			display: inline-block;
			outline: none;
			border: 1px solid gray;
			border-radius: 5px;
			font-weight: 400;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			width: max-content;
			padding: 2px 1rem 2px 1rem;
			cursor: pointer;
		}
		.button-close {
			display: inline-block;
			outline: none;
			border: 1px solid gray;
			border-radius: 5px;
			font-weight: 400;
			color: var(--candidate-color);
			background-color: var(--candidate-bg-color);
			width: max-content;
			padding: 2px 1rem 2px 1rem;
			cursor: pointer;
		}
	}
</style>
