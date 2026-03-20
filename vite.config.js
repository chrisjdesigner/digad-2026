import { resolve } from 'path';
import { defineAdConfigs as defineDevAdConfigs } from './lib/vite/vite.config.dev';
import { defineAdConfig as defineBuildAdConfig } from './lib/vite/vite.config.build';

// Check what the npm lifecycle event is.
const npmLifecycleEvent = process.env.npm_lifecycle_event;

// If the lifecycle isn't set, or it's not `dev`, `preview:WIDTHxHEIGHT`, or `build:WIDTHxHEIGHT`, throw an error.
if (!npmLifecycleEvent || (!npmLifecycleEvent.startsWith('dev') && !npmLifecycleEvent.startsWith('preview:') && !npmLifecycleEvent.startsWith('build:'))) {
  throw new Error('You must run `npm run dev` or `npm run preview:WIDTHxHEIGHT`.');
}

const defineAdConfigs = (url) => {
  if (npmLifecycleEvent.startsWith('dev')) {
    return defineDevAdConfigs(import.meta.url);
  }

  const baseDirectory = resolve(`${npmLifecycleEvent.split(':')[1]}`);
  return defineBuildAdConfig(baseDirectory);
};

export default defineAdConfigs();
