type Params = {
	contentEl: HTMLElement;
	onItemCallback: (e: MouseEvent) => void;
};

export function contextMenu(node: HTMLElement, params: Params) {
	let { contentEl, onItemCallback } = params; // mutable with newParams
	let visible = false;
	contentEl.classList.toggle('hidden');

	document.body.appendChild(contentEl);

	contentEl.style.position = 'absolute';
	contentEl.style.opacity = '0';
	contentEl.style.cursor = 'pointer';

	function positionAt(x: number, y: number) {
		contentEl.style.top = `${y}px`;
		contentEl.style.left = `${x}px`;
	}

	// as contentEl is added dynamically context items must be
	// positioned at the time of showing the menu,  otherwise
	// it will follow document flow and may end up in unexpected places
	// we positioon it with top-left at cursor position
	function showAt(x: number, y: number) {
		document.documentElement.click(); // close other openned popups or context menus
		positionAt(x, y);
		contentEl.style.opacity = '1';
		visible = true;
	}
	function isOutsideBounds(e: MouseEvent, boundEl: HTMLElement) {
		const r = boundEl.getBoundingClientRect();
		return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
	}
	function hide(e: MouseEvent) {
		if (visible && e && !isOutsideBounds(e, contentEl)) {
			return;
		}
		contentEl.style.opacity = '0';
		visible = false;
	}

	// 🔁 unified trigger handling
	function handleTrigger(e: MouseEvent) {
		e.preventDefault();
		if (visible && isOutsideBounds(e, contentEl)) {
			contentEl.style.opacity = '0';
			visible = false;
			return;
		}
		showAt(e.clientX + window.scrollX, e.clientY + window.scrollY);
	}

	function handleClick(e: MouseEvent) {
		onItemCallback(e);

		contentEl.style.opacity = '0';
		visible = false;
	}

	node.addEventListener('contextmenu', handleTrigger);

	document.addEventListener('click', hide);
	contentEl.addEventListener('click', handleClick);

	return {
		update(newParams: Params) {
			contentEl = newParams.contentEl;
			onItemCallback = newParams.onItemCallback;
		},
		destroy() {
			contentEl.remove();
		},
	};
}
