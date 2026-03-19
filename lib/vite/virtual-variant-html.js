import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import {
  readReplayIconSvg,
  renderCardsForAdSize,
  renderAllViewHtml,
} from './all-view/render.js';

/**
 * Vite plugin that automatically generates variant HTML files on-the-fly.
 *
 * Instead of requiring separate HTML files for each variant (v2.html, v3.html, etc.),
 * this plugin intercepts requests for variant HTML files and serves the index.html
 * content, which then gets the correct config applied via handlebars.
 *
 * How it works:
 * 1. Request comes in for /300x250/v2.html
 * 2. Plugin checks if v2.config.yaml (or .json) exists
 * 3. If yes, reads index.html and transforms it with the v2 URL context
 * 4. Handlebars plugin applies v2 config based on the URL
 *
 * @param {Object} adConfigs - The loaded ad configurations
 * @param {string} rootDirectory - The project root directory
 * @returns {import('vite').Plugin}
 */
export function virtualVariantHtmlPlugin(adConfigs, rootDirectory) {
  const replayIconSvg = readReplayIconSvg(rootDirectory);

  return {
    name: 'virtual-variant-html',
    configureServer(server) {
      // Run BEFORE Vite's internal middleware (don't return a function)
      server.middlewares.use(async (req, res, next) => {
        // Check if this is an HTML request for a variant
        const fullUrl = req.url || '';
        // Strip query string for matching
        const url = fullUrl.split('?')[0];

        // Handle global "all" page - shows all sizes and all versions
        if (url === '/all.html') {
          // Build grouped cards for all sizes and all their versions
          const allCardsHtml = Object.entries(adConfigs).map(([adSize, config]) => {
            const variants = config.variants || [];
            const allVersions = ['index', ...variants.map(v => v.name)];
            const cardsHtml = renderCardsForAdSize(adSize, allVersions, replayIconSvg);

            return '<section class="size-group">' +
              '<h2 class="size-group-title">' + adSize + '</h2>' +
              '<div class="size-group-grid">' + cardsHtml + '</div>' +
            '</section>';
          }).join('');

          const devConfigsJson = JSON.stringify(Object.entries(adConfigs).map(([name, config]) => ({
            name,
            variants: config.variants ? config.variants.map(v => v.name) : [],
          })));
          const allHtml = renderAllViewHtml({
            title: 'All Ads - All Versions',
            bodyContent: allCardsHtml,
            devConfigsJson,
            currentAd: 'all',
            currentVariant: null,
            grouped: true,
          });
          
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          res.end(allHtml);
          return;
        }

        // Match pattern: /[adSize]/[variant].html (but not index.html)
        const match = url.match(/^\/(\d+x\d+(?:-\w+)?)\/([^/]+)\.html$/);

        if (!match) {
          return next();
        }

        const [, adSize, variantName] = match;

        // Skip index.html - that should be served normally
        if (variantName === 'index') {
          return next();
        }

        // Check if this variant exists in the config
        const adConfig = adConfigs[adSize];
        if (!adConfig) {
          return next();
        }

        // Handle "all" page - shows all versions in a grid
        if (variantName === 'all') {
          const variants = adConfig.variants || [];
          const allVersions = ['index', ...variants.map(v => v.name)];
          const versionCardsHtml = renderCardsForAdSize(adSize, allVersions, replayIconSvg);

          const devConfigsJson = JSON.stringify(Object.entries(adConfigs).map(([name, config]) => ({
            name,
            variants: config.variants ? config.variants.map(v => v.name) : [],
          })));
          const allHtml = renderAllViewHtml({
            title: adSize + ' - All Versions',
            bodyContent: versionCardsHtml,
            devConfigsJson,
            currentAd: adSize,
            currentVariant: 'all',
            grouped: false,
          });
          
          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          res.end(allHtml);
          return;
        }

        const variantExists = adConfig.variants?.some(
          (v) => v.name === variantName,
        );

        if (!variantExists) {
          return next();
        }

        // Read the index.html content
        const indexPath = resolve(rootDirectory, adSize, 'index.html');

        if (!existsSync(indexPath)) {
          return next();
        }

        try {
          const indexContent = readFileSync(indexPath, 'utf-8');

          // Transform the HTML through Vite's pipeline (including handlebars)
          // Use the original variant URL so handlebars applies the correct context
          const transformedHtml = await server.transformIndexHtml(
            url,
            indexContent,
          );

          res.setHeader('Content-Type', 'text/html');
          res.statusCode = 200;
          res.end(transformedHtml);
        } catch (error) {
          console.error('Error transforming variant HTML:', error);
          next(error);
        }
      });
    },

    // For build mode, we need to handle this differently
    // by generating the variant HTML files as virtual modules
    resolveId(id) {
      // Match pattern: [adSize]/[variant].html
      const match = id.match(/^(\d+x\d+(?:-\w+)?)\/([^/]+)\.html$/);

      if (!match) return null;

      const [, adSize, variantName] = match;

      if (variantName === 'index') return null;

      const adConfig = adConfigs[adSize];
      if (!adConfig) return null;

      const variantExists = adConfig.variants?.some(
        (v) => v.name === variantName,
      );

      if (variantExists) {
        return `\0virtual:${id}`;
      }

      return null;
    },

    load(id) {
      if (!id.startsWith('\0virtual:')) return null;

      const realId = id.slice('\0virtual:'.length);
      const match = realId.match(/^(\d+x\d+(?:-\w+)?)\/([^/]+)\.html$/);

      if (!match) return null;

      const [, adSize] = match;
      const indexPath = resolve(rootDirectory, adSize, 'index.html');

      if (existsSync(indexPath)) {
        return readFileSync(indexPath, 'utf-8');
      }

      return null;
    },
  };
}
