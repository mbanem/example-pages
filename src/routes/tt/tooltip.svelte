<script lang="ts">
	import { tick } from 'svelte';

	type TPos = { x: number; y: number };
	type THovered = MouseEvent | HTMLElement | TPos;

	let tooltipEl = $state<HTMLElement | undefined>(undefined);
	let timeout = $state(3000);

	export function isTooltipActive() {
		return tooltipEl !== undefined;
	}

	async function fadeOutAndRemove(el: HTMLElement) {
		el.style.opacity = '0';
		// Wait for the 0.3s CSS opacity transition to complete smoothly
		await new Promise((resolve) => setTimeout(resolve, 300));
		await tick();
		el.remove();
		await tick();
		tooltipEl = undefined;
	}

	function setTooltipPosition(hoverRectPos: DOMRect | TPos, stick: TStick, customStyles: Record<string, string>) {
		if (!tooltipEl) {
			return;
		}

		const tooltipRect = tooltipEl.getBoundingClientRect();
		const viewportWidth = document.documentElement.clientWidth;
		const viewportHeight = document.documentElement.clientHeight;

		let x = 0;
		let y = 0;
		const gap = 8;

		// Handle raw mouse coordinate positioning directly ('over' mode or pure TPos)
		if ('width' in hoverRectPos) {
			// Handle DOM Element Anchor calculations (Always using screen coordinates for fixed alignment)
			const hoverRect = hoverRectPos as DOMRect;

			x = hoverRect.left; // top-left hovered element position
			y = hoverRect.top - gap;

			// Define cyclic fallback evaluation path
			const baseOrder: TStick[] = ['left', 'above', 'right', 'below'];
			const ix = baseOrder.indexOf(stick);
			const sticks = [...baseOrder.slice(ix), ...baseOrder.slice(0, ix)];
			console.log('sticks', sticks);
			let chosenX = x;
			let chosenY = y;

			for (const dir of sticks) {
				let testX = 0;
				let testY = 0;
				let fits = false;
				let closeButtonGap = timeout === 0 ? 26 : 6;
				console.log('direction', dir);
				switch (dir) {
					case 'right':
						testX = hoverRect.right + gap;
						testY = hoverRect.top; //+ hoverRect.height / 2 - tooltipRect.height / 2;
						fits = viewportWidth - hoverRect.right >= tooltipRect.width + gap;
						break;
					case 'left':
						testX = hoverRect.left - tooltipRect.width - 3 * gap - closeButtonGap;
						testY = hoverRect.top; //+ hoverRect.height / 2 - tooltipRect.height / 2;
						fits = hoverRect.left >= tooltipRect.width + 3 * gap + closeButtonGap;
						break;
					case 'below':
						testX = hoverRect.left + (hoverRect.width - tooltipRect.width) / 2;
						testY = hoverRect.bottom + gap;
						fits = viewportHeight - hoverRect.bottom >= tooltipRect.height + gap;
						break;
					case 'above':
						testX = hoverRect.left + (hoverRect.width - tooltipRect.width) / 2;
						testY = hoverRect.top - tooltipRect.height - 3 * gap;
						fits = hoverRect.top >= tooltipRect.height + 3 * gap;
						console.log('above', testX, testY, fits);
						break;
				}

				if (fits) {
					chosenX = testX;
					chosenY = testY;
					break;
				}

				// Assign preferred fallbacks if nothing fits perfectly
				// if (dir === stick) {
				// 	chosenX = testX;
				// 	chosenY = testY;
				// }
			}

			x = chosenX;
			y = chosenY;
		} else {
			x = hoverRectPos.x + gap;
			y = hoverRectPos.y + gap;
		}

		// Boundary Clamping Protection: Prevent tooltip from clipping off viewport edges
		if (tooltipEl) {
			x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
			y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));
		}

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
			padding: '12px 12px 8px 12px',
			...customStyles, // Custom overrides win
		});
		tooltipEl.style.paddingRight = timeout === 0 ? '32px' : '0ps';
	}

	// ==================================================
	export async function showTooltip(
		anchor: THovered,
		tooltip: HTMLElement | string,
		timeout_: number = 3000,
		stick: TStick = 'above',
		customStyles: Record<string, string> = {}
	) {
		try {
			if (tooltipEl !== undefined) {
				return;
			}
			console.log(stick);
			timeout = timeout_;
			// 1. Setup the container DOM node
			if (typeof tooltip === 'string') {
				tooltipEl = document.createElement('div');
				tooltipEl.className = 'dynamic-tooltip';

				// Squeezed paragraphs layout generation using string splitting
				tooltipEl.innerHTML = tooltip
					.split(',')
					.map((part) => part.trim())
					.filter(Boolean)
					.map((part) => `<p style="margin:0;padding:0;line-height:1.4">${part}</p>`)
					.join('');
			} else {
				tooltipEl = tooltip;
			}

			// Base initial transition styles applied before rendering width checks
			Object.assign(tooltipEl.style, {
				position: 'fixed',
				opacity: '0',
				transition: 'opacity 0.3s ease',
			});

			// 2. Resolve anchor bounds
			let hoverRect: DOMRect | TPos;
			if (anchor instanceof HTMLElement) {
				hoverRect = anchor.getBoundingClientRect();
			} else if (anchor && 'clientX' in anchor) {
				// Handle fallback coordinate mappings if MouseEvent targeting is utilized
				// if (stick === 'above') {
				// 	hoverRect = { x: anchor.clientX, y: anchor.clientY };
				// } else {
				const el = document.elementFromPoint(anchor.clientX, anchor.clientY) || document.body;
				hoverRect = (el as HTMLElement).getBoundingClientRect();
				// }
			} else {
				hoverRect = anchor as TPos;
			}

			// 3. Create persistent close button if timeout === 0
			if (timeout === 0) {
				const closeBtn = document.createElement('button');
				closeBtn.innerHTML = '❌';
				closeBtn.setAttribute('aria-label', 'Close');
				Object.assign(closeBtn.style, {
					position: 'absolute',
					bottom: '10px',
					right: '5px',
					background: 'transparent',
					border: 'none',
					cursor: 'pointer',
					fontSize: '14px',
					padding: '0',
					lineHeight: '1',
					opacity: '0.7',
				});

				closeBtn.onclick = (e) => {
					e.stopPropagation();
					if (tooltipEl) fadeOutAndRemove(tooltipEl);
				};
				tooltipEl.appendChild(closeBtn);
			}

			// Append element to layout body first to read accurate dimensions
			document.body.appendChild(tooltipEl);

			// Calculate optimal positioning coordinates
			setTooltipPosition(hoverRect, stick, customStyles);

			// Force immediate layout engine reflow before fading opacity injection
			tooltipEl.offsetHeight;
			tooltipEl.style.opacity = '1';

			if (timeout > 0) {
				setTimeout(() => {
					if (tooltipEl) fadeOutAndRemove(tooltipEl);
				}, timeout);
			}

			return tooltipEl;
		} catch (err: unknown) {
			console.error('showTooltip failed:', err);
		}
	}
</script>

<style lang="scss">
	:global(.dynamic-tooltip) {
		width: max-content;
	}
</style>
