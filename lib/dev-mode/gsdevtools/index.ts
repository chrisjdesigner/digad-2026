/**
 * GSAP DevTools Integration
 * Provides timeline visualization and control during development.
 * This code is only loaded in dev mode and never included in builds.
 */

import { gsap } from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';

gsap.registerPlugin(GSDevTools);

/**
 * Initialize GSDevTools timeline if not in iframe/notoolbar mode
 */
export function initGSDevTools(): void {
  // Skip GSDevTools in iframe/notoolbar mode
  if (new URLSearchParams(window.location.search).get('notoolbar') === '1') {
    return;
  }

  setTimeout(() => {
    GSDevTools.create({
      animation: 'timelineSceneOne',
      hideGlobalTimeline: true,
      paused: false,
      persist: true,
      keyboard: false,
    });
  }, 1);
}
