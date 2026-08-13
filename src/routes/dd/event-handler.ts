import { browser } from '$app/environment'

type HandlerFn = (e: Event) => void
type HandlerRegistry = Record<string, HandlerFn>

export function createGlobalEventHandler() {
  let observer: MutationObserver | null = null
  const registry: HandlerRegistry = {}
  const registeredElements = new WeakSet<HTMLElement>()

  // Parse "click:toggleColor, dragstart:handleDragStart, drop:onDrop" etc.
  function parseEventHandlers(attr: string | undefined): Record<string, string> {
    if (!attr) return {}
    const pairs = attr.split(',').map(p => p.trim())
    const map: Record<string, string> = {}
    for (const pair of pairs) {
      const [eventName, handlerName] = pair.split(':').map(s => s.trim())
      if (eventName && handlerName) {
        map[eventName] = handlerName
      }
    }
    return map
  }

  function attachToElement(el: HTMLElement) {
    if (registeredElements.has(el)) return
    registeredElements.add(el)

    const handlers = parseEventHandlers(el.dataset.eventHandler)

    Object.entries(handlers).forEach(([eventType, handlerName]) => {
      const fn = registry[handlerName]
      if (typeof fn === 'function') {
        // For drag events we want them to bubble properly
        const options = eventType.startsWith('drag') ? { passive: false } : undefined
        el.addEventListener(eventType, fn as EventListener, options)
      } else {
        console.warn(`Handler "${handlerName}" not registered for event "${eventType}" on element:`, el)
      }
    })
  }

  function setup(root: Document | HTMLElement = document) {
    if (!browser) return

    // Initial scan for all elements with data-event-handler
    root.querySelectorAll<HTMLElement>('[data-event-handler]').forEach(attachToElement)

    // MutationObserver for Svelte dynamic content
    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement
              if (el.hasAttribute('data-event-handler')) {
                attachToElement(el)
              }
              el.querySelectorAll?.('[data-event-handler]').forEach(attachToElement)
            }
          })
        } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-event-handler') {
          attachToElement(mutation.target as HTMLElement)
        }
      }
    })

    observer.observe(root, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['data-event-handler']
    })
  }

  function registerHandlers(handlers: HandlerRegistry) {
    Object.assign(registry, handlers)
  }

  function destroy() {
    observer?.disconnect()
    observer = null
  }

  return {
    setup,
    registerHandlers,
    destroy
  }
}