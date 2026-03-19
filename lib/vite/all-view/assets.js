export const fallbackReplayIconSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clip-rule="evenodd" /></svg>';

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