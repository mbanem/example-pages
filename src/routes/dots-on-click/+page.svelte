<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	let msgEl: HTMLParagraphElement | null = null;
	const dots: Array<HTMLElement> = [];
	let clearButtonEl: HTMLButtonElement | null = null;
	let navbar: HTMLDivElement | null = null;
	function getColor() {
		let rgb = `rgb(`;
		[0, 0, 0].forEach((_) => {
			rgb += Math.max(Math.floor(Math.random() * 256), 25) + ',';
		});
		return rgb.slice(0, -1) + ')';
	}
	function mousePosition(event: MouseEvent) {
		if (clearButtonEl?.contains(event.target as HTMLButtonElement)) return;
		if (navbar?.contains(event.target as HTMLButtonElement)) {
			clearDots(event);
			return;
		}

		if (msgEl) {
			msgEl.innerText = `(Mouse(x,y) = (${event.clientX}, ${event.clientY})`;
		}
		const dot = document.createElement('dot');
		dot.innerHTML = `<div class='dot' ></div>`;
		document.body.appendChild(dot);
		dot.style.position = 'absolute';
		dot.style.backgroundColor = getColor();
		dot.style.width = String(Math.max(Math.random() * 60, 5)) + 'px';
		dot.style.height = dot.style.width;
		dot.style.borderRadius = '50%';
		dot.style.top = String(event.clientY) + 'px';
		dot.style.left = String(event.clientX) + 'px';
		dots.push(dot);
	}

	onMount(() => {
		document.addEventListener('click', mousePosition);

		if (browser) {
			msgEl = document.getElementById('msg') as HTMLParagraphElement;
			navbar = document.querySelector('.nav-bar');
		}
		return () => {
			document.removeEventListener('click', mousePosition);
		};
	});
	function clearDots(event: BeforeUnloadEvent) {
		event.preventDefault();
		dots.forEach((dot) => dot.remove());
	}
</script>

<button bind:this={clearButtonEl} onclick={clearDots}>clear dots</button>
<h4>Click on document enywhere to show the point coordinates</h4>
<p id="msg"></p>

<style lang="scss">
	// body {
	// 	position: relative;
	// }
	:global(.dot) {
		position: absolute;
		width: 5px;
		height: 5px;
		border-radius: 50%;
	}
</style>
