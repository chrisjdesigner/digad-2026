export const fallbackReplayIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clip-rule="evenodd" /></svg>';

export const themeStyles = `
  :root, [data-dev-theme="dark"] {
    --dev-bg-primary: #111213;
    --dev-bg-secondary: #181819;
    --dev-bg-tertiary: #1B1C1D;
    --dev-bg-hover: #222324;
    --dev-bg-section: #1B1C1D;
    --dev-bg-input: #181819;
    --dev-border: #222324;
    --dev-border-input: #2B2C2E;
    --dev-border-hover: #353738;
    --dev-text-primary: #F5F6F6;
    --dev-text-secondary: #CFD1D2;
    --dev-text-muted: #ADB0B3;
    --dev-text-dimmed: #84898C;
    --dev-text-faint: #696E71;
    --dev-shadow: rgba(0, 0, 0, 0.3);
    --dev-ad-content-bg: #1B1C1D;
    --dev-accent: #909090;
    --dev-accent-hover: #f0f0f0;
    --dev-danger: #e33e3e;
    --dev-primary-action: #F47723;
    --dev-resize-active: rgba(184, 184, 184, 1);
    --dev-spinner-track: #2B2C2E;
    --dev-overlay: rgba(0, 0, 0, 0.7);
    --gsdt-bg-primary: #181819;
    --gsdt-bg-secondary: rgba(24, 24, 25, 0.95);
    --gsdt-bg-track: #2B2C2E;
    --gsdt-text-primary: var(--dev-text-dimmed);
    --gsdt-text-secondary: var(--dev-text-faint);
    --gsdt-icon-primary: var(--dev-text-dimmed);
    --gsdt-icon-muted: color-mix(in srgb, var(--dev-text-faint) 85%, white 15%);
    --gsdt-icon-subtle: rgba(173, 176, 179, 0.15);
    --gsdt-border: #2B2C2E;
    --gsdt-accent-play: var(--dev-text-dimmed);
    --gsdt-accent-marker: var(--dev-text-faint);
  }

  [data-dev-theme="light"] {
    --dev-bg-primary: #F5F6F6;
    --dev-bg-secondary: #FAFAFA;
    --dev-bg-tertiary: #F0F1F1;
    --dev-bg-hover: #EAEBEB;
    --dev-bg-section: #FAFAFA;
    --dev-bg-input: #FAFAFA;
    --dev-border: #E6E7E7;
    --dev-border-input: #E6E7E7;
    --dev-border-hover: #CFD1D2;
    --dev-text-primary: #2B2E2F;
    --dev-text-secondary: #434547;
    --dev-text-muted: #696E71;
    --dev-text-dimmed: #84898C;
    --dev-text-faint: #ADB0B3;
    --dev-shadow: rgba(0, 0, 0, 0.06);
    --dev-ad-content-bg: #EAEBEB;
    --dev-accent: #afafaf;
    --dev-accent-hover: #c5c5c4;
    --dev-danger: #B90000;
    --dev-primary-action: #F47723;
    --dev-resize-active: rgb(209, 209, 209);
    --dev-spinner-track: #DCDEDE;
    --dev-overlay: rgba(255, 255, 255, 0.7);
    --gsdt-bg-primary: #f0f0f0;
    --gsdt-bg-secondary: rgba(240, 240, 240, 0.95);
    --gsdt-bg-track: #ccc;
    --gsdt-text-primary: var(--dev-text-dimmed);
    --gsdt-text-secondary: var(--dev-text-faint);
    --gsdt-icon-primary: var(--dev-text-dimmed);
    --gsdt-icon-muted: color-mix(in srgb, var(--dev-text-faint) 50%, white 50%);
    --gsdt-icon-subtle: rgba(0, 0, 0, 0.15);
    --gsdt-border: #ddd;
    --gsdt-accent-play: color-mix(in srgb, var(--dev-text-dimmed) 60%, white 40%);
    --gsdt-accent-marker: color-mix(in srgb, var(--dev-text-muted) 60%, white 40%);
  }
`;

export const previewLoaderStyles = `
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
  .version-label {
    gap: 10px;
  }
  .version-label-text {
    min-width: 0;
  }
  .version-replay-btn {
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid var(--dev-border, #2B2C2E);
    border-radius: 9999px;
    background: var(--dev-bg-secondary, #181819);
    color: var(--dev-text-muted, #ADB0B3);
    width: 26px;
    aspect-ratio: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }
  .version-replay-btn:hover {
    color: var(--dev-text-primary, #F5F6F6);
    background: var(--dev-bg-hover, #222324);
    border-color: var(--dev-border-hover, #353738);
  }
  .version-replay-btn:focus-visible {
    outline: 2px solid var(--dev-accent, #909090);
    outline-offset: 2px;
  }
  .version-replay-btn svg {
    width: 14px;
    height: 14px;
    display: block;
  }
`;

export const previewLoaderScript = `
  (() => {
    const revealCard = (card) => {
      if (card.dataset.previewReady === '1') return;
      card.dataset.previewReady = '1';

      // Delay reveal slightly to avoid a flash of unstyled frame content.
      window.setTimeout(() => {
        card.classList.add('is-ready');
      }, 140);
    };

    const setCardLoading = (card) => {
      card.dataset.previewReady = '0';
      card.classList.remove('is-ready');
    };

    const appendReplayToken = (src) => {
      if (!src) return src;
      const token = '_replay=' + Date.now();
      return src.includes('?') ? src + '&' + token : src + '?' + token;
    };

    const bindPreviewLoading = () => {
      document.querySelectorAll('.version-card').forEach((card) => {
        if (card.dataset.previewBound === '1') return;
        card.dataset.previewBound = '1';

        const frame = card.querySelector('iframe');
        if (!frame) return;

        const replayBtn = card.querySelector('.version-replay-btn');

        const baseSrc = frame.dataset.previewSrc || frame.getAttribute('src') || '';

        frame.addEventListener('load', () => {
          requestAnimationFrame(() => revealCard(card));
        });

        frame.addEventListener('error', () => {
          revealCard(card);
        });

        if (replayBtn && baseSrc) {
          replayBtn.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            setCardLoading(card);
            frame.setAttribute('src', appendReplayToken(baseSrc));
          });
        }

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