type Trigger = 'click' | 'hover';

type Params = {
	contentEl: HTMLElement;
	trigger: Trigger;
	onItemHover?: (e: MouseEvent) => void;
	onItemCallback?: (e: MouseEvent, hoveringEl?: HTMLElement) => void;
};

export function tooltipRBBlock(node: HTMLElement, params: Params) {
	let { contentEl, trigger, onItemHover, onItemCallback } = params; // mutable with newParams
	let hoveringEl: HTMLElement;
	let visible = false;
	// console.lolg('entry opacity', contentEl.style.opacity);
	contentEl.classList.remove('hidden');

	document.body.appendChild(contentEl);

	contentEl.style.position = 'absolute';
	contentEl.style.opacity = '0';
	contentEl.style.cursor = 'pointer';

	function positionAt(x: number, y: number) {
		contentEl.style.top = `${y}px`;
		contentEl.style.left = `${x}px`;
	}

	function showAt(x: number, y: number) {
		// console.lolg('showAt', (e.target as HTMLElement).innerText);
		document.documentElement.click(); // close other openned popups or context menus
		positionAt(x, y);
		contentEl.style.opacity = '1';
		visible = true;
	}

	function isOutsideBounds(e: MouseEvent, boundEl: HTMLElement) {
		// console.lolg('isOutsideBounds', (e.target as HTMLElement).innerText);
		const r = boundEl.getBoundingClientRect();
		return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
	}

	function hide(e: MouseEvent) {
		// console.lolg('hide', (e.target as HTMLElement).innerText);
		if (visible && e && !isOutsideBounds(e, contentEl)) {
			// console.lolg('ignore hide', (e.target as HTMLElement).innerText);
			return;
		}
		contentEl.style.opacity = '0';
		visible = false;
	}

	// 🔁 unified trigger handling
	function handleTrigger(e: MouseEvent) {
		// console.lolg('handleTrigger', (e.target as HTMLElement).innerText);
		const rect = node.getBoundingClientRect();
		showAt(rect.left + window.scrollX, rect.bottom + window.scrollY);
	}

	function handleHover(e: MouseEvent) {
		// console.lolg('handleHover', (e.target as HTMLElement).innerText);
		if ((e.target as HTMLElement) === node) {
			return;
		}
		hoveringEl = e.target as HTMLElement;
		onItemHover?.(e);
		const r = (e.target as HTMLElement).getBoundingClientRect();
		showAt(r.x + window.scrollX, r.y - 25 + window.scrollY);
	}
	function handleClick(e: MouseEvent) {
		// console.lolg('handleClick', (e.target as HTMLElement).tagName);
		// console.lolg('handleClick entry', (e.target as HTMLElement).innerText);

		const item = e.target as HTMLElement; //.closest('[data-item]');
		if (!item) {
			// console.lolg('handleClick ignore');
			return;
		}

		contentEl.style.opacity = '0';
		visible = false;
		onItemCallback?.(e, hoveringEl);
		try {
			// (item as HTMLInputElement).checked = false;
			if (item.parentElement) {
				item.parentElement.querySelectorAll('input').forEach((rb) => (rb.checked = false));
			}
			// console.lolg('clear radio buttons');
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log('clear radiobox', msg);
		}
	}

	if (trigger === 'hover') {
		node.addEventListener('mouseover', handleHover);
		if (onItemHover) {
			contentEl.addEventListener('click', handleClick);
			// console.lolg('add listener mouse leave');
			contentEl.addEventListener('mouseleave', hide);
			node.addEventListener('mouseleave', hide);
		}
	} else {
		node.addEventListener('click', handleTrigger);
	}

	// document.addEventListener('click', hide);
	contentEl.addEventListener('click', handleClick);

	return {
		update(newParams: Params) {
			contentEl = newParams.contentEl;
			trigger = newParams.trigger;
			if (newParams.onItemHover) {
				onItemHover = newParams.onItemHover;
			}
			onItemCallback = newParams.onItemCallback;
		},
		destroy() {
			node.removeEventListener('mouseover', handleHover);
			node.removeEventListener('click', handleTrigger);
			node.removeEventListener('mouseleave', hide);
			document.removeEventListener('click', hide);
			contentEl.removeEventListener('click', handleClick);
			contentEl.removeEventListener('mouseleave', hide);
			contentEl.remove();
		},
	};
}
