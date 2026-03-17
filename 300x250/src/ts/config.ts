import { gsap, SplitText } from 'gsap/all';

// Register the SplitText plugin for advanced text animations
gsap.registerPlugin(SplitText);

/** --------------------------
 * CONFIGURATION & SETUP
 * -------------------------- */

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

// Get ad dimensions from CSS variables (--ad-width and --ad-height)
export const adWidth = getComputedStyle(document.documentElement).getPropertyValue('--ad-width').trim();
export const adHeight = getComputedStyle(document.documentElement).getPropertyValue('--ad-height').trim();

/** --------------------------
 * GSAP TIMELINES
 * -------------------------- */

// Main intro/scene animation timeline
// Paused by default; will be played in adAnimation()
export const timelineSceneOne = gsap.timeline({
  id: 'timelineSceneOne',
  paused: true,
});

// Hover interaction timeline
// Plays on mouseenter, reverses on mouseleave
export const timelineAdHover = gsap.timeline({
  paused: true,
});
