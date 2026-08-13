<script lang="ts">
	let t = true;
	function toggle() {
		(document.querySelectorAll('.x') as unknown as Array<HTMLInputElement>).forEach((el) => {
			el.checked = t;
		});
		t = !t;
	}
</script>

<input type="checkbox" class="x" />
<input type="checkbox" class="x" />
<input type="checkbox" class="x" />
<input type="checkbox" class="x" />
<button onclick={toggle}>test</button>
