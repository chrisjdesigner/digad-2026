// Preview all-view toolbar using the same structure, IDs, theme key, and styling as dev mode.
(() => {
  const THEME_STORAGE_KEY = 'dev-theme';
  const toolbarStyles = `
    #dev-toolbar {
      position: relative;
      top: 0;
      left: 0;
      height: 48px;
      background: var(--dev-bg-primary);
      display: flex;
      align-items: center;
      padding: 0 18px;
      gap: 10px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 13px;
      flex-shrink: 0;
      border-bottom: 1px solid var(--dev-border);
    }
    #dev-toolbar label {
      color: var(--dev-text-muted);
      font-size: 11px;
      letter-spacing: 0.5px;
    }
    #dev-toolbar select {
      appearance: none;
      -webkit-appearance: none;
      background: var(--dev-bg-secondary);
      border: 1px solid var(--dev-border);
      border-radius: 9999px;
      transition: all 0.2s;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 10px center;
      background-size: 14px;
      font-weight: 700;
      color: var(--dev-text-muted);
      padding: 6px 33px 6px 15px;
      font-size: 13px;
      cursor: pointer;
    }
    #dev-toolbar select:hover {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23fff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
      color: var(--dev-text-secondary);
      border-color: var(--dev-border-hover) !important;
      background-color: var(--dev-bg-hover);
    }
    [data-dev-theme="light"] #dev-toolbar select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
    }
    [data-dev-theme="light"] #dev-toolbar select:hover {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23111'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
    }
    #dev-toolbar select:focus {
      outline: none;
      border-color: var(--dev-accent);
    }
    #dev-toolbar .toolbar-group {
      display: flex;
      align-items: center;
      gap: 0;
    }
    #dev-toolbar .toolbar-brand {
      padding-right: 6px;
      margin-right: 2px;
    }
    #dev-toolbar .toolbar-brand-logo {
      display: inline-flex;
      align-items: center;
      color: var(--dev-text-primary);
    }
    #dev-toolbar .toolbar-brand-logo svg {
      display: block;
      width: 18px;
      height: auto;
      max-height: 28px;
    }
    #dev-toolbar .toolbar-spacer {
      flex: 1;
    }
    .theme-switch {
      position: relative;
      display: inline-flex;
      align-items: center;
      cursor: pointer;
      margin: 0;
      padding: 0;
    }
    .theme-switch input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }
    .theme-switch-track {
      position: relative;
      width: 52px;
      height: 28px;
      background: var(--dev-bg-secondary);
      border-radius: 14px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      border: 1px solid var(--dev-border);
    }
    .theme-switch:hover .theme-switch-track {
      border-color: var(--dev-border-hover);
      background: var(--dev-bg-hover);
    }
    .theme-switch input:checked ~ .theme-switch-track {
      background: var(--dev-bg-hover);
    }
    .theme-switch-thumb {
      position: absolute;
      left: 3px;
      width: 22px;
      height: 22px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .theme-switch input:checked ~ .theme-switch-track .theme-switch-thumb {
      transform: translateX(24px);
    }
    .theme-switch-icon {
      display: none;
      align-items: center;
      justify-content: center;
    }
    .theme-switch-icon svg {
      width: 14px;
      height: 14px;
    }
    .theme-switch-icon--moon {
      display: flex;
      color: #2a2a2a;
    }
    .theme-switch-icon--sun {
      display: none;
    }
    .theme-switch input:checked ~ .theme-switch-track .theme-switch-icon--moon {
      display: none;
    }
    .theme-switch input:checked ~ .theme-switch-track .theme-switch-icon--sun {
      display: flex;
    }
  `;

  const srLogoIcon = '<svg xmlns="http://www.w3.org/2000/svg" width="43.382" height="65" viewBox="0 0 43.382 65" fill="none"><path data-name="logo-icon" d="M43.382,52.313,32.9,46.364l9.11-5.16a2.7,2.7,0,0,0,1.369-2.348V32.846A2.7,2.7,0,0,0,42.013,30.5L15.357,15.4a.665.665,0,0,1,0-1.157L20.033,11.6a3.364,3.364,0,0,1,3.314,0L43.382,22.943v-12.7L28.433,1.777a13.687,13.687,0,0,0-13.489,0L1.369,9.467A2.7,2.7,0,0,0,0,11.814V17.83a2.7,2.7,0,0,0,1.369,2.348L28.023,35.271a.665.665,0,0,1,0,1.157l-4.675,2.648a3.365,3.365,0,0,1-3.315,0L2.335,29.052A1.564,1.564,0,0,0,0,30.413v23.5l11.054,6.265V46.7L43.382,65Z" transform="translate(0 0)" fill="currentColor"/></svg>';
  const sunIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/></svg>';
  const moonIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/></svg>';

  function releasePendingLayout() {
    document.documentElement.classList.remove('dev-layout-pending');
  }

  function getSavedTheme() {
    return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
  }

  function getAllAdsHref(currentAd) {
    return currentAd === 'all' ? './all.html' : '../all.html';
  }

  function getSizeHref(currentAd, newSize) {
    if (newSize === 'all') {
      return getAllAdsHref(currentAd);
    }

    return currentAd === 'all'
      ? `./${newSize}/all.html`
      : `../${newSize}/all.html`;
  }

  function getVersionHref(newVersion) {
    if (newVersion === 'all') {
      return './all.html';
    }

    if (newVersion) {
      return `./${newVersion}.html`;
    }

    return './index.html';
  }

  function createToolbar() {
    try {
      const adConfigs = window.__DEV_AD_CONFIGS__ || [];
      const currentAd = window.__DEV_CURRENT_AD__ || 'all';
      const currentVariant = window.__DEV_CURRENT_VARIANT__ || null;
      const savedTheme = getSavedTheme();
      const isDark = savedTheme === 'dark';

      document.documentElement.setAttribute('data-dev-theme', savedTheme);

      if (document.getElementById('dev-toolbar')) {
        releasePendingLayout();
        return;
      }

      const toolbar = document.createElement('div');
      toolbar.id = 'dev-toolbar';
      toolbar.innerHTML = `
        <style>${toolbarStyles}</style>
        <div class="toolbar-group toolbar-brand" aria-label="SR logo">
          <span class="toolbar-brand-logo">${srLogoIcon}</span>
        </div>
        <div class="toolbar-group">
          <select id="dev-size-select">
            ${adConfigs.map((ad) => `<option value="${ad.name}" ${ad.name === currentAd ? 'selected' : ''}>${ad.name}</option>`).join('')}
            <option value="all" ${currentAd === 'all' ? 'selected' : ''}>All</option>
          </select>
        </div>
        ${currentAd !== 'all' ? `
        <div class="toolbar-group">
          <select id="dev-version-select"></select>
        </div>
        ` : ''}
        <div class="toolbar-spacer"></div>
        <div class="toolbar-group">
          <label class="theme-switch" title="Toggle light/dark mode">
            <input type="checkbox" id="dev-theme-toggle" ${isDark ? '' : 'checked'}>
            <span class="theme-switch-track">
              <span class="theme-switch-thumb">
                <span class="theme-switch-icon theme-switch-icon--sun">${sunIcon}</span>
                <span class="theme-switch-icon theme-switch-icon--moon">${moonIcon}</span>
              </span>
            </span>
          </label>
        </div>
      `;

      document.body.insertBefore(toolbar, document.body.firstChild);

      const sizeSelect = document.getElementById('dev-size-select');
      const versionSelect = document.getElementById('dev-version-select');
      const toggleCheckbox = document.getElementById('dev-theme-toggle');

      if (toggleCheckbox) {
        toggleCheckbox.addEventListener('change', () => {
          const next = toggleCheckbox.checked ? 'light' : 'dark';
          document.documentElement.setAttribute('data-dev-theme', next);
          localStorage.setItem(THEME_STORAGE_KEY, next);
        });
      }

      function updateVersionOptions(adName) {
        if (!versionSelect) return;

        if (adName === 'all') {
          versionSelect.style.display = 'none';
          return;
        }

        versionSelect.style.display = '';

        const ad = adConfigs.find((entry) => entry.name === adName);
        const variants = ad?.variants || [];

        versionSelect.innerHTML = `
          <option value="">Base</option>
          ${variants.map((variant) => `<option value="${variant}" ${variant === currentVariant ? 'selected' : ''}>${variant}</option>`).join('')}
          <option value="all" ${currentVariant === 'all' ? 'selected' : ''}>All</option>
        `;
      }

      updateVersionOptions(currentAd);

      if (sizeSelect) {
        sizeSelect.addEventListener('change', () => {
          window.location.href = getSizeHref(currentAd, sizeSelect.value);
        });
      }

      if (versionSelect) {
        versionSelect.addEventListener('change', () => {
          window.location.href = getVersionHref(versionSelect.value);
        });
      }

      releasePendingLayout();
    } catch (error) {
      console.error('Preview toolbar error:', error);
      releasePendingLayout();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createToolbar, { once: true });
  } else {
    createToolbar();
  }
})();
