import { readdirSync, existsSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';
import chalk from 'chalk';

const rootDirectory = resolve('./');
const sizeDirRe = /^\d+x\d+(?:-[a-zA-Z0-9_-]+)?$/;

function runQuiet(label, command, args, envOverrides = {}) {
  const result = spawnSync(command, args, {
    cwd: rootDirectory,
    stdio: 'pipe',
    encoding: 'utf-8',
    env: {
      ...process.env,
      ...envOverrides,
    },
  });

  if (result.status !== 0) {
    const line = '═'.repeat(78);
    console.log(`\n${chalk.redBright(line)}`);
    console.log(chalk.redBright.bold(`  ${label} FAILED`));
    console.log(chalk.redBright(line));

    if (result.stdout?.trim()) {
      console.log(chalk.whiteBright('\n[stdout]'));
      console.log(result.stdout.trimEnd());
    }

    if (result.stderr?.trim()) {
      console.log(chalk.whiteBright('\n[stderr]'));
      console.log(result.stderr.trimEnd());
    }

    process.exit(result.status || 1);
  }

  return result;
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

runQuiet('TypeScript compile', 'pnpm', ['exec', 'tsc']);

for (const size of adSizes) {
  runQuiet(`Preview build ${size}`, 'pnpm', ['exec', 'vite', 'build'], {
    npm_lifecycle_event: `preview:${size}`,
  });
}
