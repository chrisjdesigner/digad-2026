/**
 * Dev Mode Toolbar
 * Provides navigation between ad sizes and versions during development.
 * This code is only loaded in dev mode and never included in builds.
 */

export {}; // Make this a module

interface AdConfig {
  name: string;
  variants?: string[];
}

declare global {
  interface Window {
    __DEV_AD_CONFIGS__: AdConfig[];
    __DEV_CURRENT_AD__: string;
    __DEV_CURRENT_VARIANT__: string | null;
  }
}

function createToolbar() {
  const adConfigs = window.__DEV_AD_CONFIGS__ || [];
  const currentAd = window.__DEV_CURRENT_AD__ || '';
  const currentVariant = window.__DEV_CURRENT_VARIANT__ || null;

  // Create toolbar container
  const toolbar = document.createElement('div');
  toolbar.id = 'dev-toolbar';
  toolbar.innerHTML = `
    <style>
      #dev-toolbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 46px;
        background: #111111;
        display: flex;
        align-items: center;
        padding: 0 6px;
        gap: 0;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      }
      
      #dev-toolbar label {
        color: #888;
        font-size: 11px;
        letter-spacing: 0.5px;
      }
      
      #dev-toolbar select {
        background: transparent;
        border: none;
        color: #888;
        padding: 6px 10px;
        font-size: 13px;
        cursor: pointer;
      }
      
      #dev-toolbar select:hover {
        border-color: #5a5a5a;
      }
      
      #dev-toolbar select:focus {
        outline: none;
        border-color: #0078d4;
      }
      
      #dev-toolbar .toolbar-group {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      #dev-toolbar .toolbar-divider {
        width: 1px;
        height: 24px;
        background: #191919;
        margin: 0 8px;
      }
      
      /* Push body content down to make room for toolbar */
      body {
        margin-top: 40px !important;
      }
    </style>
    
    <div class="toolbar-group">
      <select id="dev-size-select">
        ${adConfigs.map(ad => `
          <option value="${ad.name}" ${ad.name === currentAd ? 'selected' : ''}>${ad.name}</option>
        `).join('')}
      </select>
    </div>
    
    <div class="toolbar-divider"></div>
    
    <div class="toolbar-group">
      <select id="dev-version-select">
        <!-- Options populated dynamically -->
      </select>
    </div>
  `;

  document.body.prepend(toolbar);

  // Get select elements
  const sizeSelect = document.getElementById('dev-size-select') as HTMLSelectElement;
  const versionSelect = document.getElementById('dev-version-select') as HTMLSelectElement;

  // Populate version options based on current ad
  function updateVersionOptions(adName: string) {
    const ad = adConfigs.find(a => a.name === adName);
    const variants = ad?.variants || [];
    
    versionSelect.innerHTML = `
      <option value="">Base</option>
      ${variants.map(v => `
        <option value="${v}" ${v === currentVariant ? 'selected' : ''}>${v}</option>
      `).join('')}
    `;
  }

  // Initialize version options
  updateVersionOptions(currentAd);

  // Handle size change
  sizeSelect.addEventListener('change', () => {
    const newSize = sizeSelect.value;
    // Navigate to base version of new size
    window.location.href = `/${newSize}/index.html`;
  });

  // Handle version change
  versionSelect.addEventListener('change', () => {
    const newVersion = versionSelect.value;
    if (newVersion) {
      window.location.href = `/${currentAd}/${newVersion}.html`;
    } else {
      window.location.href = `/${currentAd}/index.html`;
    }
  });
}

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createToolbar);
} else {
  createToolbar();
}
