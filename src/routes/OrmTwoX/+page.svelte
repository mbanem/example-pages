<script lang="ts">
	import { onMount } from 'svelte';
	// import { type Theme, getInitialTheme } from '$lib/utils/toggle-theme';
	// import { createEventHandler, resolveElement } from './lib/utils'
	import { vscode } from '$lib/utils';

	// type TProps = {
	// 	pageInfo: TToggleFunc;
	// };
	// let { pageInfo = $bindable() }: TProps = $props();
	// let isActive = $state(false);
	// function handlePageInfo() {
	// 	isActive = isActive ? false : true;
	// }
	// pageInfo = handlePageInfo as TToggleFunc;
	function closetheApp() {
		vscode.postMessage({ command: 'close' });
	}
	let msgEl: HTMLParagraphElement;
	let isInstalling = $state(false);
	// function postMessage(command: string, payload?: Payload) {
	// 	vscode.postMessage({ command:, payload });
	// }
	// const eh = createEventHandler()

	// -------- toggle theme begin ---------
	// let currentTheme: Theme = $state('light'); // Svelte 5 runes syntax
	let mounted = $state(false);

	// // Apply theme to document
	// export function applyTheme() {
	// 	document.documentElement.classList.add(currentTheme);
	// }
	// // Toggle theme
	// export function toggleTheme() {
	// 	document.documentElement.classList.remove(currentTheme);
	// 	currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
	// 	localStorage.setItem('theme', currentTheme);
	// 	applyTheme();
	// }

	// TODO Listen for system theme changes -- does not work
	$effect(() => {
		if (!mounted) return;
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		const handleChange = (e: MediaQueryListEvent) => {
			// Only auto-change if user hasn't manually selected a theme
			// if (!localStorage.getItem('theme')) {
			// 	currentTheme = e.matches ? 'dark' : 'light';
			// 	applyTheme();
			// }
		};

		mediaQuery.addEventListener('change', handleChange);
		return () => mediaQuery.removeEventListener('change', handleChange);
	});
	// Get saved preference or system preference
	// function getInitialTheme(): Theme {
	//   // if (!browser) return 'light'

	//   const saved = localStorage.getItem('theme') as Theme | null
	//   if (saved) return saved

	//   return window.matchMedia('(prefers-color-scheme: dark)').matches
	//     ? 'dark'
	//     : 'light'
	// }

	// // Toggle theme
	// function toggleTheme() {
	//   currentTheme = currentTheme === 'dark' ? 'light' : 'dark'
	//   localStorage.setItem('theme', currentTheme)
	//   applyTheme()
	// }
	// -------- toggle theme end ---------
	function prismaPartTwo() {
		isInstalling = !isInstalling;
		postMessage('prismaPartTwo');
	}

	onMount(() => {
		// -------- toggle theme begin ---------
		// currentTheme = getInitialTheme();
		// applyTheme();
		// toggleTheme();
		mounted = true;
		// -------- toggle theme end ---------
		const handler = (event: MessageEvent) => {
			const msg = event.data;
			console.log('[OrmTwo.svelte] got message', msg.command);
			switch (msg.command) {
				case 'prismaInstallStart':
					// msgEl.innerText = 'Background is installing Prisma Part Two...';
					break;

				case 'prismaInstallOutcome':
					// msgEl.innerText = msg.message;
					break;
				default:
					break;
			}
		};
		window.addEventListener('message', handler);

		return () => {
			window.removeEventListener('message', handler);
		};
	});
</script>

<p bind:this={msgEl} class="messages"></p>
<div class="container">
	<h3>Prisma Installation Part Two</h3>

	<pre>
  By selecting the continue button the extension will issue the final commands 
  for installing Prisma ORM; otherwise you can enter the following commands yourself 
  DBNAME="MyDBNAME" # your database name 
  DBOWNER='JohnDoe' # the name of the database owner
  sudo -u postgres psql -c "DROP DATABASE IF EXISTS $DBNAME;" 
  
  createdb "$DBNAME" -U "$DBOWNER" 
  "GRANT ALL ON SCHEMA public TO $DBOWNER; GRANT CONNECT ON DATABASE $DBNAME TO $DBOWNER;" 
  sudo -u postgres psql -d "$DBNAME" -c "GRANT ALL PRIVILEGES ON SCHEMA public TO $DBOWNER; 
  ALTER SCHEMA public OWNER TO $DBOWNER; ALTER DATABASE dbtest OWNER TO $DBOWNER;" 
  sudo -u postgres psql -d "$DBNAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA
  public GRANT ALL ON TABLES TO $DBOWNER; ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO $DBOWNER;"

  pnpx prisma migrate dev --name init  # create first migration (when ready)
  pnpx prisma generate
  
  <!-- <button
      onclick={prismaPartTwo}
      bind:this={installPartTwoBtnEl}> Continue </button><button
      onclick={closeTheApp}
      bind:this={cancelPartTwoBtnEl}>Close</button
    > -->
	</pre>
	<div class="buttons-row">
		<button class="button-install" onclick={prismaPartTwo} style="font-size: 14px !important;cursor:pointer;margin:0'">
			<span class:spinner={isInstalling}></span>
			Continue
		</button>
		<button onclick={closetheApp} class="button-close">close</button>
	</div>
	<p bind:this={msgEl} class="messages"></p>
</div>

<style lang="scss">
	.container {
		height: 98vh;
		width: 98vw;
		// margin: 2rem 0 0 5rem;
		margin: 0;
		padding: 1rem 0 0 2rem;
		// background-color: var(--bg);
		color: var(--text);
	}
	pre {
		color: var(--pre-color);
	}
	.spinner {
		display: inine-block;
		width: 1em;
		height: 1em;
		border: 3px solid #a1c1eb;
		border-top-color: #1b4891;
		border-radius: 50%;
		animation: spin 900ms linear infinite;
	}
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	.buttons-row {
		display: grid;
		grid-template-columns: 5rem 4rem;
		grid-auto-rows: 1.8rem;
		gap: 1rem;
		position: absolute;
		top: 24rem;
		left: 5rem;
		.button-install {
			display: flex;
			display: inline-block;
			flex-shrink: 0;
			// min-width: 0;
			outline: none;
			border: 1px solid gray;
			border-radius: 5px;
			font-weight: 400;
			color: black;
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
