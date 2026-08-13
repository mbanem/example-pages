<script module lang="ts">
	// import { createGlobalEventHandler, type EType } from './grok-event-handler';
	// Theme type & state
	let isDark: boolean = $state(false); // Svelte 5 runes syntax
	export function isDark_() {
		return isDark;
	}
	export function getIcon() {
		return isDark_() ? '☀️' : '🌙';
	}
	let reportClicksEl: HTMLDivElement | null = null;
	let grid: HTMLDivElement | null = null;
	const colors = ['violet', 'tomato', 'blue', 'green', 'navy'];
	// export const globalEH = createGlobalEventHandler();
	export function toggleColorHandler(e: EType) {
		const el = e.target as HTMLElement;
		const style = el.style;
		style.color = style.color === 'red' ? 'green' : 'red';
		console.log('style.color', style.color);

		const column = Number(el.parentElement?.dataset.column);
		const color = colors[column];

		const scroll = (el: HTMLDivElement) => {
			const els = el.children;
			const max = 50;
			if (els.length > max) {
				for (let i = 0; i < max / 2; i++) {
					(els[0] as HTMLElement).remove(); // always delete the top one
				}
			}
			// count = els.length;
			if (el.offsetHeight + el.scrollTop > el.getBoundingClientRect().height - 20) {
				setTimeout(() => {
					el.scrollTo(0, el.scrollHeight);
				}, 0);
			}
		};
		let header = ((grid as HTMLElement).children[column] as HTMLElement).innerText;
		// const firstChild = (coll.[column][1] as HTMLElement)
		// let header = ([...Object.entries((grid as HTMLElement).children)][column][1] as HTMLElement).innerText;
		header = header
			.replace(/(no)/, `<span style='color:${color};'>$1</span>`)
			.replace(/(all)/, `<span style='color:${color};'>$1</span>`);

		// array of all function names on this page
		// const fNames = new Error().stack?.match(/^([^@]+)/gm);
		// console.log(fNames);
		if (reportClicksEl) {
			reportClicksEl.innerHTML += `<p>[${header}]: <span style='color:${color}'>${e.type}</span>Handler</p>`;
			scroll(reportClicksEl);
		}
	}
</script>

<script lang="ts">
	import { resolve } from '$app/paths';

	import { onMount } from 'svelte';
	// import { afterNavigate } from '$app/navigation';

	onMount(() => {
		// console.log('globalEH',globalEH)
		reportClicksEl = document.querySelector('.report-clicks') as HTMLDivElement;
		// afterNavigate(() => {
		// 	// Small delay because DOM may still be updating
		// 	setTimeout(() => globalEH.setup(document.body), 20);
		// });

		// return () => {
		// 	// unsubscribe();
		// 	globalEH.destroy();
		// };
	});

	// -------- toggle theme begin ---------
	import { browser } from '$app/environment';

	let mounted = $state(false);

	// Get saved preference or system preference
	function getInitialTheme(): boolean {
		if (!browser) {
			return document.documentElement.classList.contains('dark');
		}

		const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
		if (saved) return saved === 'dark';

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? true : false;
	}

	// Apply theme to document
	function applyTheme(ld: boolean) {
		document.documentElement.classList.remove(ld ? 'light' : 'dark');
		document.documentElement.classList.add(ld ? 'dark' : 'light');
	}

	// Toggle theme
	function toggleTheme() {
		isDark = !isDark;
		localStorage.setItem('theme', isDark ? 'dark' : 'light');
		applyTheme(isDark);
	}

	// Initialize on client
	onMount(() => {
		isDark = getInitialTheme();
		// toggleTheme(isDark);
		applyTheme(isDark);
		mounted = true;
	});

	// Listen for system theme changes
	$effect(() => {
		if (!browser || !mounted) return;
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			// Only auto-change if user hasn't manually selected a theme
			if (!localStorage.getItem('theme')) {
				isDark = localStorage.getItem('theme') === 'true';
				applyTheme(isDark);
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});
	// -------- toggle theme end ---------

	let { children } = $props();
</script>

<main class="theme-container">
	<div class="nav-bar">
		<a href={resolve('/weak-map')}>Weak Map</a>
		<a href={resolve('/crud-support')}>CRUD Support</a>
		<a href={resolve('/static-class-model')}>Static Class Model</a>
		<a href={resolve('/sort-record')}>Sort Record</a>
		<a href={resolve('/regex-model')}>RegExp Model</a>
		<a href={resolve('/handle-model')}>Handle Model</a>
		<a href={resolve('/page-router')}>Dyn Page Loader</a>
		<!-- <a href={resolve('/types')}>Types</a>
		<a href={resolve('/parse-prisma')}>Parse Prisma</a>
		<a href={resolve('/dots-on-click')}>Dots on Click</a>
		<a href={resolve('/boundary')}>Boundary</a>
		<a href={resolve('/drag-drop')}>Drag-Drop</a> -->
		<a href={resolve('/OrmOne')}>OrmOne</a>
		<a href={resolve('/OrmTwo')}>OrmTwo</a>
		<a href={resolve('/OrmThree')}>OrmThree</a>
		<a href={resolve('/toggle-theme')}>Toggle Theme</a>
		<a href={resolve('/grok-drag-drop')}>Grok Drag-Drop</a>

		<a href={resolve('/')}>Home</a>
		<p onclick={toggleTheme} class="theme-icon" aria-hidden={true}>
			{getIcon()}
		</p>
	</div>
	{@render children()}
</main>

<style lang="scss">
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box; /* Another common reset property */
	}
	.nav-bar {
		padding: 0 0 5px 0;
		margin: 0 0 5px 0;
	}
	a {
		display: inline-block;
		// border: 1px solid gray;
		border-radius: 5px;
		outline: none;
		padding: 3px 0.5rem;
		color: navy;
		background-color: skyblue;
		text-decoration: none;
		text-align: center;
		user-select: none;
		cursor: pointer;

		&:hover,
		&:focus-visible {
			color: blue;
		}

		&:active {
			color: tomato;
		}
	}
	/*  applying theme  */

	.theme-container {
		height: 98vh;
		width: 98vw;
		background: var(--bg);
		color: var(--text);
		margin: 0;
		padding: 0;
		transition:
			background 0.4s ease,
			color 0.4s ease;
	}
	.theme-icon {
		display: inline-block;
		padding: 0;
		margin: 0;
		height: 25px;
		background-color: var(--btn-bg);
		outline: none;
		border-radius: 5px;
		cursor: pointer;
	}
</style>
