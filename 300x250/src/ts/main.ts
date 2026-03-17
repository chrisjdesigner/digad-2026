import { gsap, SplitText } from 'gsap/all';

// Register the SplitText plugin for advanced text animations
gsap.registerPlugin(SplitText);

import '../sass/style.scss';
import {
  adContainer,
  delayedHover,
  hoverState,
  adWidth,
  adHeight,
} from './config';
import { waitForFonts } from './utils';


/** --------------------------
 * GSAP TIMELINES
 * -------------------------- */

// Main intro/scene animation timeline
export const timelineSceneOne = gsap.timeline({
  id: 'timelineSceneOne',
  paused: true,
});

// Hover interaction timeline
export const timelineAdHover = gsap.timeline({
  paused: true,
});

/** --------------------------
 * AD INITIALIZATION & ORCHESTRATION
 * -------------------------- */

/**
 * Initialize ad event listeners and animations.
 * Call after fonts are ready to avoid text reflow.
 */
function init(container: HTMLElement) {
  // Build all animation timelines
  adAnimation();

  // Listen for mouse events to trigger hover animation
  // Hover animation only runs if hoverState.canRun is true
  container.addEventListener('mouseenter', () => {
    if (!hoverState.canRun) return;
    timelineAdHover.timeScale(1).play();
  });
  container.addEventListener('mouseleave', () => {
    if (!hoverState.canRun) return;
    // Play reverse at 1.5x speed for snappy exit
    timelineAdHover.timeScale(1.5).reverse();
  });
}

/**
 * Main entry point: set up ad after DOM and fonts are ready.
 */
async function startAd() {
  if (!adContainer) {
    console.error('Ad container #banner was not found.');
    return;
  }

  // Wait for fonts before initializing so text animations don't cause reflow
  await waitForFonts();
  init(adContainer);
}

// Start ad when the module loads
startAd();

/** --------------------------
 * TIMELINE ANIMATION
 * -------------------------- */

function adAnimation() {
  // ========== MAIN ANIMATION ==========
  timelineSceneOne
    .to('.container', { duration: 0.5, opacity: 1, delay: 0.2 })
    .from('.headline', {
      duration: 0.5,
      autoAlpha: 0,
      ease: 'power2.out',
    })
  ;

  // ========== ADVANCED: SplitText Starter ==========
  // For advanced text animations (letters, lines, words), uncomment and customize.
  // const headlineSplitText = new SplitText('.headline', { type: 'lines' });
  // .from(headlineSplitText.lines, {
  //   duration: 0.75,
  //   y: 6,
  //   autoAlpha: 0,
  //   stagger: 0.25,
  //   ease: 'power4.out',
  // })

  // If hover should wait for intro to finish, unlock it when timeline completes
  if (delayedHover) {
    timelineSceneOne.eventCallback('onComplete', () => {
      hoverState.canRun = true;
    });
  }

  // Start playing the intro timeline
  timelineSceneOne.play();

  // ========== HOVER ANIMATION ==========
  timelineAdHover.to(
    '.button',
    {
      duration: 0.33,
      backgroundColor: '#C7520A',
      borderColor: '#C7520A',
      ease: 'power2.out',
    },
    0,
  );
}
