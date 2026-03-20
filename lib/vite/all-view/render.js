import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

import {
  fallbackReplayIconSvg,
  previewLoaderScript,
  previewLoaderStyles,
  renderThemeStyles,
} from './assets.js';

const _renderDir = dirname(fileURLToPath(import.meta.url));
let chevronDownIconSvg;
try {
  chevronDownIconSvg = readFileSync(resolve(_renderDir, '../../dev-mode/icons/chevron-down.svg'), 'utf-8')
    .replace(/\s+/g, ' ')
    .trim()
    .replace('<svg', '<svg class="size-group-title-chevron"');
} catch (e) {
  // Fallback if file read fails
  chevronDownIconSvg = '<svg class="size-group-title-chevron" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>';
}

function renderAccordionTitle(label) {
  return chevronDownIconSvg + '<span class="size-group-title-text">' + label + '</span>';
}

export function readReplayIconSvg(rootDirectory) {
  try {
    return readFileSync(resolve(rootDirectory, 'lib/dev-mode/icons/replay.svg'), 'utf-8')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    return fallbackReplayIconSvg;
  }
}

function renderVersionCard(label, href, adWidth, adHeight, replayIconSvg) {
  const previewSrc = href + '?notoolbar=1';

  return '<a class="version-card" href="' + href + '" aria-label="View ' + label + ' version">' +
    '<div class="version-card-inner">' +
      '<div class="version-label">' +
        '<span class="version-label-text">' + label + '</span>' +
        '<button class="version-replay-btn" type="button" title="Replay ad" aria-label="Replay ' + label + ' version">' + replayIconSvg + '</button>' +
      '</div>' +
      '<div class="version-preview" style="position:relative;display:block;overflow:hidden;background:var(--dev-ad-content-bg, #1B1C1D);width:' + adWidth + 'px;height:' + adHeight + 'px;">' +
        '<div class="version-loading" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:2;background:var(--dev-ad-content-bg, #1B1C1D);">' +
          '<div class="spinner"></div>' +
        '</div>' +
        '<iframe src="' + previewSrc + '" data-preview-src="' + previewSrc + '" width="' + adWidth + '" height="' + adHeight + '" tabindex="-1" loading="eager" style="display:block;border:none;background:transparent;"></iframe>' +
      '</div>' +
    '</div>' +
  '</a>';
}

function getAdDimensions(adSize) {
  const sizeMatch = adSize.match(/^(\d+)x(\d+)/);

  return {
    adWidth: sizeMatch ? parseInt(sizeMatch[1], 10) : 300,
    adHeight: sizeMatch ? parseInt(sizeMatch[2], 10) : 250,
  };
}

export function renderCardsForAdSize(adSize, variantNames, replayIconSvg) {
  const { adWidth, adHeight } = getAdDimensions(adSize);

  return variantNames.map((variantName) => {
    const label = variantName === 'index' ? 'Base' : variantName;
    const href = variantName === 'index'
      ? '/' + adSize + '/index.html'
      : '/' + adSize + '/' + variantName + '.html';

    return renderVersionCard(label, href, adWidth, adHeight, replayIconSvg);
  }).join('');
}

