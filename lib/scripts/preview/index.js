import { readdirSync, existsSync, statSync } from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';
import chalk from 'chalk';

const rootDirectory = resolve('./');
const sizeDirRe = /^\d+x\d+(?:-[a-zA-Z0-9_-]+)?$/;

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

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

function collectDirectoryAssetStats(dirPath) {
  const assets = readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const path = resolve(dirPath, entry.name);
      return { name: entry.name, size: statSync(path).size };
    });

  const totalBytes = assets.reduce((sum, file) => sum + file.size, 0);
  const largest = [...assets].sort((a, b) => b.size - a.size).slice(0, 3);

  return {
    fileCount: assets.length,
    totalBytes,
    largest,
  };
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

const line = '═'.repeat(78);
console.log(`\n${chalk.cyanBright(line)}`);
console.log(chalk.cyanBright.bold('  PREVIEW BUILD PIPELINE'));
console.log(chalk.cyanBright(line));
console.log(chalk.gray(`Sizes: ${adSizes.join(', ')}`));

console.log(`\n${chalk.gray('Running TypeScript compile...')}`);
runQuiet('TypeScript compile', 'pnpm', ['exec', 'tsc']);
console.log(`${chalk.greenBright('✓')} ${chalk.greenBright('TypeScript check complete')}`);

for (const size of adSizes) {
  console.log(`\n${chalk.yellowBright('▶')} ${chalk.yellowBright.bold(`Building preview for ${size}`)}`);
  runQuiet(`Preview build ${size}`, 'pnpm', ['exec', 'vite', 'build'], {
    npm_lifecycle_event: `preview:${size}`,
  });

  const previewDir = resolve(rootDirectory, 'preview', size);
  const stats = collectDirectoryAssetStats(previewDir);
  const largestText = stats.largest.length > 0
    ? stats.largest.map((file) => `${file.name} ${formatBytes(file.size)}`).join(' | ')
    : 'none';

  console.log(
    `${chalk.greenBright('✓')} ${chalk.greenBright(`${size} preview build complete`)} ` +
    `${chalk.gray(`(${stats.fileCount} files, ${formatBytes(stats.totalBytes)})`)}`,
  );
  console.log(chalk.gray(`   Largest assets: ${largestText}`));
}

console.log(`\n${chalk.greenBright('Preview build phase complete. Running post-preview processing...')}`);
