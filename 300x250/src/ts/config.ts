/** --------------------------
 * CONFIGURATION & SETUP
 * -------------------------- */

import { getRootCssVariable, getRootCssVariables } from './utils';

// Ad container reference - set once on init
export const adContainer = document.getElementById('banner');


/**
 * Hover Gate Control
 * Set to true if you want hover animations to wait until the main intro timeline completes.
 * Useful for preventing interaction during critical intro moments.
 */
declare global {
  interface Window {
    __delayedHover?: boolean;
  }
}

export let delayedHover = !!window.__delayedHover;

// Track whether hover animations are allowed (mutable)
export const hoverState = {
  canRun: !delayedHover,
};

window.addEventListener('dev:hover-gate-setting-changed', (event: Event) => {
  const customEvent = event as CustomEvent<{ delayedHover: boolean }>;
  const nextDelayedHover = !!customEvent.detail?.delayedHover;
  delayedHover = nextDelayedHover;
  hoverState.canRun = !nextDelayedHover;
});


/**
 * Read all CSS custom properties from :root into a key/value map.
 * Example key format: "--ad-width".
 * This allows us to define ad dimensions and other settings in CSS and access them in JS.
 */
export const cssVariables = getRootCssVariables();
export const getCssVariable = (name: string, fallback = '') => getRootCssVariable(name, fallback);

// Use that helper to fill in js variables (Just add your own here as needed)
export const adWidth = getCssVariable('--ad-width');
export const adHeight = getCssVariable('--ad-height');
