import './sass/style.scss';
import { gsap, SplitText } from 'gsap/all';

gsap.registerPlugin(SplitText);

/** --------------------------
 * GLOBAL VARIABLES
 * -------------------------- */

// Selector for the ad container
const adContainer = document.getElementById('banner');

// Get the css variables for --ad-width and --ad-height to be used in js
const adWidth = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue('--ad-width'),
);
const adHeight = parseInt(
  getComputedStyle(document.documentElement).getPropertyValue('--ad-height'),
);

/* Greensock Timelines */
const timelineSceneOne = gsap.timeline({
  id: 'timelineSceneOne',
  paused: true,
});
const timelineAdHover = gsap.timeline({
  paused: true,
});

// Set up SplitText
const headlineSplitText = new SplitText('.headline', { type: 'lines' });

/** --------------------------
 * INITIALIZE AD
 * -------------------------- */

function init(adContainer) {
  adAnimation();

  // User interaction events.
  adContainer.addEventListener('mouseenter', () => {
    timelineAdHover.timeScale(1).play();
  });
  adContainer.addEventListener('mouseleave', () => {
    timelineAdHover.timeScale(1.5).reverse();
  });
}

// Wait for fonts to load before initializing the ad.
document.fonts.ready.then(function () {
  init(adContainer);
});

/** --------------------------
 * AD ANIMATION
 * -------------------------- */

function adAnimation() {
  /**
   * Primary Timeline.
   */
  timelineSceneOne
    .to('.container', { duration: 0.5, opacity: 1, delay: 0.2 })
    .from(headlineSplitText.lines, {
      duration: 0.75,
      y: 6,
      autoAlpha: 0,
      stagger: 0.25,
      ease: 'power4.out',
    });

  timelineSceneOne.play();

  /**
   * Hover Timeline.
   */
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
