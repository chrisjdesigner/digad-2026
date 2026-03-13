import {
  chevronDownIcon,
  codeBracketIcon,
  swatchIcon,
  photoIcon,
  typographyIcon,
  adjustmentsIcon,
  plusIcon,
  settingsIcon,
  squaresIcon,
  layersIcon,
  trashIcon,
} from '../toolbar/icons';
import type { AdConfig } from '../toolbar/types';
import { sidebarStyles } from './styles';

const TAB_STORAGE_KEY = 'dev-sidebar-tab';

function getSavedTab(): string {
  return localStorage.getItem(TAB_STORAGE_KEY) || 'project';
}

export function createSidebarElement(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): HTMLDivElement {
  const savedTab = getSavedTab();
  const projectActive = savedTab === 'project';

  const ad = adConfigs.find(a => a.name === currentAd);
  const variants = ad?.variants || [];

  const sidebar = document.createElement('div');
  sidebar.id = 'dev-settings-tray';
  sidebar.innerHTML = `
    <style>${sidebarStyles}</style>
    <div class="sidebar-resize-handle"></div>
    <div class="sidebar-tabs">
      <button class="sidebar-tab${projectActive ? ' active' : ''}" data-tab="project">${settingsIcon.replace('<svg', '<svg class="sidebar-tab-icon"')} Project</button>
      <button class="sidebar-tab${!projectActive ? ' active' : ''}" data-tab="variables">${adjustmentsIcon.replace('<svg', '<svg class="sidebar-tab-icon"')} Version Variables</button>
    </div>
    <div class="sidebar-tab-panel${projectActive ? ' active' : ''}" data-panel="project">
      <div class="tray-content">
        <div class="var-section" data-project-section="job-details">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${settingsIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Job Details</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="project-fields">
              <div class="project-field">
                <label class="project-field-label" for="dev-job-number">Job Number</label>
                <div class="project-field-input-wrap">
                  <input type="text" class="project-field-input" id="dev-job-number" placeholder="000000" />
                </div>
              </div>
              <div class="project-field">
                <label class="project-field-label" for="dev-job-name">Job Name</label>
                <div class="project-field-input-wrap">
                  <input type="text" class="project-field-input" id="dev-job-name" placeholder="job-name" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="var-section" data-project-section="ad-sizes">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${squaresIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Ad Sizes</span>
              <span class="var-section-count">(${adConfigs.length})</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="project-list" id="dev-ad-sizes-list">
              ${adConfigs.map(a => `
                <div class="project-list-item${a.name === currentAd ? ' active' : ''}" data-ad-size="${a.name}">
                  <a class="project-list-item-link" href="/${a.name}/index.html">${a.name}</a>
                  <button class="project-list-item-action delete-ad-size" data-ad-size="${a.name}" title="Delete ${a.name}">${trashIcon}</button>
                </div>
              `).join('')}
            </div>
            <button class="add-var-btn-bottom" id="dev-add-size-btn">${plusIcon} Add Size</button>
          </div>
        </div>
        <div class="var-section" data-project-section="versions">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${layersIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">${currentAd} Versions</span>
              <span class="var-section-count">(${variants.length + 1})</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="project-list" id="dev-versions-list">
              <div class="project-list-item${!currentVariant || currentVariant === '' ? ' active' : ''}" data-version="">
                <a class="project-list-item-link" href="/${currentAd}/index.html">Base</a>
              </div>
              ${variants.map(v => `
                <div class="project-list-item${v === currentVariant ? ' active' : ''}" data-version="${v}">
                  <a class="project-list-item-link" href="/${currentAd}/${v}.html">${v}</a>
                  <button class="project-list-item-action delete-version" data-version="${v}" title="Delete ${v}">${trashIcon}</button>
                </div>
              `).join('')}
            </div>
            <button class="add-var-btn-bottom" id="dev-add-version-btn">${plusIcon} Add Version</button>
          </div>
        </div>
      </div>
    </div>
    <div class="sidebar-tab-panel${!projectActive ? ' active' : ''}" data-panel="variables">
      <div class="tray-content">
        <div class="var-section" data-type="template">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${codeBracketIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Template Variables</span>
              <span class="var-section-count" id="template-count">(0)</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="var-list" id="template-vars-list">
              <div class="empty-message">No template variables defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="template">${plusIcon} Add Template Variable</button>
            <div class="add-var-form">
              <input type="text" class="add-var-input var-name-input" placeholder="Variable name" />
              <input type="text" class="add-var-input var-value-input" placeholder="Default value" />
              <button class="add-var-submit">Add to All Versions</button>
              <button class="add-var-cancel">Cancel</button>
            </div>
          </div>
        </div>
        <div class="var-section" data-type="css-colors">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${swatchIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Colors</span>
              <span class="var-section-count" id="colors-count">(0)</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="var-list" id="css-colors-list">
              <div class="empty-message">No color variables defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-colors">${plusIcon} Add Color Variable</button>
            <div class="add-var-form" data-use-color-picker="true">
              <input type="text" class="add-var-input var-name-input" placeholder="Variable name (e.g., bg-color)" />
              <input type="color" class="add-var-color var-value-input" value="#ffffff" />
              <button class="add-var-submit">Add to All Versions</button>
              <button class="add-var-cancel">Cancel</button>
            </div>
          </div>
        </div>
        <div class="var-section" data-type="css-images">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${photoIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Images</span>
              <span class="var-section-count" id="images-count">(0)</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="var-list" id="css-images-list">
              <div class="empty-message">No image variables defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-images">${plusIcon} Add Image Variable</button>
            <div class="add-var-form" data-use-image-picker="true">
              <input type="text" class="add-var-input var-name-input" placeholder="Variable name (e.g., hero-image)" />
              <select class="add-var-input var-image-select">
                <option value="">Loading images...</option>
              </select>
              <button class="add-var-submit">Add to All Versions</button>
              <button class="add-var-cancel">Cancel</button>
            </div>
            <div class="sprite-subsection">
              <div class="sprite-subsection-header">
                <span class="sprite-subsection-title">Sprite Images</span>
                <span class="sprite-subsection-count" id="sprites-count">(0)</span>
              </div>
              <div class="sprite-list" id="sprite-images-list">
                <div class="empty-message">No sprite images found</div>
              </div>
            </div>
          </div>
        </div>
        <div class="var-section" data-type="css-typography">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${typographyIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Typography</span>
              <span class="var-section-count" id="typography-count">(0)</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="var-list" id="css-typography-list">
              <div class="empty-message">No typography variables defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-typography">${plusIcon} Add Typography Variable</button>
            <div class="add-var-form">
              <input type="text" class="add-var-input var-name-input" placeholder="Variable name (e.g., headline-size)" />
              <input type="text" class="add-var-input var-value-input" placeholder="Default value (e.g., 24px)" />
              <button class="add-var-submit">Add to All Versions</button>
              <button class="add-var-cancel">Cancel</button>
            </div>
          </div>
        </div>
        <div class="var-section" data-type="css-other">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${adjustmentsIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Other</span>
              <span class="var-section-count" id="other-count">(0)</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="var-list" id="css-other-list">
              <div class="empty-message">No other CSS variables defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-other">${plusIcon} Add CSS Variable</button>
            <div class="add-var-form">
              <input type="text" class="add-var-input var-name-input" placeholder="Variable name" />
              <input type="text" class="add-var-input var-value-input" placeholder="Default value" />
              <button class="add-var-submit">Add to All Versions</button>
              <button class="add-var-cancel">Cancel</button>
            </div>
          </div>
        </div>
      </div>
      <div class="sync-notice">
        <strong>Note:</strong> Adding or removing variables syncs across all versions in this ad size. Value changes only affect the current version.
      </div>
    </div>
  `;

  return sidebar;
}
