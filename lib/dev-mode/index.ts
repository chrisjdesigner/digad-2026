import { gsap, GSDevTools } from 'gsap/all';

gsap.registerPlugin(GSDevTools);

setTimeout(() => {
  GSDevTools.create({
    animation: 'timelineSceneOne',
    hideGlobalTimeline: true,
    paused: false,
  });
}, 1);
