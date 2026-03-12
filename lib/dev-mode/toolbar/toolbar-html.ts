import type { AdConfig } from './types';
import { cameraIcon, sunIcon, moonIcon } from './icons';
import { toolbarStyles } from './styles';

const THEME_STORAGE_KEY = 'dev-theme';

function getSavedTheme(): string {
  return localStorage.getItem(THEME_STORAGE_KEY) || 'dark';
}

export function createToolbarElement(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): HTMLDivElement {
  const savedTheme = getSavedTheme();
  const isDark = savedTheme === 'dark';

  const toolbar = document.createElement('div');
  toolbar.id = 'dev-toolbar';
  toolbar.innerHTML = `
    <style>${toolbarStyles}</style>
        
    <div class="toolbar-group">
      <select id="dev-size-select">
        ${adConfigs.map(ad => `
          <option value="${ad.name}" ${ad.name === currentAd ? 'selected' : ''}>${ad.name}</option>
        `).join('')}
        <option value="all" ${currentAd === 'all' ? 'selected' : ''}>All</option>
      </select>
    </div>
    
    ${currentAd !== 'all' && currentVariant !== 'all' ? `
    <div class="toolbar-group">
      <select id="dev-version-select">
        <!-- Options populated dynamically -->
      </select>
    </div>
    ` : ''}
        
    <div class="toolbar-spacer"></div>

    <div class="toolbar-group">
      <button id="dev-theme-toggle" title="Toggle light/dark mode">
        <span class="theme-icon-dark">${moonIcon}</span>
        <span class="theme-icon-light">${sunIcon}</span>
      </button>
    </div>
    
    ${currentAd !== 'all' && currentVariant !== 'all' ? `
    <div class="toolbar-group">
      <button id="dev-screenshot-btn" title="Save screenshot to statics folder">${cameraIcon} Take a Screenshot</button>
    </div>
    ` : ''}
  `;

  // Apply saved theme
  document.documentElement.setAttribute('data-dev-theme', savedTheme);

  // Wire up theme toggle
  const toggleBtn = toolbar.querySelector('#dev-theme-toggle') as HTMLButtonElement;
  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-dev-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-dev-theme', next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  });

  return toolbar;
}
