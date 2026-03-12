import type { AdConfig } from './types';
import { cameraIcon } from './icons';
import { toolbarStyles } from './styles';

export function createToolbarElement(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): HTMLDivElement {
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
    
    <div class="toolbar-group">
      <select id="dev-version-select">
        <!-- Options populated dynamically -->
      </select>
    </div>
        
    <div class="toolbar-spacer"></div>
    
    ${currentAd !== 'all' && currentVariant !== 'all' ? `
    <div class="toolbar-group">
      <button id="dev-screenshot-btn" title="Save screenshot to statics folder">${cameraIcon} Take a Screenshot</button>
    </div>
    ` : ''}
  `;

  return toolbar;
}
