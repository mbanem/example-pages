type Trigger = 'click' | 'hover' | 'contextmenu';

type PopupParams = {
	content: HTMLElement;
	trigger: Trigger;
	triggerCallback?: (e: MouseEvent) => void;
	radioGroupClass?: string;
	containerClass?: string;
	onItemClick?: (e: MouseEvent) => void;
};

export function popup(node: HTMLElement, params: PopupParams) {
	// arguments of const type
	const { radioGroupClass, containerClass, triggerCallback } = params;
	// mutable argumentts
	let { content, trigger, onItemClick } = params; // mutable with newParams
	content.classList.toggle('hidden');
	document.body.appendChild(content);
	// const radioGroupEl = radioGroupClass
	// 	? (document.querySelector(`.${radioGroupClass}`) as HTMLDivElement | null)
	// 	: null;
	const containerClassEl = containerClass
		? (document.querySelector(`.${containerClass}`) as HTMLDivElement | null)
		: null;

	content.style.position = 'absolute';
	content.style.opacity = '0';
	content.style.cursor = 'pointer';

	let visible = false;
	// let hoveringEl: HTMLElement;

	function positionAt(x: number, y: number) {
		content.style.top = `${y}px`;
		content.style.left = `${x}px`;
	}

	function showAt(x: number, y: number) {
		document.documentElement.click();
		positionAt(x, y);
		content.style.opacity = '1';
		visible = true;
	}
	function isOutsideBounds(e: MouseEvent, boundEl: HTMLElement) {
		const r = boundEl.getBoundingClientRect();
		return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
	}
	function hide(e: MouseEvent) {
		if (visible && e && !isOutsideBounds(e, content)) {
			return;
		}
		content.style.opacity = '0';
		visible = false;
	}

	// 🔁 unified trigger handling
	function handleTrigger(e: MouseEvent) {
		if (trigger === 'contextmenu') e.preventDefault();

		const rect = node.getBoundingClientRect();

		if (trigger === 'contextmenu') {
			if (visible && isOutsideBounds(e, content)) {
				content.style.opacity = '0';
				visible = false;
				return;
			}
			showAt(e.clientX + window.scrollX, e.clientY + window.scrollY);
		} else {
			showAt(rect.left + window.scrollX, rect.bottom + window.scrollY);
		}
	}

	function handleHover(e: MouseEvent) {
		const el = e.target as HTMLElement;
		if (el === node || el.tagName !== 'P') {
			return;
		}
		// console.log('handleHover');
		if (triggerCallback) {
			// console.log('triggerCallback');
			triggerCallback(e);
		}
		// hoveringEl = e.target as HTMLElement;
		const r = (e.target as HTMLElement).getBoundingClientRect();
		showAt(r.x + window.scrollX, r.y - 25 + window.scrollY);
	}
	function handleClick(e: MouseEvent) {
		const item = (e.target as HTMLElement).closest('[data-item]');
		if (!item) return;

		content.style.opacity = '0';
		visible = false;
		onItemClick?.(e);
		try {
			// (item as HTMLInputElement).checked = false;
			if (item.parentElement) {
				item.parentElement.querySelectorAll('input').forEach((rb) => (rb.checked = false));
			}
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			console.log('clear radiobox', msg);
		}
	}

	if (trigger === 'hover') {
		node.addEventListener('mouseover', handleHover);
		node.addEventListener('mouseout', handleHover);
		// if (radioGroupEl) {
		content.addEventListener('click', handleClick);
		// content.addEventListener('mouseleave', hide);
		if (trigger === 'hover' && triggerCallback) {
			// console.log('register triggerCallback');
			content.addEventListener('mouseover', triggerCallback);
			// content.addEventListener('mouseout', triggerCallback);
		}
		// else {
		// 	console.log('not triggerCallback', trigger, triggerCallback);
		// }
		// containerClassEl?.addEventListener('mouseleave', hide);
		// }
	} else {
		node.addEventListener(trigger === 'contextmenu' ? 'contextmenu' : 'click', handleTrigger);
	}

	document.addEventListener('click', hide);
	content.addEventListener('click', handleClick);

	return {
		update(newParams: PopupParams) {
			content = newParams.content;
			trigger = newParams.trigger;
			onItemClick = newParams.onItemClick;
		},
		destroy() {
			content.remove();
		},
	};
}