export function renderAllViewHtml({ title, bodyContent, devConfigsJson, currentAd, currentVariant, grouped = false, toolbarScript = null }) {
  const defaultToolbarScript = '<script type="module" src="/lib/dev-mode/toolbar.ts"></script>';
  const toolbarAsset = toolbarScript ? `<script>${toolbarScript}</script>` : defaultToolbarScript;
  const accordionEnabled = grouped || currentVariant === 'all';
  const renderedBodyContent = accordionEnabled && !grouped
    ? '<section class="size-group" data-size-group="' + currentAd + '">' +
      '<h2 class="size-group-title">' + renderAccordionTitle(currentAd + ' Versions') + '</h2>' +
      '<div class="size-group-grid">' + bodyContent + '</div>' +
      '</section>'
    : bodyContent;
  const accordionScript = accordionEnabled ? `<script>
    (() => {
      const STORAGE_PREFIX = 'dev-all-view-section-';

      const sectionKey = (section, index) => {
        const size = section.getAttribute('data-size-group');
        if (size) return STORAGE_PREFIX + size;

        const title = section.querySelector('.size-group-title');
        const fallback = (title?.textContent || '').trim() || String(index + 1);
        return STORAGE_PREFIX + fallback;
      };

      const applyExpandedState = (section, title, expanded) => {
        section.classList.toggle('collapsed', !expanded);
        title.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      };

      const toggleSection = (section, title, key) => {
        const nextExpanded = section.classList.contains('collapsed');
        applyExpandedState(section, title, nextExpanded);
        localStorage.setItem(key, nextExpanded ? 'open' : 'collapsed');
      };

      const setupGroupedAccordion = () => {
        const sections = Array.from(document.querySelectorAll('.grid.grouped .size-group'));

        sections.forEach((section, index) => {
          const title = section.querySelector('.size-group-title');
          if (!title) return;

          const key = sectionKey(section, index);
          const savedState = localStorage.getItem(key);

          title.setAttribute('role', 'button');
          title.setAttribute('tabindex', '0');

          if (savedState === 'collapsed') {
            applyExpandedState(section, title, false);
          } else {
            applyExpandedState(section, title, true);
          }

          title.addEventListener('click', () => {
            toggleSection(section, title, key);
          });

          title.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            toggleSection(section, title, key);
          });
        });
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupGroupedAccordion, { once: true });
      } else {
        setupGroupedAccordion();
      }
    })();
  </script>` : '';
  const fontPath = currentAd === 'all'
    ? '../lib/dev-mode/fonts/proxima-vara/proxima_vara.woff2'
    : '../../lib/dev-mode/fonts/proxima-vara/proxima_vara.woff2';
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        ${renderThemeStyles(fontPath)}
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html.dev-layout-pending body {
          opacity: 0;
        }
        body {
          font-family: var(--dev-ui-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
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
          padding: 0 20px 20px;
        }
        .grid.grouped {
          width: 100%;
          flex-direction: column;
          flex-wrap: nowrap;
          gap: 0;
        }
        .grid.grouped .size-group {
          padding-top: 0;
        }
        .size-group {
          width: 100%;
        }
        .size-group-title {
          color: var(--dev-text-muted, #ADB0B3);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 18px 0;
        }
        .size-group-title-text {
          color: inherit;
        }
        .size-group-title-chevron {
          width: 12px;
          height: 12px;
          min-width: 12px;
          min-height: 12px;
          flex-shrink: 0;
          display: block;
          stroke: var(--dev-text-faint, #696E71);
          stroke-width: 1.5;
          transition: transform 0.2s ease, stroke 0.2s ease;
        }
        .grid.grouped .size-group-title {
          position: sticky;
          top: 0;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 -20px 0;
          padding: 10px 20px;
          background: var(--dev-bg-secondary, #181819);
          border-bottom: 1px solid var(--dev-border, #222324);
          cursor: pointer;
          user-select: none;
          line-height: 1;
          transition: color 0.2s ease, background-color 0.2s ease;
        }
        .grid.grouped .size-group-title:hover {
          background: var(--dev-bg-hover, #222324);
          color: var(--dev-text-secondary, #CFD1D2);
        }
        .grid.grouped .size-group-title:hover .size-group-title-chevron {
          stroke: var(--dev-text-secondary, #CFD1D2);
        }
        .grid.grouped .size-group-title:focus-visible {
          outline: 2px solid var(--dev-accent, #909090);
          outline-offset: -2px;
        }
        .grid.grouped .size-group.collapsed .size-group-title {
          margin-bottom: 0;
        }
        .grid.grouped .size-group.collapsed .size-group-title .size-group-title-chevron {
          transform: rotate(-90deg);
        }
        .grid.grouped .size-group.collapsed .size-group-grid {
          display: none;
        }
        .size-group-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 24px;
          align-items: flex-start;
          padding: 4px 0 22px;
        }
        .version-card {
          display: block;
          text-decoration: none;
          color: inherit;
          position: relative;
          cursor: pointer;
        }
        .version-card-inner {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .version-card .version-preview {
          overflow: hidden;
          background: var(--dev-bg-secondary, #181819);
          box-shadow: 0 4px 12px var(--dev-shadow, rgba(0,0,0,0.3));
          transition: filter 0.2s ease;
        }
        .version-card:hover .version-preview {
          filter: brightness(1.12);
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
          padding: 0;
          color: var(--dev-text-muted, #888);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: color 0.3s ease;
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
      ${accordionScript}
      <script>
        window.__DEV_AD_CONFIGS__ = ${devConfigsJson};
        window.__DEV_CURRENT_AD__ = ${JSON.stringify(currentAd)};
        window.__DEV_CURRENT_VARIANT__ = ${currentVariant === null ? 'null' : JSON.stringify(currentVariant)};
        window.__DEV_PREVIEW_MODE__ = true;
      </script>
      ${toolbarAsset}
    </head>
    <body>
      <div class="grid${accordionEnabled ? ' grouped' : ''}">
        ${renderedBodyContent}
      </div>
    </body>
    </html>`;
}