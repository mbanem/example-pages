import { browser } from '$app/environment'

// ✅ Keep type definitions
export const CEvent = {
  click: 'click',
  mouseover: 'mouseover',
  mouseout: 'mouseout',
  dragstart: 'dragstart',
  dragover: 'dragover',
  dragend: 'dragend',
  drop: 'drop',
} as const
// const draggable = 'draggable'
type THandler = (e: MouseEvent) => void
type THandlers = Record<string, THandler>
type TDragDropHandlers = Record<string, ((e: DragEvent) => void)>

export type TEventType = typeof CEvent[keyof typeof CEvent]
export type TMap = Map<TEventType, { callback: (event: MouseEvent) => void; listener: (e: MouseEvent) => void }>

export type TEventHandlerReturnValue = () => {
  setup(wrapper: HTMLElement | string, eventHandlers?: THandlers): void
  remove(element: HTMLElement | string, eventType: TEventType): void
  destroy(): void
}

export function resolveElement(element: HTMLElement | string): HTMLElement | string {
  if (!browser) return element
  if (typeof element === 'string') {
    if ('.#'.includes(element[0])) {
      return document.querySelector(element) as HTMLElement
    }
    if (document.querySelector(`.${element}`)) {
      return document.querySelector(`.${element}`) as HTMLElement
    }
    return document.querySelector(`#${element}`) as HTMLElement
  }
  return element
}

// ✅ Pure factory function
export const createEventHandler = () => {
  // const managedElements = new Set<HTMLElement>()
  const elementListeners = new WeakMap<HTMLElement, TMap>()
  const ehHandlersWM = new WeakMap<HTMLElement, THandlers>()
  const excludedHosts = new Set<HTMLElement>()
  const dragDropHandlers = new WeakMap<HTMLElement, TDragDropHandlers>()

  function matchesQuerySelector(event: MouseEvent) {
    const el = event.target as HTMLElement
    // if it is a wrapper ignore it
    if (excludedHosts.has(el)) {

      return
    }
    if (el.dataset.eventList) {
      return el.dataset.eventList.split(' ').includes(event.type)
    }
    return false
  }

  function enableDragReorder(
    element: HTMLElement
  ) {
    const container = resolveElement(element) as HTMLElement
    let draggedEl: HTMLElement | null = null

    const handleDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement
      draggedEl = target
      // Optional: add visual feedback
      target.style.opacity = '0.5'
      e.dataTransfer?.setData('text/plain', '') // required for Firefox
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault() // essential!
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      if (!draggedEl) {
        return
      }
      const dropTarget = e.target as HTMLElement
      if (!dropTarget || dropTarget === draggedEl) {
        resetOpacity()
        return
      }

      // Move dragged element before drop target
      if (e.shiftKey) {
        dropTarget.after(draggedEl)
      } else {
        container.insertBefore(draggedEl, dropTarget)
      }
      resetOpacity()
    }

    const handleDragEnd = () => {
      resetOpacity()
      draggedEl = null
    }

    const resetOpacity = () => {
      if (draggedEl) draggedEl.style.opacity = ''
    }

    const handlers: TDragDropHandlers = {
      'dragstart': handleDragStart,
      'dragover': handleDragOver,
      'drop': handleDrop,
      'dragend': handleDragEnd
    }
    // Attach listeners 
    for (const [eventType, handler] of Object.entries(handlers)) {
      container.addEventListener(eventType as TEventType, handler as THandler)
    }
    // Return dragDropHandlers function
    // return () => {
    //   for (const [eventType, handler] of Object.entries(handlers)) {

    //     container.removeEventListener(eventType as TEventType, handler as THandler)
    //   }
    // }
    return handlers
  }

  return {
    setup(
      wrapper: HTMLElement | string,
      eventHandlers?: THandlers
    ) {
      const wrapperEl = resolveElement(wrapper)
      if (!wrapperEl) {
        throw new Error(`Element not found:`)
      }
      // save wrappers to ignore events on them; include only its children
      excludedHosts.add(wrapperEl)

      // if it is only drag and drop
      if (!eventHandlers) {
        // enableDragReorder(wrapperEl) returns cleanup handler function
        dragDropHandlers.set(wrapperEl, enableDragReorder(wrapperEl))
        return
      }
      // save all event handlers that the wrapper wants to be handled
      ehHandlersWM.set(wrapperEl, eventHandlers as THandlers)

      // wrapperEl has no liteners registerd yet so open a list for them
      if (!elementListeners.has(wrapperEl)) {
        elementListeners.set(wrapperEl, new Map())
      }

      const eventMap = elementListeners.get(wrapperEl)!
      const handlers = ehHandlersWM.get(wrapperEl) as THandlers
      // without filtering additional element DOMStringMap(0) appears; maybe Svelte hydration inserted new line
      const children = wrapperEl.children as HTMLCollection
      for (let i = 0; i < children.length; i++) {
        if (!(children[i] as HTMLElement).dataset.eventList) {
          continue
        }
        const eventList = (children[i] as HTMLElement).dataset.eventList as string
        // children have a list of events thay want to liten on
        for (const eventType of eventList.split(' ')) {
          if (handlers[eventType]) {

            if (!eventMap.has(eventType as TEventType)) {
              // create a new event handler for wrapperEl child and its data-event-list events
              const handler = (ehHandlersWM.get(wrapperEl) as THandlers)[eventType] as THandler


              const listener = (event: MouseEvent) => {
                event.preventDefault()
                // const target = event.target as HTMLElement
                // when this event occurs check if element is interested in firing on it
                if (matchesQuerySelector(event)) {
                  handler(event)
                }
              }
              // we register this event for the wrapper
              eventMap.set(eventType as TEventType, { callback: handler, listener })
              // add event listener to DOM on wrapper as event will propagate to
              // it but we fire only if event.target is a child intersted in it
              wrapperEl.addEventListener(eventType as TEventType, listener)
            }
          }
        }
      }
    },

    remove(element: HTMLElement | string, eventType: TEventType) {
      const wrapperEl = resolveElement(element)
      const map = elementListeners.get(wrapperEl as HTMLElement)

      if (!map || !map.has(eventType)) {
        return
      }

      const { listener } = map.get(eventType)!;
      (wrapperEl as HTMLElement).removeEventListener(eventType, listener)
      map.delete(eventType)

      if (map.size === 0) {
        // managedElements.delete(wrapperEl as HTMLElement)
        elementListeners.delete(wrapperEl as HTMLElement)
      }
    },

    destroy() {

      // managedElements.forEach((element) => {
      //   const eventMap = elementListeners.get(element)
      //   if (eventMap) { 
      //     eventMap.forEach(({ listener }, eventType) => {
      //       element.removeEventListener(eventType, listener) 
      //     }) 
      //   } 
      // }) 
      // managedElements.clear() 
      excludedHosts.forEach(wrapper => {


        const map = elementListeners.get(wrapper as HTMLElement)

        for (const [eventType, cbLsn] of map as TMap) {

          // const { listener } = map.get(eventType)!;
          (wrapper as HTMLElement).removeEventListener(eventType, cbLsn.callback)
          // 	alert(`removed ${eventType}`)
          // }
        }

        if (dragDropHandlers.has(wrapper)) {
          const handlers = dragDropHandlers.get(wrapper) as TDragDropHandlers
          for (const [eventType, handler] of Object.entries(handlers)) {
            wrapper.removeEventListener(eventType as TEventType, handler as THandler)
          }
        }
      })
    }
  }
}