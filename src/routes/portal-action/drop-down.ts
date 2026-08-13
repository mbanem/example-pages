// dropdown.ts
type Params = {
	contentEl: HTMLElement;
	onItemCallback?: (e: MouseEvent, hoveringEl?: HTMLElement) => void;
};
export function dropdown(node: HTMLElement, params: Params) {
	// cannot use const as update function needs to update
	// these variables with newParams
	let { contentEl, onItemCallback } = params;
	contentEl.style.opacity = '0';
	// dropdown items have hidden class to prevent rendering markup
	// of displaying them initially and the hidden class is removed
	// now and opacity is used to toggle their visibility
	contentEl.classList.toggle('hidden');

	function contentOnClick(e: MouseEvent) {
		// do not turn opacity to '0' as it will be done at close func
		e.preventDefault();
		onItemCallback?.(e);
	}

	contentEl.addEventListener('click', contentOnClick);

	function toggle() {
		contentEl.style.opacity = contentEl.style.opacity === '0' ? '1' : '0';
	}
	// toggle dropdown items visibility on click of the dropdown 'button'
	node.addEventListener('click', toggle);

	function close(e: MouseEvent) {
		if (contentEl.style.opacity === '0') {
			return;
		}
		if (!contentEl.contains(e.target as Node) && !node.contains(e.target as Node)) {
			contentEl.style.opacity = '0';
		}
	}

	// close dropdown items when clicking outside of the dropdown component
	document.addEventListener('click', close);

	return {
		update(newParams: Params) {
			contentEl = newParams.contentEl;
			onItemCallback = newParams.onItemCallback;
		},
		destroy() {
			node.removeEventListener('click', toggle);
			document.removeEventListener('click', close);
			contentEl.removeEventListener('click', contentOnClick);
			contentEl.remove();
		},
	};
}
