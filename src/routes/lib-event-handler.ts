import { browser } from '$app/environment'

type HandlerFn = (e: MouseEvent | DragEvent | Event) => void
type HandlerRegistry = Record<string, HandlerFn>

const NON_PASSIVE_EVENTS = new Set([
  'dragstart', 'dragover', 'dragenter', 'dragleave', 'drop', 'dragend',
  'touchstart', 'touchmove', 'touchend'   // if you ever add touch support
])
const MOUSE_EVENTS = (new Set(['mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'click', 'dblclick', 'mousedown', 'mouseup'])).union(NON_PASSIVE_EVENTS)

export function createGlobalEventHandler() {
  let observer: MutationObserver | null = null
  const registry: HandlerRegistry = {}
  const registeredElements = new WeakSet<HTMLElement>()

  function parseEventHandlers(attr: string | undefined): Record<string, string> {
    if (!attr) return {}
    return Object.fromEntries(
      attr.split(',').map(p => p.trim()).map(pair => {
        const [event, handler] = pair.split(':').map(s => s.trim())
        return [event, handler]
      }).filter(([e, h]) => e && h)
    )
  }

  function attachToElement(elm: HTMLElement | Node) {
    if (elm instanceof Node && elm.nodeType !== Node.ELEMENT_NODE) {
      console.warn(`Node type ${elm.nodeType} is not acceptable for event handler`)
      return
    }
    const el = elm as HTMLElement // cast if Node.ELEMENT_NODE
    if (registeredElements.has(el)) return
    registeredElements.add(el)

    const handlersMap = parseEventHandlers(el.dataset.eventHandler)

    Object.entries(handlersMap).forEach(([eventType, handlerName]) => {
      const fn = registry[handlerName]
      if (typeof fn === 'function' && MOUSE_EVENTS.has(eventType)) {
        const options = NON_PASSIVE_EVENTS.has(eventType)
          ? { passive: false }
          : undefined
        el.addEventListener(eventType, fn as EventListener, options)
      } else {
        console.warn(`Handler "${handlerName}" not found for "${eventType}"`)
      }
    })
  }

  function setup(root: Document | HTMLElement = document) {
    if (!browser) return

    root.querySelectorAll<HTMLElement>('[data-event-handler]').forEach(attachToElement)

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement
              if (el.hasAttribute('data-event-handler')) attachToElement(el)
              el.querySelectorAll?.('[data-event-handler]').forEach(attachToElement)
            }
          })
        } else if (mutation.attributeName === 'data-event-handler') {
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

  return { setup, registerHandlers, destroy }
}