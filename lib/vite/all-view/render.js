import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  fallbackReplayIconSvg,
  previewLoaderScript,
  previewLoaderStyles,
  themeStyles,
} from './assets.js';

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
  return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        ${themeStyles}
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
        .grid.grouped {
          flex-direction: column;
          flex-wrap: nowrap;
          gap: 28px;
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
        .version-card .version-preview {
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
          padding: 12px 16px;
          background: var(--dev-bg-tertiary, #222);
          color: var(--dev-text-muted, #888);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: color 0.3s ease, background 0.3s ease;
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
        window.__DEV_CURRENT_AD__ = ${JSON.stringify(currentAd)};
        window.__DEV_CURRENT_VARIANT__ = ${currentVariant === null ? 'null' : JSON.stringify(currentVariant)};
        window.__DEV_PREVIEW_MODE__ = true;
      </script>
      ${toolbarAsset}
    </head>
    <body>
      <div class="grid${grouped ? ' grouped' : ''}">
        ${bodyContent}
      </div>
    </body>
    </html>`;
}