<script lang="ts">
	import HoverableDetails from '$lib/components/HoverableDetails.svelte';
	// Collection of summaries keyed by category name (m[0])
	const RX = /^Progress:|\.\.\.\/node_modules\/|dependencies:|devDependencies:|\+ /;
	let progressCollector = $state<Record<string, string[]>>({});

	let activeVideo = $state<string | null>(null);
	function openVideo(videoUrl: string) {
		activeVideo = videoUrl;
	}
	function closeVideo() {
		activeVideo = null;
	}

	function handleMessage(rawLine: string) {
		try {
			const m = RX.exec(rawLine);
			if (!m) {
				console.log('not m');
				return;
			}

			const category = m[0].slice(0, -1); // e.g., 'dependencies'
			// Initialize category entry if it doesn't exist yet
			if (!progressCollector[category]) {
				console.log('make empty progressCollector');
				progressCollector[category] = [];
			}
			progressCollector[category].push(rawLine.slice(10));
			// console.log('handleMessage', rawLine)
			// console.log(progressCollector[category])
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log(msg);
		}
	}
	const lines: string[] = [
		'Progress: resolved 43, reused 0, downloaded 0, added 0',
		'Progress: resolved 44, reused 0, downloaded 0, added 0',
		'Progress: resolved 180, reused 0, downloaded 0, added 0',
		'Progress: resolved 229, reused 0, downloaded 0, added 0',
		'Progress: resolved 232, reused 0, downloaded 0, added 0',
		'Progress: resolved 233, reused 6, downloaded 2, added 2',
		'Progress: resolved 234, reused 0, downloaded 0, added 0',
		'Progress: resolved 236, reused 0, downloaded 0, added 0',
		'Progress: resolved 433, reused 0, downloaded 0, added 0',
	];
	for (let i = 0; i < lines.length; i++) {
		handleMessage(lines[i] as string);
	}
</script>

<!-- Modal Overlay -->
{#if activeVideo}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={closeVideo}>
		<div class="modal-content" onclick={(e) => e.stopPropagation()}>
			<button class="close-btn" onclick={closeVideo}>✕</button>
			<video src={activeVideo} autoplay loop muted controls>
				<track kind="captions" />
			</video>
		</div>
	</div>
{/if}
{#if progressCollector}
	{#each Object.entries(progressCollector) as [category, items] (category)}
		<HoverableDetails summary={category} details={items} colors={{ over: 'green', out: 'blue', headOver: 'blue' }} />
	{/each}
{/if}
<!-- <button onclick={addModuleItem}>add module row</button> -->
<button class="action-link" onclick={() => openVideo(props.crInputVideoUrl)}> see in action </button>

<style lang="scss">
	.modal-backdrop {
		position: fixed;
		top: 0;
		left: 0;
		width: 40vw;
		height: 40vh;
		background: rgba(0, 0, 0, 0.65);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 999;
	}

	.modal-content {
		position: relative;
		background: var(--vscode-editor-background);
		padding: 1rem;
		border-radius: 6px;
		border: 1px solid var(--vscode-widget-border);
		max-width: 80%;
	}

	.close-btn {
		position: absolute;
		top: 0.25rem;
		right: 0.5rem;
		background: transparent;
		border: none;
		color: var(--vscode-foreground);
		font-size: 1.2rem;
		cursor: pointer;
	}
</style>
