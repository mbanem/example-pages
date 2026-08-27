
type Stick = 'left' | 'right' | 'above' | 'below';
type Anchor = MouseEvent | HTMLElement | { x: number; y: number };

type TooltipOptions = {
	anchor: Anchor;
	content: string | HTMLElement;
	timeout?: number; // 0 = persistent (shows close button)
	stick?: Stick;
	styles?: Record<string, string>;
	onDestroy?: () => void;
};

export default class Tooltip {
	private element: HTMLDivElement;
	private anchorEl: HTMLElement | null = null;
	private preferredStick: Stick;
	private timeoutId: number | null = null;
	private isDestroyed = false;
	private onDestroy?: () => void;

	private scrollHandler = () => this.updatePosition();
	private resizeHandler = () => this.updatePosition();

	constructor(options: TooltipOptions) {
		console.log('[grokkClassTooltip ctor options]', options);
		if (typeof document === 'undefined') {
			throw new Error('Tooltip can only be used in the browser');
		}

		this.preferredStick = options.stick ?? 'above';
		this.onDestroy = options.onDestroy;

		this.element = this.createElement(options.content, options.timeout ?? 3000);
		console.log('[grokkClassTooltip ctor this.element]', this.element);

		Object.assign(this.element.style, {
			position: 'fixed',
			opacity: '0',
			zIndex: '9999',
			borderRadius: '8px',
			border: '1px solid #ccc',
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			fontFamily: 'system-ui, sans-serif',
			fontSize: '14px',
			width: 'max-content',
			padding: (options.timeout ?? 3000) === 0 ? '12px 26px 8px 12px' : '12px 12px 8px 12px',
			transition:
				'opacity 0.3s ease, left 0.2s cubic-bezier(0.25, 1, 0.5, 1), top 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
			...options.styles,
		});

		console.log('[grokkClassTooltip ctor innerHTML]', this.element.innerHTML);
		this.resolveAnchor(options.anchor);
		document.body.appendChild(this.element);

		// Force layout, then position + fade in
		this.element.offsetHeight;
		this.updatePosition();
		this.element.style.opacity = '1';

		// Listeners
		window.addEventListener('scroll', this.scrollHandler, { passive: true });
		window.addEventListener('resize', this.resizeHandler, { passive: true });

		// Auto-destroy
		const timeout = options.timeout ?? 3000;
		if (timeout > 0) {
			this.timeoutId = window.setTimeout(() => this.destroy(), timeout);
		}
	}

	// ---------- Public API ----------

	destroy() {
		if (this.isDestroyed) return;
		this.isDestroyed = true;

		if (this.timeoutId !== null) {
			clearTimeout(this.timeoutId);
			this.timeoutId = null;
		}

		window.removeEventListener('scroll', this.scrollHandler);
		window.removeEventListener('resize', this.resizeHandler);

		this.anchorEl?.classList.remove('dynamic-tooltip-anchor');
		this.anchorEl = null;

		// Fade out then remove
		this.element.style.opacity = '0';
		window.setTimeout(() => {
			this.element.remove();
			this.onDestroy?.();
		}, 300);
	}

	isActive() {
		return !this.isDestroyed;
	}

	// ---------- Private helpers ----------

	private createElement(content: string | HTMLElement, timeout: number): HTMLDivElement {
		const el = document.createElement('div');
		el.className = 'dynamic-tooltip';

		if (typeof content === 'string') {
			el.innerHTML = content
				.split(',')
				.map((part) => part.trim())
				.filter(Boolean)
				.map((part) => `<p style="margin:0;padding:0;line-height:1.4">${part}</p>`)
				.join('');
		} else {
			el.appendChild(content);
		}

		// Close button only when persistent
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
				fontSize: '13px',
				padding: '0',
				lineHeight: '1',
				opacity: '0.7',
			});
			closeBtn.onclick = (e) => {
				e.stopPropagation();
				this.destroy();
			};
			el.appendChild(closeBtn);
		}

		return el;
	}

	private resolveAnchor(anchor: Anchor) {
		if (anchor instanceof HTMLElement) {
			this.anchorEl = anchor;
			anchor.classList.add('dynamic-tooltip-anchor');
		} else if (anchor && 'clientX' in anchor) {
			const el = document.elementFromPoint(anchor.clientX, anchor.clientY) as HTMLElement | null;
			if (el) {
				this.anchorEl = el;
				el.classList.add('dynamic-tooltip-anchor');
			}
		}
		// plain {x,y} is handled in updatePosition
	}

	private getAnchorRect(): DOMRect | { x: number; y: number } | null {
		if (this.anchorEl) {
			return this.anchorEl.getBoundingClientRect();
		}
		return null;
	}

	private updatePosition() {
		if (this.isDestroyed || !this.element) return;

		const tooltipRect = this.element.getBoundingClientRect();
		const viewportWidth = document.documentElement.clientWidth;
		const viewportHeight = document.documentElement.clientHeight;
		const gap = 8;
		const buttonGap = 16;

		let x = 0;
		let y = 0;

		const anchorRect = this.getAnchorRect();

		// Plain coordinate anchor
		if (!anchorRect) {
			// fallback – should rarely happen
			x = 8;
			y = 8;
		} else if (!('width' in anchorRect)) {
			x = anchorRect.x + gap;
			y = anchorRect.y + gap;
		} else {
			const rect = anchorRect;
			const baseOrder: Stick[] = ['left', 'above', 'right', 'below'];
			const startIdx = baseOrder.indexOf(this.preferredStick);
			const sequence = startIdx === -1 ? baseOrder : [...baseOrder.slice(startIdx), ...baseOrder.slice(0, startIdx)];

			let chosenX = rect.left;
			let chosenY = rect.bottom + gap;

			for (const dir of sequence) {
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
						testX = rect.left - tooltipRect.width - gap - 2 * buttonGap;
						testY = rect.top;
						fits = rect.left >= tooltipRect.width + gap + 2 * buttonGap;
						break;
					case 'below':
						testX = rect.left + rect.width / 2 - tooltipRect.width / 2;
						testY = rect.bottom + gap;
						fits = viewportHeight - rect.bottom >= tooltipRect.height + gap;
						break;
					case 'above':
						testX = rect.left + rect.width / 2 - tooltipRect.width / 2;
						testY = rect.top - tooltipRect.height - gap - buttonGap;
						fits = rect.top >= tooltipRect.height + gap + buttonGap;
						break;
				}

				if (fits) {
					chosenX = testX;
					chosenY = testY;
					break;
				}

				// keep preferred direction as fallback
				if (dir === this.preferredStick) {
					chosenX = testX;
					chosenY = testY;
				}
			}

			x = chosenX;
			y = chosenY;
		}

		// Clamp to viewport
		x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
		y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

		this.element.style.left = `${x}px`;
		this.element.style.top = `${y}px`;
	}
}

