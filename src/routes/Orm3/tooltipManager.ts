import { Tooltip, type TooltipOptions, type Anchor } from './Tooltip'

class TooltipManager {
  private tooltips = new Set<Tooltip>()

  /** Create and track a new tooltip */
  show(options: TooltipOptions): Tooltip {
    // Optional: close any existing tooltip on the same anchor
    if (options.anchor instanceof HTMLElement) {
      this.closeByAnchor(options.anchor)
    }

    const tip = new Tooltip({
      ...options,
      onDestroy: () => {
        this.tooltips.delete(tip)
        options.onDestroy?.()
      },
    })

    this.tooltips.add(tip)
    return tip
  }

  /** Destroy one specific tooltip */
  close(tip: Tooltip) {
    tip.destroy()
  }

  /** Destroy all tooltips attached to a given element */
  closeByAnchor(anchor: HTMLElement) {
    for (const tip of this.tooltips) {
      // We need a way to know the anchor – see note below
      if ((tip as any).anchorEl === anchor) {
        tip.destroy()
      }
    }
  }

  /** Destroy every active tooltip */
  closeAll() {
    // Copy to array because destroy() mutates the Set
    [...this.tooltips].forEach((tip) => tip.destroy())
  }

  /** How many tooltips are currently open */
  get count() {
    return this.tooltips.size
  }
}

// Singleton – import this everywhere
export const tooltipManager = new TooltipManager()