import { gsap, GSDevTools } from 'gsap/all';

gsap.registerPlugin(GSDevTools);

// Skip GSDevTools in iframe/notoolbar mode
if (new URLSearchParams(window.location.search).get('notoolbar') !== '1') {
  setTimeout(() => {
    GSDevTools.create({
      animation: 'timelineSceneOne',
      hideGlobalTimeline: true,
      paused: false,
    });
  }, 1);
}
