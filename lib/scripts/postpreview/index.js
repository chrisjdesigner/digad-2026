import { resolve } from 'path';
import { open, writeFile } from 'fs/promises';
import { userInfo } from 'os';
import chalk from 'chalk';
import { parseAdInfoFromDirectory } from '../../ad/utils.js';
import { loadAdConfigs } from '../../ad/config.js';

// Initialize stored ad configs from ad.config.json files in each ad folder.
const baseDirectory = resolve('./');
const adConfigs = loadAdConfigs(baseDirectory);

for (const [name, config] of Object.entries(adConfigs)) {
  // Extract information about the ad size/directories.
  const adInfo = parseAdInfoFromDirectory(resolve(baseDirectory, `./${name}`));

  // Append information to context.
  adConfigs[name].context = {
    ...adInfo,
    ...config.context,
  };
}

// Check if the global digads config file exists, and load it if so.
const globalDigadConfigPath = resolve(
  '/usr/local/lib/swansonrussell/digads.json',
);
let visibleHost = null;

try {
  const globalDigadConfigFile = await open(globalDigadConfigPath, 'r');

  // Read the file.
  const globalDigadConfig = JSON.parse(
    await globalDigadConfigFile.readFile('utf-8'),
  );
  if (globalDigadConfig.previewBasePath) {
    // Set variable info from the config for the corresponding user.
    visibleHost = `https://${globalDigadConfig.previewBasePath}/`;
  }

  await globalDigadConfigFile.close();

  console.log(chalk.greenBright.bold('Preview URLs:'));

  // Log preview URLs.
  for (const [name, config] of Object.entries(adConfigs)) {
    console.log(
      chalk.greenBright(
        `${name}:\t\t${visibleHost}${config.context.client}/${config.context.job}/preview/${config.context.name}/index.html`,
      ),
    );
    if (config.variants) {
      config.variants.forEach((variant) => {
        console.log(
          chalk.greenBright(
            `${name}-${variant.name}:\t\t${visibleHost}${config.context.client}/${config.context.job}/preview/${config.context.name}/${variant.name}.html`,
          ),
        );
      });
    }
    console.log('\n');
  }
} catch (error) {
  console.error('Could not read global digads config file');
  console.error('Could not generate preview URLs');
}

// Generate all.html that shows all ad sizes and versions in one page
try {
  const sizeCardHtml = Object.entries(adConfigs).map(([adSize, config]) => {
    const variants = config.variants || [];
    const allVersions = [{ name: 'index', label: 'Base' }, ...variants];
    
    // Parse ad dimensions from folder name
    const sizeMatch = adSize.match(/^(\d+)x(\d+)/);
    const adWidth = sizeMatch ? parseInt(sizeMatch[1]) : 300;
    const adHeight = sizeMatch ? parseInt(sizeMatch[2]) : 250;
    
    // Build version cards for this size
    const versionCards = allVersions.map(v => {
      const href = v.name === 'index' ? `./${adSize}/index.html` : `./${adSize}/${v.name}.html`;
      return `
        <a class="version-card" href="${href}">
          <div class="version-card-inner">
            <div class="version-label">
              <span>${v.label || v.name}</span>
            </div>
            <iframe src="${href}?notoolbar=1" width="${adWidth}" height="${adHeight}" tabindex="-1"></iframe>
          </div>
        </a>`;
    }).join('');

    return `
      <section class="size-group">
        <h2 class="size-group-title">${adSize}</h2>
        <div class="size-group-grid">${versionCards}</div>
      </section>`;
  }).join('');

  const allHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Ads - All Versions Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: var(--dev-ad-content-bg, #1a1a1a);
      min-height: 100vh;
    }
    .grid {
      display: flex;
      flex-direction: column;
      gap: 28px;
      padding: 20px;
    }
    .size-group {
      width: 100%;
    }
    .size-group-title {
      color: var(--dev-text-secondary, #ddd);
      font-size: 14px;
      font-weight: 700;
      letter-spacing: 0.4px;
      margin: 0 0 12px 0;
    }
    .size-group-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
      align-items: flex-start;
    }
    .version-card {
      display: block;
      text-decoration: none;
      color: inherit;
      position: relative;
      cursor: pointer;
    }
    .version-card-inner {
      background: var(--dev-bg-primary, #111);
      overflow: hidden;
      box-shadow: 0 4px 12px var(--dev-shadow, rgba(0,0,0,0.3));
    }
    .version-card .version-label span:first-child {
      transition: color 0.3s ease;
    }
    .version-card:hover .version-label span:first-child {
      color: var(--dev-text-primary, #fff);
    }
    .version-card iframe {
      display: block;
      border: none;
      background: #fff;
      pointer-events: none;
    }
    .version-label {
      padding: 12px 16px;
      background: var(--dev-bg-tertiary, #222);
      color: var(--dev-text-muted, #888);
      font-size: 13px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="grid">
    ${sizeCardHtml}
  </div>
</body>
</html>`;

  await writeFile(resolve('./preview/all.html'), allHtml, 'utf-8');
  console.log(chalk.blueBright('Generated preview/all.html with all ad sizes and versions'));
} catch (error) {
  console.error(chalk.redBright('Error generating all.html:'), error.message);
}
