<script lang="ts">
	interface DetailItem {
		id: string;
		summary: string;
		className: string;
		bindEl?: HTMLDetailsElement;
		status?: 'pending' | 'running' | 'success' | 'error';
		message?: string;
	}

	let detailsList: DetailItem[] = $state([
		{ id: 'node-modules', summary: 'Node Modules', className: 'node-modules' },
		{ id: 'dependencies', summary: 'Dependencies', className: 'dependencies' },
		{ id: 'install-log', summary: 'Install Log', className: 'install-log' },
	]);

	// Exposed to parent for server-driven control
	export function openSection(sectionId: string, status?: DetailItem['status'], message?: string) {
		const item = detailsList.find((d) => d.id === sectionId);
		if (!item) return;

		if (status) item.status = status;
		if (message) item.message = message;

		// Close all, open only the target
		detailsList.forEach((d) => {
			if (d.bindEl) {
				d.bindEl.open = d.id === sectionId;
			}
		});

		// Auto-scroll to opened section
		setTimeout(() => {
			item.bindEl?.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
			});
		}, 100);
	}

	function handleToggle(e: Event, currentItem: DetailItem) {
		const target = e.currentTarget as HTMLDetailsElement;
		if (!target.open) return;

		detailsList.forEach((item) => {
			if (item.bindEl && item.bindEl !== target) {
				item.bindEl.open = false;
			}
		});
	}
	function makeElement(content: string) {
		const p = document.createElement('p');
		Object.assign(p.style, { padding: 0, margin: 0 });
		p.innerText = content;
		return p;
	}
</script>

{#each detailsList as det (det.id)}
	<details bind:this={det.bindEl} class={det.className} onclick={(e) => handleToggle(e, det)} aria-hidden={true}>
		<summary>
			{det.summary}
			{#if det.status}
				<span class="status-badge" data-status={det.status}>
					{det.message || det.status}
				</span>
			{/if}
		</summary>

		<div class="details-content">
			{makeElement('No detailed information yet')}
		</div>
	</details>
{/each}

<style lang="scss">
	/* Same beautiful styles as before */
	details {
		position: relative;
		z-index: 1;
		margin-bottom: 10px;
		border-radius: 8px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;

		&[open] {
			z-index: 30;
			margin-bottom: 18px;
			box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
		}

		&[open] > .details-content {
			animation: detailsOpen 0.3s ease forwards;
		}
	}

	summary {
		padding: 14px 18px;
		cursor: pointer;
		font-weight: 600;
		background-color: #1f1f1f;
		border: 1px solid #333;
		border-radius: 8px;
		list-style: none;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	summary::-webkit-details-marker {
		display: none;
	}

	.status-badge {
		font-size: 0.8rem;
		padding: 2px 10px;
		border-radius: 9999px;
		font-weight: 500;

		&[data-status='running'] {
			background: #2563eb;
			color: white;
		}
		&[data-status='success'] {
			background: #16a34a;
			color: white;
		}
		&[data-status='error'] {
			background: #dc2626;
			color: white;
		}
		&[data-status='pending'] {
			background: #6b7280;
			color: white;
		}
	}

	.details-content {
		padding: 18px;
		background-color: #252526;
		border: 1px solid #333;
		border-top: none;
		border-bottom-left-radius: 8px;
		border-bottom-right-radius: 8px;
	}

	@keyframes detailsOpen {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
