// import { browser } from '$app/environment'
import * as utils from './utils';
type TDragDropHandlers = Record<string, (e: DragEvent) => void>;

// ✅ Keep type definitions
export const CEvent = {
	click: 'click',
	mouseover: 'mouseover',
	mouseout: 'mouseout',
	dragstart: 'dragstart',
	dragover: 'dragover',
	dragend: 'dragend',
	drop: 'drop',
} as const;
// const draggable = 'draggable'
type cleanup = () => void;
type THandler = (e: MouseEvent) => void;
type THandlers = Record<string, THandler>;

export type TEventType = (typeof CEvent)[keyof typeof CEvent];
export type TMap = Map<TEventType, { callback: (event: MouseEvent) => void; listener: (e: MouseEvent) => void }>;

export type TEventHandlerReturnValue = () => {
	setup(wrapper: HTMLElement | string, eventHandlers?: THandlers): void;
	remove(element: HTMLElement | string, eventType: TEventType): void;
	destroy(): void;
};

// ✅ Pure factory function
export const createEventHandler = () => {
	// const managedElements = new Set<HTMLElement>()
	const elementListeners = new WeakMap<HTMLElement, TMap>();
	const ehHandlersWM = new WeakMap<HTMLElement, THandlers>();
	const hostsExcluded = new Set();
	const cleanupDragDropHandlers = new Set<THandler>();

	function matchesQuerySelector(event: MouseEvent) {
		const el = event.target as HTMLElement;
		// if it is a wrapper ignore it
		if (hostsExcluded.has(el)) {
			return;
		}
		if (el.dataset.eventList) {
			return el.dataset.eventList.split(' ').includes(event.type);
		}
		return false;
	}

	function enableDragReorder(element: HTMLElement) {
		const container = utils.resolveElement(element);
		let draggedEl: HTMLElement | null = null;

		const handleDragStart = (e: DragEvent) => {
			const target = e.target as HTMLElement;
			draggedEl = target;
			// Optional: add visual feedback
			target.style.opacity = '0.5';
			e.dataTransfer?.setData('text/plain', ''); // required for Firefox
		};

		const handleDragOver = (e: DragEvent) => {
			e.preventDefault(); // essential!
		};

		const handleDrop = (e: DragEvent) => {
			e.preventDefault();
			if (!draggedEl) {
				return;
			}
			const dropTarget = e.target as HTMLElement;
			if (!dropTarget || dropTarget === draggedEl) {
				resetOpacity();
				return;
			}

			// Move dragged element before drop target
			if (e.shiftKey) {
				dropTarget.after(draggedEl);
			} else {
				(container as HTMLElement).insertBefore(draggedEl, dropTarget);
			}
			resetOpacity();
		};

		const handleDragEnd = () => {
			resetOpacity();
			draggedEl = null;
		};

		const resetOpacity = () => {
			if (draggedEl) draggedEl.style.opacity = '';
		};

		const handlers: TDragDropHandlers = {
			dragstart: handleDragStart,
			dragover: handleDragOver,
			drop: handleDrop,
			dragend: handleDragEnd,
		};
		// Attach listeners
		for (const [key, value] of Object.entries(handlers)) {
			container?.addEventListener(key as TEventType, value as THandler);
		}
		// Return cleanupDragDropHandlers function
		return () => {
			for (const [key, value] of Object.entries(handlers)) {
				container?.removeEventListener(key as TEventType, value as THandler);
			}
		};
	}

	return {
		setup(wrapper: HTMLElement | string, eventHandlers?: THandlers) {
			const wrapperEl = utils.resolveElement(wrapper);
			if (!wrapperEl) {
				throw new Error(`Element not found: `);
			}
			// save wrappers to ignore events on them; include only its children
			hostsExcluded.add(wrapperEl);

			// if it is only drag and drop
			if (!eventHandlers && Array.from(wrapperEl.classList).join().includes('draggable')) {
				cleanupDragDropHandlers.add(enableDragReorder(wrapperEl) as cleanup);
				return;
			}
			// save all event handlers that the wrapper wants to be handled
			ehHandlersWM.set(wrapperEl, eventHandlers as THandlers);

			// wrapperEl has no liteners registerd yet so open a list for them
			if (!elementListeners.has(wrapperEl)) {
				elementListeners.set(wrapperEl, new Map());
			}

			// // eventMap shold hold listeners wrapper what wrapper is interestedd inhandlers exists
			const eventMap = elementListeners.get(wrapperEl)!;
			// what wrapper handlers exists
			const handlers = ehHandlersWM.get(wrapperEl) as THandlers;
			// without filtering additional element DOMStringMap(0) appears; maybe Svelte hydration inserted new line
			for (const child of Array.from(wrapperEl.children as HTMLCollection).filter(
				(child) => (child as HTMLElement).dataset.eventList
			)) {
				// children have a list of events thay want to liten on
				for (const eventType of ((child as HTMLElement).dataset.eventList as string).split(' ')) {
					if (handlers[eventType]) {
						if (!eventMap.has(eventType as TEventType)) {
							// create a new event handler for wrapperEl child and its data-event-list events
							const handler = (ehHandlersWM.get(wrapperEl) as THandlers)[eventType] as THandler;

							const listener = (event: MouseEvent) => {
								event.preventDefault();
								// const target = event.target as HTMLElement
								// when this event occurs check if element is interested in firing on it
								if (matchesQuerySelector(event)) {
									handler(event);
								}
							};
							// we register this event for the wrapper
							eventMap.set(eventType as TEventType, { callback: handler, listener });
							// add event listener to DOM on wrapper as event will propagate to
							// it but we fire only if event.target is a child intersted in it
							wrapperEl.addEventListener(eventType as TEventType, listener);
						}
					}
				}
			}
		},

		remove(element: HTMLElement | string, eventType: TEventType) {
			const wrapperEl = utils.resolveElement(element);
			const map = elementListeners.get(wrapperEl as HTMLElement);

			if (!map || !map.has(eventType)) {
				return;
			}

			const { listener } = map.get(eventType)!;
			(wrapperEl as HTMLElement).removeEventListener(eventType, listener);
			map.delete(eventType);

			if (map.size === 0) {
				// managedElements.delete(wrapperEl as HTMLElement)
				elementListeners.delete(wrapperEl as HTMLElement);
			}
		},

		destroy() {
			// console.log('destroy')
			// managedElements.forEach((element) => {
			//   const eventMap = elementListeners.get(element)
			//   if (eventMap) {
			//     eventMap.forEach(({ listener }, eventType) => {
			//       element.removeEventListener(eventType, listener)
			//     })
			//   }
			// })
			// managedElements.clear()
			hostsExcluded.forEach((wrapper) => {
				const map = elementListeners.get(wrapper as HTMLElement);
			});
			cleanupDragDropHandlers.forEach((cleanup) => {
				cleanup(event as MouseEvent);
			});
		},
	};
};
