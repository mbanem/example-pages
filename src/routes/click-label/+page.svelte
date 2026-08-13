<script lang="ts">
	const setCSSValue = (varName: string, value: string, priority: string = null) => {
		try {
			if (browser) {
				const root = document.querySelector(':root') as Node;
				if (root) {
					root.style.setProperty(varName, value, priority);
				}
			}
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log('setCSSValue', msg);
		}
	};
	let isChecked = $state(false);
	setCSSValue('--label', 'clickable line for adding Login model');
</script>

{#snippet extraPageToggle()}
	<label class="custom-toggler">
		<input type="checkbox" style="opacity:0" bind:checked={isChecked} />
		<div class="toggler"></div>
	</label>
	<style>
		:root {
			--label: 'clickable line for adding Login model'; // only constant literal; 
		}
		.custom-toggler .toggler::after {
			content: 'clickable line for adding Login model';
			color: navy;
		}
		.custom-toggler input:checked + .toggler::after {
			color: tomato;
		}
	</style>
{/snippet}
{@render extraPageToggle()}
<p>checked {isChecked}</p>
