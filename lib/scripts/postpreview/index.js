import { resolve, dirname } from 'path';
import { open, writeFile, readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { userInfo } from 'os';
import chalk from 'chalk';
import yaml from 'js-yaml';
import { parseAdInfoFromDirectory } from '../../ad/utils.js';
import { loadAdConfigs } from '../../ad/config.js';
import { readReplayIconSvg, renderCardsForAdSize, renderAllViewHtml } from '../../vite/all-view/render.js';
// Import sync fs functions at the top
import { existsSync, readdirSync, readFileSync } from 'fs';
let accordionItemIconSvg;
try {
  accordionItemIconSvg = readFileSync(new URL('../../../lib/dev-mode/icons/chevron-down.svg', import.meta.url), 'utf-8')
    .replace(/\s+/g, ' ')
    .trim()
    .replace('<svg', '<svg class="size-group-title-chevron"');
} catch (e) {
  // Fallback if file read fails
  accordionItemIconSvg = '<svg class="size-group-title-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>';
}

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

  // Define dev configs JSON that will be used in all.html and individual pages
let devConfigsJson = JSON.stringify(Object.entries(adConfigs).map(([name, config]) => ({
    name,
    variants: config.variants ? config.variants.map(v => v.name) : [],
  })));

// Check if the global digads config file exists, and load it if so.
const globalDigadConfigPath = resolve(
  '/usr/local/lib/swansonrussell/digads.json',
);
let visibleHost = null;
let previewJobSettings = {
  jobNumber: '000000',
  jobName: 'job-name',
};

try {
  const jobSettingsContent = await readFile(resolve(baseDirectory, 'job-settings.yaml'), 'utf-8');
  const parsedJobSettings = yaml.load(jobSettingsContent) || {};

  previewJobSettings = {
    jobNumber: parsedJobSettings.jobNumber || '000000',
    jobName: parsedJobSettings.jobName || 'job-name',
  };
} catch {
  // Keep default job settings when preview metadata is unavailable.
}

function buildPreviewTitle(currentAd) {
  const scopeLabel = currentAd && currentAd !== 'all' ? currentAd : 'All Ads';
  return `${previewJobSettings.jobNumber} - ${previewJobSettings.jobName} - ${scopeLabel}`;
}

try {
  const globalDigadConfigFile = await open(globalDigadConfigPath, 'r');

  // Read the file.
  const globalDigadConfig = JSON.parse(
    await globalDigadConfigFile.readFile('utf-8'),
  );
  if (globalDigadConfig.previewBasePath) {
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
  const rootDirectory = dirname(fileURLToPath(import.meta.url)) + '/../../..';
  const replayIconSvg = readReplayIconSvg(rootDirectory);
  const previewToolbarScript = await readFile(resolve(rootDirectory, 'lib/vite/all-view/preview-toolbar.js'), 'utf-8');

  // Build grouped cards for all sizes and all their versions
  const allCardsHtml = Object.entries(adConfigs).map(([adSize, config]) => {
    const variants = config.variants || [];
    const allVersions = ['index', ...variants.map(v => v.name)];
    
    // For preview, adjust hrefs to be relative to preview root
    const cardsHtml = allVersions.map(variantName => {
      const label = variantName === 'index' ? 'Base' : variantName;
      const href = variantName === 'index'
        ? `./${adSize}/index.html`
        : `./${adSize}/${variantName}.html`;
      
      const { adWidth, adHeight } = (() => {
        const sizeMatch = adSize.match(/^(\d+)x(\d+)/);
        return {
          adWidth: sizeMatch ? parseInt(sizeMatch[1], 10) : 300,
          adHeight: sizeMatch ? parseInt(sizeMatch[2], 10) : 250,
        };
      })();
      
      const previewSrc = href + '?notoolbar=1';
      
      return '<a class="version-card" href="' + href + '" aria-label="View ' + label + ' version">' +
        '<div class="version-card-inner">' +
          '<div class="version-label">' +
            '<span class="version-label-text">' + label + '</span>' +
            '<button class="version-replay-btn" type="button" title="Replay ad" aria-label="Replay ' + label + ' version" data-replay-href="' + href + '">' + replayIconSvg + '</button>' +
          '</div>' +
          '<div class="version-preview" style="position:relative;display:block;overflow:hidden;background:var(--dev-ad-content-bg, #1B1C1D);width:' + adWidth + 'px;height:' + adHeight + 'px;">' +
            '<div class="version-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;background:var(--dev-ad-content-bg, #1B1C1D);">' +
              '<div class="spinner"></div>' +
            '</div>' +
            '<iframe src="' + previewSrc + '" data-preview-src="' + previewSrc + '" width="' + adWidth + '" height="' + adHeight + '" tabindex="-1" loading="eager" style="display:block;border:none;background:transparent;"></iframe>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');

    return '<section class="size-group" data-size-group="' + adSize + '">' +
      '<h2 class="size-group-title">' + accordionItemIconSvg + '<span class="size-group-title-text">' + adSize + '</span></h2>' +
      '<div class="size-group-grid">' + cardsHtml + '</div>' +
    '</section>';
  }).join('');


  // Generate the all.html using the render helper
  const allHtml = renderAllViewHtml({
    title: buildPreviewTitle('all'),
    bodyContent: allCardsHtml,
    devConfigsJson,
    currentAd: 'all',
    currentVariant: null,
    grouped: true,
    toolbarScript: previewToolbarScript,
  });

  await writeFile(resolve('./preview/all.html'), allHtml, 'utf-8');
  console.log(chalk.blueBright('Generated preview/all.html with all ad sizes and versions'));

  // Generate per-size all.html files
  for (const [adSize, config] of Object.entries(adConfigs)) {
    const variants = config.variants || [];
    const allVersions = ['index', ...variants.map(v => v.name)];
    
    // For per-size previews, use relative paths within each size directory
    const versionCardsHtml = allVersions.map(variantName => {
      const label = variantName === 'index' ? 'Base' : variantName;
      const href = variantName === 'index'
        ? './index.html'
        : './' + variantName + '.html';
      
      const { adWidth, adHeight } = (() => {
        const sizeMatch = adSize.match(/^(\d+)x(\d+)/);
        return {
          adWidth: sizeMatch ? parseInt(sizeMatch[1], 10) : 300,
          adHeight: sizeMatch ? parseInt(sizeMatch[2], 10) : 250,
        };
      })();
      
      const previewSrc = href + '?notoolbar=1';
      
      return '<a class="version-card" href="' + href + '" aria-label="View ' + label + ' version">' +
        '<div class="version-card-inner">' +
          '<div class="version-label">' +
            '<span class="version-label-text">' + label + '</span>' +
            '<button class="version-replay-btn" type="button" title="Replay ad" aria-label="Replay ' + label + ' version" data-replay-href="' + href + '">' + replayIconSvg + '</button>' +
          '</div>' +
          '<div class="version-preview" style="position:relative;display:block;overflow:hidden;background:var(--dev-ad-content-bg, #1B1C1D);width:' + adWidth + 'px;height:' + adHeight + 'px;">' +
            '<div class="version-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;background:var(--dev-ad-content-bg, #1B1C1D);">' +
              '<div class="spinner"></div>' +
            '</div>' +
            '<iframe src="' + previewSrc + '" data-preview-src="' + previewSrc + '" width="' + adWidth + '" height="' + adHeight + '" tabindex="-1" loading="eager" style="display:block;border:none;background:transparent;"></iframe>' +
          '</div>' +
        '</div>' +
      '</a>';
    }).join('');

    const sizeAllHtml = renderAllViewHtml({
      title: buildPreviewTitle(adSize),
      bodyContent: versionCardsHtml,
      devConfigsJson,
      currentAd: adSize,
      currentVariant: 'all',
      grouped: false,
      toolbarScript: previewToolbarScript,
    });

    const sizePreviewDir = resolve(`./preview/${adSize}`);
    await writeFile(resolve(sizePreviewDir, 'all.html'), sizeAllHtml, 'utf-8');
    console.log(chalk.blueBright(`Generated preview/${adSize}/all.html`));
  }
} catch (error) {
  console.error(chalk.redBright('Error generating all.html:'), error.message);
}

  // Inject devConfigsJson into individual built ad pages
  try {

    for (const [adSize, config] of Object.entries(adConfigs)) {
      const sizePreviewDir = resolve(`./preview/${adSize}`);
    
      // Find all HTML files in this size's preview directory
      if (!existsSync(sizePreviewDir)) continue;
    
      const files = readdirSync(sizePreviewDir).filter(f => f.endsWith('.html') && f !== 'all.html');
    
      for (const file of files) {
        const filePath = resolve(sizePreviewDir, file);
        let htmlContent = await readFile(filePath, 'utf-8');
      
        // Extract the variant name from the file (index.html -> null, variant.html -> 'variant')
        const variantName = file === 'index.html' ? null : file.replace('.html', '');
      
        // Inject the devConfigsJson script
        const configScript = `<script>
          window.__DEV_AD_CONFIGS__ = ${devConfigsJson};
          window.__DEV_CURRENT_AD__ = "${adSize}";
          window.__DEV_CURRENT_VARIANT__ = ${variantName ? `"${variantName}"` : 'null'};
        </script>`;

        const previewTitle = buildPreviewTitle(adSize);

        if (htmlContent.includes('<title>') && htmlContent.includes('</title>')) {
          htmlContent = htmlContent.replace(/<title>[\s\S]*?<\/title>/, `<title>${previewTitle}</title>`);
        }
      
        // Insert after opening body tag or at the start of body content
        if (htmlContent.includes('</head>')) {
          htmlContent = htmlContent.replace('</head>', configScript + '\n  </head>');
        } else if (htmlContent.includes('<body')) {
          // Find the closing > of body tag and insert after it
          const bodyMatch = htmlContent.match(/<body[^>]*>/);
          if (bodyMatch) {
            htmlContent = htmlContent.replace(bodyMatch[0], bodyMatch[0] + '\n  ' + configScript);
          }
        }
      
        await writeFile(filePath, htmlContent, 'utf-8');
      }
    
      console.log(chalk.blueBright(`Injected configs into preview/${adSize}/ HTML files`));
    }
  } catch (error) {
    console.error(chalk.redBright('Error injecting configs into individual ad pages:'), error.message);
  }
