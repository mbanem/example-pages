<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	// Theme type & state
	type Theme = 'light' | 'dark';

	let currentTheme: Theme = $state('dark'); // Svelte 5 runes syntax
	let mounted = $state(false);

	// Get saved preference or system preference
	function getInitialTheme(): Theme {
		if (!browser) return 'dark';

		const saved = localStorage.getItem('theme') as Theme | null;
		if (saved) return saved;

		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}

	// Apply theme to document
	function applyTheme(theme: Theme) {
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}

	// Toggle theme
	function toggleTheme() {
		currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
		localStorage.setItem('theme', currentTheme);
		applyTheme(currentTheme);
	}

	// Initialize on client
	onMount(() => {
		currentTheme = getInitialTheme();
		applyTheme(currentTheme);
		mounted = true;
	});

	// Listen for system theme changes
	$effect(() => {
		if (!browser || !mounted) return;
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			// Only auto-change if user hasn't manually selected a theme
			if (!localStorage.getItem('theme')) {
				currentTheme = e.matches ? 'dark' : 'light';
				applyTheme(currentTheme);
			}
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});
	function getIcon() {
		return currentTheme === 'dark' ? '☀️' : '🌙';
	}
</script>

<svelte:head>
	<title>Theme Toggle Demo</title>
</svelte:head>

<main class="theme-container">
	<h1>Svelte 5 Theme Toggle</h1>

	<div class="content">
		<p>Current theme: <strong>{currentTheme}</strong></p>

		<button onclick={toggleTheme} class="button">
			{getIcon()}
		</button>
	</div>

	<p class="hint">
		Preference is saved in localStorage<br />
		Also respects system preference on first visit
	</p>
</main>

<style>
	:root {
		--bg: #f8f9fa;
		--text: #212529;
		--card: #ffffff;
		--btn-bg: #121212;
		--btn-text: white;
	}
	:global(.dark) {
		--bg: #121212;
		--text: #e0e0e0;
		--card: #1e1e1e;
		--btn-bg: #e0e0e0;
		--btn-text: white;
	}
	.theme-container {
		min-height: 100vh;
		background: var(--bg);
		color: var(--text);
		transition:
			background 0.4s ease,
			color 0.4s ease;
		display: grid;
		place-items: center;
		padding: 2rem;
	}
	h1 {
		margin-bottom: 2rem;
		font-size: 2.8rem;
		text-align: center;
	}
	.content {
		background: var(--card);
		padding: 3rem 4rem;
		border-radius: 16px;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
		text-align: center;
		transition: transform 0.2s ease;
	}
	.content:hover {
		transform: translateY(-5px);
	}
	.theme-btn {
		margin-top: 1.5rem;
		padding: 0.9rem 2rem;
		font-size: 1.2rem;
		border: none;
		border-radius: 50px;
		background: var(--btn-bg);
		color: var(--btn-text);
		cursor: pointer;
		transition: all 0.25s ease;
	}
	.theme-btn:hover {
		opacity: 0.9;
		transform: scale(1.05);
	}
	.hint {
		margin-top: 3rem;
		opacity: 0.6;
		font-size: 0.95rem;
		text-align: center;
	}
	.button {
		background-color: var(--btn-bg);
		outline: none;
		border-radius: 5px;
	}
</style>
