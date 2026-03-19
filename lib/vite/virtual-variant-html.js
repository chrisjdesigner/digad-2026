import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, basename } from 'path';

const previewLoaderStyles = `
  .version-preview {
    position: relative;
    background: var(--dev-ad-content-bg, #1B1C1D);
  }
  .version-card iframe {
    position: relative;
    z-index: 1;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.22s ease;
    background: transparent;
  }
  .version-card.is-ready iframe {
    opacity: 1;
    visibility: visible;
  }
  .version-loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--dev-ad-content-bg, #1B1C1D);
    transition: opacity 0.2s ease, visibility 0.2s ease;
    pointer-events: none;
  }
  .version-card.is-ready .version-loading {
    opacity: 0;
    visibility: hidden;
  }
  .version-loading .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid var(--dev-spinner-track, #2B2C2E);
    border-top-color: var(--dev-accent, #909090);
    border-radius: 50%;
    animation: preview-spin 0.7s linear infinite;
  }
  @keyframes preview-spin {
    to { transform: rotate(360deg); }
  }
`;

const previewLoaderScript = `
  (() => {
    const revealCard = (card) => {
      if (card.dataset.previewReady === '1') return;
      card.dataset.previewReady = '1';

      // Delay reveal slightly to avoid a flash of unstyled frame content.
      window.setTimeout(() => {
        card.classList.add('is-ready');
      }, 140);
    };

    const bindPreviewLoading = () => {
      document.querySelectorAll('.version-card').forEach((card) => {
        const frame = card.querySelector('iframe');
        if (!frame) return;

        frame.addEventListener('load', () => {
          requestAnimationFrame(() => revealCard(card));
        }, { once: true });

        frame.addEventListener('error', () => {
          revealCard(card);
        }, { once: true });

        try {
          if (frame.contentDocument?.readyState === 'complete') {
            revealCard(card);
          }
        } catch {
          // Ignore cross-document access while frame is navigating.
        }
      });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bindPreviewLoading, { once: true });
    } else {
      bindPreviewLoading();
    }
  })();
`;

function renderVersionCard(label, href, adWidth, adHeight) {
  return '<a class="version-card" href="' + href + '">' +
    '<div class="version-card-inner">' +
      '<div class="version-label">' +
        '<span>' + label + '</span>' +
      '</div>' +
      '<div class="version-preview" style="position:relative;display:block;overflow:hidden;background:var(--dev-ad-content-bg, #1B1C1D);width:' + adWidth + 'px;height:' + adHeight + 'px;">' +
        '<div class="version-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;background:var(--dev-ad-content-bg, #1B1C1D);">' +
          '<div class="spinner"></div>' +
        '</div>' +
        '<iframe src="' + href + '?notoolbar=1" width="' + adWidth + '" height="' + adHeight + '" tabindex="-1" loading="eager" style="display:block;border:none;background:transparent;"></iframe>' +
      '</div>' +
    '</div>' +
  '</a>';
}

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
          // Build grouped cards for all sizes and all their versions
          const allCardsHtml = Object.entries(adConfigs).map(([adSize, config]) => {
            const variants = config.variants || [];
            const allVersions = ['index', ...variants.map(v => v.name)];
            
            // Parse ad dimensions from folder name
            const sizeMatch = adSize.match(/^(\d+)x(\d+)/);
            const adWidth = sizeMatch ? parseInt(sizeMatch[1]) : 300;
            const adHeight = sizeMatch ? parseInt(sizeMatch[2]) : 250;
            
            // Build version cards for this size
            const cardsHtml = allVersions.map(v => {
              const label = v === 'index' ? 'Base' : v;
              const href = v === 'index' ? '/' + adSize + '/index.html' : '/' + adSize + '/' + v + '.html';
              return renderVersionCard(label, href, adWidth, adHeight);
            }).join('');

            return '<section class="size-group">' +
              '<h2 class="size-group-title">' + adSize + '</h2>' +
              '<div class="size-group-grid">' + cardsHtml + '</div>' +
            '</section>';
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
                html.dev-layout-pending body {
                  opacity: 0;
                }
                body {
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                  background: var(--dev-ad-content-bg, #1a1a1a);
                  min-height: 100vh;
                  transition: opacity 0.08s linear;
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
                ${previewLoaderStyles}
              </style>
              <script>
                document.documentElement.classList.add('dev-layout-pending');
              </script>
              <script>
                ${previewLoaderScript}
              </script>
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
            return renderVersionCard(label, href, adWidth, adHeight);
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
              html.dev-layout-pending body {
                opacity: 0;
              }
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                background: var(--dev-ad-content-bg, #1a1a1a);
                min-height: 100vh;
                transition: opacity 0.08s linear;
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
              ${previewLoaderStyles}
            </style>
            <script>
              document.documentElement.classList.add('dev-layout-pending');
            </script>
            <script>
              ${previewLoaderScript}
            </script>
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
