import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';

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
          // Build cards for all sizes and all their versions
          const allCardsHtml = Object.entries(adConfigs).map(([adSize, config]) => {
            const variants = config.variants || [];
            const allVersions = ['index', ...variants.map(v => v.name)];
            
            // Parse ad dimensions from folder name
            const sizeMatch = adSize.match(/^(\d+)x(\d+)/);
            const adWidth = sizeMatch ? parseInt(sizeMatch[1]) : 300;
            const adHeight = sizeMatch ? parseInt(sizeMatch[2]) : 250;
            
            // Build version cards for this size
            return allVersions.map(v => {
              const label = v === 'index' ? 'Base' : v;
              const href = v === 'index' ? '/' + adSize + '/index.html' : '/' + adSize + '/' + v + '.html';
              return '<a class="version-card" href="' + href + '">' +
                '<div class="version-card-inner">' +
                  '<div class="version-label">' +
                    '<span>' + adSize + ' - ' + label + '</span>' +
                  '</div>' +
                  '<iframe src="' + href + '?notoolbar=1" width="' + adWidth + '" height="' + adHeight + '" tabindex="-1"></iframe>' +
                '</div>' +
              '</a>';
            }).join('');
          }).join('');

          const devConfigsJson = JSON.stringify(Object.entries(adConfigs).map(([name, config]) => ({
            name,
            variants: config.variants ? config.variants.map(v => v.name) : [],
          })));
          
          const allHtml = `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>All Ads - All Versions</title>
              <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: var(--dev-ad-content-bg, #1a1a1a);
                  min-height: 100vh;
                }
                .grid {
                  display: flex;
                  flex-wrap: wrap;
                  gap: 24px;
                  justify-content: flex-start;
                  align-items: flex-start;
                  padding: 20px;
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
                .open-arrow {
                  color: var(--dev-accent, #0078d4);
                  font-size: 12px;
                }
                iframe {
                  display: block;
                  border: none;
                  background: #fff;
                }
              </style>
              <script>
                window.__DEV_AD_CONFIGS__ = ${devConfigsJson};
                window.__DEV_CURRENT_AD__ = 'all';
                window.__DEV_CURRENT_VARIANT__ = null;
              </script>
              <script type="module" src="/lib/dev-mode/toolbar.ts"></script>
            </head>
            <body>
              <div class="grid">
                ${allCardsHtml}
              </div>
            </body>
            </html>`;
          
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
          
          // Parse ad dimensions from folder name
          const sizeMatch = adSize.match(/^(\d+)x(\d+)/);
          const adWidth = sizeMatch ? parseInt(sizeMatch[1]) : 300;
          const adHeight = sizeMatch ? parseInt(sizeMatch[2]) : 250;
          
          // Build version cards HTML
          const versionCardsHtml = allVersions.map(v => {
            const label = v === 'index' ? 'Base' : v;
            const href = v === 'index' ? '/' + adSize + '/index.html' : '/' + adSize + '/' + v + '.html';
            return '<a class="version-card" href="' + href + '">' +
              '<div class="version-card-inner">' +
                '<div class="version-label">' +
                  '<span>' + label + '</span>' +
                '</div>' +
                '<iframe src="' + href + '?notoolbar=1" width="' + adWidth + '" height="' + adHeight + '" tabindex="-1"></iframe>' +
              '</div>' +
            '</a>';
          }).join('');

          const devConfigsJson = JSON.stringify(Object.entries(adConfigs).map(([name, config]) => ({
            name,
            variants: config.variants ? config.variants.map(v => v.name) : [],
          })));
          
          const allHtml = `<!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${adSize} - All Versions</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--dev-ad-content-bg, #1a1a1a);
                min-height: 100vh;
              }
              .grid {
                display: flex;
                flex-wrap: wrap;
                gap: 24px;
                justify-content: flex-start;
                align-items: flex-start;
                padding: 20px;
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
              .version-card:hover .version-label span:first-child {
                color: var(--dev-text-primary, #fff);
              }
              .version-card iframe {
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
              .open-arrow {
                color: var(--dev-accent, #0078d4);
                font-size: 12px;
              }
              iframe {
                display: block;
                border: none;
                background: #fff;
              }
            </style>
            <script>
              window.__DEV_AD_CONFIGS__ = ${devConfigsJson};
              window.__DEV_CURRENT_AD__ = '${adSize}';
              window.__DEV_CURRENT_VARIANT__ = 'all';
            </script>
            <script type="module" src="/lib/dev-mode/toolbar.ts"></script>
          </head>
          <body>
            <div class="grid">
              ${versionCardsHtml}
            </div>
          </body>
          </html>`;
          
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
