import { browser } from '$app/environment'

export type EType = MouseEvent | DragEvent | Event | DragEvent
type EventType = string
type HandlerFn = (e: EType) => void
type HandlerRegistry = Record<string, HandlerFn>
type Handlers = Record<EventType, HandlerFn>

export function createGlobalEventHandler() {
  let observer: MutationObserver | null = null
  const handlerRegistry: HandlerRegistry = {}           // "toggleColor" → actual function
  const registeredElements = new WeakSet<HTMLElement>()

  function parseEventHandlers(attr: string | undefined): Handlers {
    if (!attr) return {}
    const handlers: Handlers = {}
    // data-event-handler separator could include spaces and commas
    const pairs = attr.replace(/\s+?,\s+|\s+/g, ',').split(/,| /).map(s => s.trim()).filter(Boolean)
    for (const pair of pairs) {
      const [eventName, handlerName] = pair.split(':').map(s => s.trim())
      if (eventName && handlerName) {
        // based on the handlerName get handler:HandlerFn from handlerRegistry
        // so the handlerRegistry should already have page's handlers registered
        handlers[eventName] = handlerRegistry[handlerName]
      }
    }
    return handlers
  }

  function attachToElement(elm: HTMLElement | Node) {
    if (elm instanceof Node && elm.nodeType !== Node.ELEMENT_NODE) {
      console.warn(`Node type ${elm.nodeType} is not acceptable for event handler`)
      return
    }
    const el = elm as HTMLElement

    if (registeredElements.has(el)) return

    // get data-event-handler from the element and parse it to get event-handler pairs
    const handlers = parseEventHandlers(el.dataset.eventHandler)  // Record<EventType, HandlerFn>
    // do not register element with no handlers
    if (Object.keys(handlers).length === 0) {
      return
    }
    registeredElements.add(el)

    Object.entries(handlers).forEach(([eventType, handlerFn]) => {
      const fn = handlerRegistry[handlerFn.name]
      if (typeof fn === 'function') {
        el.addEventListener(eventType, fn as EventListener, { passive: false })
      } else {
        console.warn(`Handler "${handlerFn.name}" not found in handlerRegistry for event "${eventType}"`)
      }
    })
  }

  function setup(root: HTMLElement | Document = document) {
    if (!browser) return
    // Initial scan for element's children
    root.querySelectorAll<HTMLElement>('[data-event-handler]').forEach(attachToElement)

    /* MutationObserver for dynamic Svelte content
      mutations:MutationRecord[] property is set to the type of the mutation as a string.
      The value can be:
        - attributes if the mutation was an attribute mutation.
        - characterData if it was a mutation to a CharacterData node.
        - childList if the mutation was a mutation to the tree of nodes.
      MutationRecord propertiers are
        addedNodes, attributeName, attributeNamespace, nextSibling, oldValue, previousSibling, removedNodes, type
    */
    // define what observer should do
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {  // HTMLElement
              const el = node as HTMLElement            // cast to HTMLElement
              if (el.hasAttribute?.('data-event-handler')) {
                attachToElement(el)
              }
              // Also check descendants
              el.querySelectorAll?.('[data-event-handler]').forEach(attachToElement)
            }
          })
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-event-handler') {
          const el = mutation.target as HTMLElement
          attachToElement(el)
        }
      }
    })

    // now make observer takes care about the root details
    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-event-handler']
    })
  }

  function registerHandlers(handlersFn: Array<HandlerFn>) {
    // expands handlerRegistry with new handlers
    Object.assign(handlerRegistry, handlersFn.map(fn => ({ [fn.name]: fn })).reduce((acc, curr) => ({ ...acc, ...curr }), {}))
  }

  function destroy() {
    observer?.disconnect()
    observer = null
    // Note: we don't remove listeners here (WeakSet + direct attach) — cleanup is manual if needed
  }

  return { setup, registerHandlers, destroy }
}