// theme.svelte.ts
import { setContext, getContext } from 'svelte';

export class ThemeState {
  // 1. Reactive state using Svelte 5 rune
  current = $state<'dark' | 'light'>('dark');

  constructor() {
    // Optional: Load initial theme from localStorage if in a webview environment
    if (typeof localStorage !== 'undefined') {
      this.current = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }
  }

  toggle() {
    this.current = this.current === 'dark' ? 'light' : 'dark';
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', this.current);
    }
  }
}

// 2. Context Keys for type safety
const THEME_KEY = Symbol('THEME_KEY');

export function initTheme() {
  return setContext(THEME_KEY, new ThemeState());
}

export function useTheme() {
  return getContext<ThemeState>(THEME_KEY);
}
