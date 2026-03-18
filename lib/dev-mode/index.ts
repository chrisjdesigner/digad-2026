import { gsap } from 'gsap';
import { GSDevTools } from 'gsap/GSDevTools';

gsap.registerPlugin(GSDevTools);

// Skip GSDevTools in iframe/notoolbar mode
if (new URLSearchParams(window.location.search).get('notoolbar') !== '1') {
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
