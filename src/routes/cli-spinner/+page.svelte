<!--
@component
-->

<script lang="ts">
	let interval: ReturnType<typeof setInterval>;
	let spin = $state('');
	function cliSpinner(startStop: boolean = true): void {
		if (!startStop) {
			clearInterval(interval);
			return;
		}
		const spinner = ['/', '-', '\\', '|'];
		let i = 0;

		interval = setInterval(() => {
			spin = spinner[i];
			i = (i + 1) % spinner.length;
		}, 200);

		// Stop the spinner after 3 seconds
		setTimeout(() => clearInterval(interval), 3000);
	}

	cliSpinner();
</script>

<div class="main">
	<p>spinner {spin}</p>
</div>

<style lang="scss">
	.main {
		margin: 3rem 0 0 1rem;
		border: 1px solid gray;
		border-radius: 10px;
	}
</style>
