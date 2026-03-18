import { readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';

const rootDirectory = resolve('./');
const sizeDirRe = /^\d+x\d+(?:-[a-zA-Z0-9_-]+)?$/;

function run(command, args, envOverrides = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDirectory,
    stdio: 'inherit',
    env: {
      ...process.env,
      ...envOverrides,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

const adSizes = readdirSync(rootDirectory, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .filter((name) => sizeDirRe.test(name))
  .filter((name) => existsSync(resolve(rootDirectory, name, 'index.html')))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

if (adSizes.length === 0) {
  console.error('No ad size directories with index.html were found.');
  process.exit(1);
}

console.log(`Found ${adSizes.length} ad size(s): ${adSizes.join(', ')}`);

console.log('Running TypeScript compile...');
run('pnpm', ['exec', 'tsc']);

for (const size of adSizes) {
  console.log(`Building preview for ${size}...`);
  run('pnpm', ['exec', 'vite', 'build'], {
    npm_lifecycle_event: `preview:${size}`,
  });
}

console.log('All previews built successfully.');
