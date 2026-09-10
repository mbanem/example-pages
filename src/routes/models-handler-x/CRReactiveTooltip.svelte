<script lang="ts">
	import { tick } from 'svelte';

	type TStick = 'left' | 'right' | 'above' | 'below';
	type TPosition = { x: number; y: number };
	type THovered = MouseEvent | HTMLElement | TPosition;
	type TTimer = ReturnType<typeof setTimeout>;

	// Svelte 5 State Trackers
	let tooltipEl = $state<HTMLElement | undefined>(undefined);
	let anchorRect = $state<DOMRect | TPosition | undefined>(undefined);
	let preferredStick = $state<TStick>('above');
	let userStyles = $state<Record<string, string>>({});
	let timeout = $state(3000);
	let timer: TTimer;
	let onClose: (() => void) | undefined;

	export function isTooltipActive() {
		return tooltipEl !== undefined;
	}

	async function fadeOutAndRemove() {
		if (!tooltipEl) return;
		clearTimeout(timer);
		tooltipEl.style.opacity = '0';
		// tooltipEl.offsetHeight;
		// await tick();
		// await new Promise((resolve) => setTimeout(resolve, 300));
		// await tick();
		tooltipEl.remove();
		// await tick();
		tooltipEl = undefined;
		anchorRect = undefined; // Reset tracking
		// await tick();
	}

	// 1. Isolated core layout position calculator
	function updatePosition() {
		if (!tooltipEl || !anchorRect) return;

		const tooltipRect = tooltipEl.getBoundingClientRect();
		const viewportWidth = document.documentElement.clientWidth;
		const viewportHeight = document.documentElement.clientHeight;

		let x = 0;
		let y = 0;
		const gap = 8;

		if (!('width' in anchorRect) && 'x' in anchorRect && 'y' in anchorRect) {
			x = anchorRect.x + gap;
			y = anchorRect.y + gap;
		} else {
			const rect = anchorRect as DOMRect;
			const baseOrder: TStick[] = ['left', 'above', 'right', 'below'];
			const startIdx = baseOrder.indexOf(preferredStick);
			const reorderedSequence =
				startIdx === -1 ? baseOrder : [...baseOrder.slice(startIdx), ...baseOrder.slice(0, startIdx)];

			let chosenX = rect.left;
			let chosenY = rect.bottom + gap;

			for (const dir of reorderedSequence) {
				let testX = rect.left;
				let testY = rect.top;
				let fits = false;

				switch (dir) {
					case 'right':
						testX = rect.right + gap;
						testY = rect.top;
						fits = viewportWidth - rect.right >= tooltipRect.width + gap;
						break;
					case 'left':
						testX = rect.left - tooltipRect.width - gap;
						testY = rect.top;
						fits = rect.left >= tooltipRect.width + gap;
						break;
					case 'below':
						testX = rect.left + rect.width / 2 - tooltipRect.width / 2;
						testY = rect.bottom + gap;
						fits = viewportHeight - rect.bottom >= tooltipRect.height + gap;
						break;
					case 'above':
						testX = rect.left + rect.width / 2 - tooltipRect.width / 2;
						testY = rect.top - tooltipRect.height - gap;
						fits = rect.top >= tooltipRect.height + gap;
						break;
				}

				if (fits) {
					chosenX = testX;
					chosenY = testY;
					break;
				}
				if (dir === preferredStick) {
					chosenX = testX;
					chosenY = testY;
				}
			}
			x = chosenX;
			y = chosenY;
		}

		// Prevent viewport edge clipping
		x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
		y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

		Object.assign(tooltipEl.style, {
			position: 'fixed',
			top: `${y}px`,
			left: `${x}px`,
			zIndex: '9999',
			borderRadius: '8px',
			border: '1px solid #ccc',
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			fontFamily: 'system-ui, sans-serif',
			fontSize: '14px',
			width: 'auto',
			padding: timeout === 0 ? '12px 32px 8px 12px;' : '12px 12px 8px 12px;',
			// CRITICAL: Added left/top transitions for smooth tracking movement
			transition: 'opacity 0.3s ease, left 0.2s cubic-bezier(0.25, 1, 0.5, 1), top 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
			...userStyles,
		});
	}

	// 2. Svelte 5 Reactive Scroll Tracker
	$effect(() => {
		// Only listen to scrolling if a tooltip is actively mounted
		if (!tooltipEl || !anchorRect) return;

		const handleScroll = () => {
			if (anchorRect && 'left' in anchorRect && !(anchorRect instanceof MouseEvent)) {
				if (tooltipEl) {
					anchorRect = tooltipEl.getBoundingClientRect();
				}
			}
			updatePosition();
		};

		// Passive listener configuration optimizes browser scroll performance
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleScroll, { passive: true });

		// Cleanup prevents memory leaks when the tooltip closes
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleScroll);
		};
	});

	// -------------------- SHOW TOOLTIP --------------------------------------
	/*
		anchor is an HTML element that tooltip should be position arround it
		tooltip is an HTML markup or a CSV string to render <p> from rows
		whentimeout is zero a ❌ is added with onclick listener to hide tooltip
		when callbackOnClose is specified it calls parent to notify of hiding tooltip

	 */
	export async function showTooltip(
		anchor: THovered,
		tooltip: HTMLElement | string,
		timeout_: number = 3000,
		stick: TStick = 'above',
		customStyles: Record<string, string> = {},
		callbackOnClose?: () => void
	) {
		try {
			if (tooltipEl) {
				hideTooltip();
				// tick().then(() => {
				// 	return new Promise((resolve) => setTimeout(resolve, 400));
				// });
			}
			onClose = callbackOnClose;

			timeout = timeout_;
			if (tooltipEl !== undefined) return;

			preferredStick = stick;
			userStyles = customStyles;

			if (typeof tooltip === 'string') {
				tooltipEl = document.createElement('div');
				tooltipEl.innerHTML = tooltip
					.split(/,|\n/)
					.map((part) => part.trim())
					.filter(Boolean)
					.map((part) => `<p style="margin:0;padding:0;line-height:1.4">${part}</p>`)
					.join('');
				tooltipEl.classList.add('dynamic-tooltip');
			} else {
				tooltipEl = tooltip;
			}
			tooltipEl.classList.add('dynamic-tooltip');

			Object.assign(tooltipEl.style, {
				position: 'fixed',
				opacity: '0',
			});

			if (anchor instanceof HTMLElement) {
				anchorRect = anchor.getBoundingClientRect();
			} else if (anchor && 'clientX' in anchor) {
				const el = document.elementFromPoint(anchor.clientX, anchor.clientY) as HTMLElement;
				if (el) {
					anchorRect = el.getBoundingClientRect();
					// }
				}
			} else {
				anchorRect = anchor as TPosition;
			}

			if (timeout === 0) {
				const closeBtn = document.createElement('button');
				closeBtn.innerHTML = '❌';
				closeBtn.setAttribute('aria-label', 'Close');
				Object.assign(closeBtn.style, {
					position: 'absolute',
					bottom: '10px',
					right: '2px',
					background: 'transparent',
					border: 'none',
					cursor: 'pointer',
					fontSize: '14px',
					lineHeight: '1',
					opacity: '0.7',
				});
				closeBtn.onclick = (e: MouseEvent) => {
					e.stopPropagation();
					if (tooltipEl) hideTooltip();
				};
				tooltipEl.style.paddingRight = '26px';
				tooltipEl.appendChild(closeBtn);
			}

			document.body.appendChild(tooltipEl);

			// Initial paint calculation
			updatePosition();

			tooltipEl.offsetHeight; // Reflow
			tooltipEl.style.opacity = '1';

			if (timeout > 0) {
				timer = setTimeout(() => {
					// document.querySelector('.dynamic-tooltip')?.classList.remove('dynamic-tooltip');
					if (tooltipEl) {
						hideTooltip();
					}
				}, timeout);
			}

			return tooltipEl;
		} catch (err: unknown) {
			console.error('showTooltip failed:', err);
		}
	}

	export async function hideTooltip() {
		onClose?.();
		await fadeOutAndRemove();
		await tick();
	}
</script>

<style lang="scss">
	:global(.dynamic-tooltip) {
		padding: 0.5rem 1rem;
		width: max-content;
		p {
			padding: 0.5rem 0 0 1rem;
			margin: 0;
		}
	}
</style>
