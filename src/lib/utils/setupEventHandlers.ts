// $lib/setupEventHandlers.ts
export function setupEventHandlers() {
  // Find ALL elements in the current document that have the attribute
  const elements = document.querySelectorAll<HTMLElement>('[data-event-handler]')

  elements.forEach((el) => {
    const handlerType = el.dataset.eventHandler // e.g. "draggable", "clickable", etc.

    // Example: mouse events
    if (handlerType?.includes('mouse')) {
      el.addEventListener('mousedown', handleMouseDown)
      el.addEventListener('mouseup', handleMouseUp)
      // ... other mouse events
    }

    // Example: drag & drop for reordering inside list wrappers
    if (handlerType?.includes('drag')) {
      makeDraggable(el)
    }
  })
}

// Optional: helper for drag & drop reordering
function makeDraggable(item: HTMLElement) {
  const list = item.closest('.list-wrapper') as HTMLElement | null
  if (!list) return

  item.draggable = true

  item.addEventListener('dragstart', (e) => {
    e.dataTransfer?.setData('text/plain', item.id || '')
    item.classList.add('dragging')
  })

  item.addEventListener('dragend', () => {
    item.classList.remove('dragging')
  })

  list.addEventListener('dragover', (e) => e.preventDefault())
  list.addEventListener('drop', (e) => {
    // reordering logic here
    const draggedId = e.dataTransfer?.getData('text/plain')
    // ... move the element in DOM or update store
  })
}

function handleMouseDown(e: MouseEvent) { /* ... */ }
function handleMouseUp(e: MouseEvent) { /* ... */ }