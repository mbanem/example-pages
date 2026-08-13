import { browser } from '$app/environment'

// event-handler.ts (updated version)
type TEventType =
  | 'click'
  | 'dblclick'
  | 'mousedown'
  | 'mouseup'
  | 'mousemove'
  | 'mouseover'
  | 'mouseout'
  | 'mouseenter'
  | 'mouseleave'
  | 'contextmenu'


// allowObjectTypes
type THandler = (e: MouseEvent) => void
type THandlers = Partial<Record<TEventType, (e: MouseEvent) => void>>
type TDragDropHandlers = Record<string, ((e: DragEvent) => void)>
type TWrapper = HTMLElement | string

interface EventConfig {
  element: HTMLElement
  events: Set<TEventType>
}

class EventHandler {
  private wrapper: HTMLElement | null = null;
  // private wrappers = new Set<HTMLElement>();
  private supportedHandlers: THandlers = {};
  private childConfigs: Map<HTMLElement, EventConfig> = new Map();
  private boundHandlers: Map<TEventType, EventListener> = new Map();  // NEW: to store bound functions for proper removal
  private dropWrappers = new Set<{ wrapper: HTMLElement, handlers: TDragDropHandlers }>()

  // drag-drop for reordering a list of HTMLElements
  private enableDragReorder(
    wrapper: HTMLElement
  ) {
    let draggedEl: HTMLElement | null = null


    for (const child of Array.from(wrapper.children) as HTMLElement[]) {
      child.setAttribute('draggable', 'true')
      for (const chld of Array.from(child.children) as HTMLElement[]) {
        (chld).style.pointerEvents = 'none'
      }
    }
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
      // Move dragged element before or after drop target
      if (e.shiftKey) {
        dropTarget.after(draggedEl)
      } else {
        wrapper.insertBefore(draggedEl, dropTarget)
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
      wrapper.addEventListener(eventType as TEventType, handler as THandler)
    }
    return handlers
  }
  /**
   * Set up event delegation
   * @param wrapper - container element or CSS selector
   * @param handlers - event handlers for supported mouse events
   */
  setup(wrapper: TWrapper, handlers?: THandlers): void {
    // Resolve wrapper element
    this.wrapper = this.resolveElement(wrapper)
    if (!this.wrapper) {
      console.warn('EventHandler: Could not resolve wrapper element')
      return
    }

    // this.wrappers.add(this.wrapper)
    if (!handlers) {
      const handlers = this.enableDragReorder(this.wrapper)
      if (handlers) {
        this.dropWrappers.add({ wrapper: this.wrapper, handlers })
      }
      return
    }

    // Remove any previous listeners (using stored bound handlers)
    this.removeAllListeners()

    // Clear previous registrations
    this.childConfigs.clear()
    this.boundHandlers.clear()

    // Store only the handlers we actually support
    this.supportedHandlers = this.filterSupportedHandlers(handlers)

    // Find all children that want event delegation
    this.registerInterestedChildren()

    // Attach delegation listeners
    this.attachDelegationListeners()
  }

  private resolveElement(wrapper: TWrapper): HTMLElement | null {
    if (wrapper instanceof HTMLElement) {
      return wrapper
    }
    if (typeof wrapper === 'string') {
      return document.querySelector(wrapper) as HTMLElement | null
    }
    return null
  }

  private filterSupportedHandlers(handlers: THandlers): THandlers {
    const result: THandlers = {}
    for (const [event, handler] of Object.entries(handlers)) {
      if (this.isSupportedEvent(event)) {
        result[event as TEventType] = handler
      }
    }
    return result
  }

  private isSupportedEvent(event: string): event is TEventType {
    return [
      'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove',
      'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'contextmenu'
    ].includes(event)
  }

  private registerInterestedChildren(): void {

    if (!this.wrapper) return

    // Use Array.from for iterable HTMLCollection + type safety
    const children = Array.from(this.wrapper.children)
    for (const child of children) {
      if (!(child instanceof HTMLElement)) continue

      const eventListStr = child.dataset.eventList
      if (!eventListStr) continue

      const requestedEvents = new Set(
        eventListStr
          .split(/\s+/)
          .map(e => e.trim())
          .filter(e => e.length > 0)
      )

      // Only keep events we actually support and have handlers for
      const supportedEvents = new Set<TEventType>()
      for (const ev of requestedEvents) {
        if (this.isSupportedEvent(ev) && this.supportedHandlers[ev]) {
          supportedEvents.add(ev)
        }
      }

      if (supportedEvents.size > 0) {
        this.childConfigs.set(child, {
          element: child,
          events: supportedEvents
        })
      }
    }

  }

  private getBoundHandler(eventName: TEventType): EventListener {
    if (!this.boundHandlers.has(eventName)) {
      this.boundHandlers.set(eventName, this.handleEvent.bind(this) as EventListener)
    }
    return this.boundHandlers.get(eventName)!
  }

  private attachDelegationListeners(): void {

    if (!this.wrapper) return

    // We attach listeners only for events we actually have handlers for
    for (const eventName of Object.keys(this.supportedHandlers) as TEventType[]) {
      this.wrapper.addEventListener(eventName, this.getBoundHandler(eventName))
    }


  }

  private removeAllListeners(): void {

    if (!this.wrapper) return

    for (const [eventName, boundHandler] of this.boundHandlers) {
      this.wrapper.removeEventListener(eventName, boundHandler)
    }
    this.boundHandlers.clear()  // Clear after removal

  }

  private handleEvent(e: MouseEvent): void {

    if (!this.wrapper) return

    const target = e.target
    if (!(target instanceof HTMLElement)) return

    // Find the closest registered child (including target itself)
    let current: HTMLElement | null = target
    while (current && current !== this.wrapper) {
      const config = this.childConfigs.get(current)
      if (config && config.events.has(e.type as TEventType)) {

        const handler = this.supportedHandlers[e.type as TEventType]
        if (handler) {

          handler(e)
        }
        return // We handled it - stop bubbling up
      }
      current = current.parentElement
    }
  }

  // Optional: cleanup method
  destroy(): void {
    this.removeAllListeners()

    this.childConfigs.clear()
    this.supportedHandlers = {}
    // for (const wrapper of this.wrappers) {
    //   if (this.dragDropHandlers.has(wrapper)) {
    //     const handlers = this.dragDropHandlers.get(wrapper) as TDragDropHandlers
    //     for (const [eventType, handler] of Object.entries(handlers)) {
    //       wrapper.removeEventListener(eventType as TEventType, handler as THandler)
    //     }
    //   }
    // }
    this.dropWrappers.forEach(obj => {
      let iy = 1
      for (const [eventType, handler] of Object.entries(obj.handlers)) {
        obj.wrapper.removeEventListener(eventType as TEventType, handler as THandler)
        if (browser) {
          localStorage.setItem(`drag-drop${iy++}`, `${eventType} ${obj.wrapper.innerText.slice(0, 20)}`)
        }
      }
    })
    this.wrapper = null
  }
}

export function createEventHandler(): EventHandler {
  return new EventHandler()
}

export type { TEventType, THandlers, TWrapper }