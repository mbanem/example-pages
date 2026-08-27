import { mount, unmount } from 'svelte';
import TooltipComponent from './CRReactiveTooltip.svelte';
// import type { TStick } from '../../app.d.ts';
// type TStick = 'left' | 'right' | 'above' | 'below';
type TPosition = { x: number; y: number };
type THovered = MouseEvent | HTMLElement | TPosition;

export interface TooltipOptions {
  color?: string;
  backgroundColor?: string;
  border?: string;
}

export class Tooltip {
  private instance: Record<string, any> | null = null;
  private container: HTMLElement | null = null;

  show(
    anchor: THovered,
    tooltip: HTMLElement | string,
    timeout: number = 3000,
    stick: TStick = 'above',
    customStyles: Record<string, string> = {},
    callbackOnClose?: () => void
  ) {
    // Hide previous instance on this specific Tooltip object if open
    this.hide();

    this.container = document.createElement('div');
    document.body.appendChild(this.container);

    this.instance = mount(TooltipComponent, {
      target: this.container,
      props: {
        anchor,
        tooltip,
        timeout,
        stick,
        customStyles,
        callbackOnClose
      }
    });
  }

  hide() {
    if (this.instance) {
      unmount(this.instance);
      this.instance = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}