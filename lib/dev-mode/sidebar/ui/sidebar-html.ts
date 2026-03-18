import {
  chevronDownIcon,
  codeBracketIcon,
  swatchIcon,
  photoIcon,
  typographyIcon,
  adjustmentsIcon,
  variableIcon,
  plusIcon,
  settingsIcon,
  squaresIcon,
  layersIcon,
  trashIcon,
} from '../../toolbar/ui/icons';
import type { AdConfig } from '../../toolbar/models/types';
import { sidebarStyles } from './styles';
import { modalStyles } from '../../modals';

const TAB_STORAGE_KEY = 'dev-sidebar-tab';
const SECTION_STORAGE_PREFIX = 'dev-section-';

function getSavedTab(): string {
  return localStorage.getItem(TAB_STORAGE_KEY) || 'project';
}

function isSectionCollapsed(sectionId: string): boolean {
  return localStorage.getItem(SECTION_STORAGE_PREFIX + sectionId) === 'collapsed';
}

function toInitialCap(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function createSidebarElement(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): HTMLDivElement {
  const isAllView = currentAd === 'all' || currentVariant === 'all';
  const versionLabel = currentVariant && currentVariant !== '' ? toInitialCap(currentVariant) : 'Base';
  const variablesTabLabel = `${versionLabel} Variables`;
  const savedTab = isAllView ? 'project' : getSavedTab();
  const projectActive = savedTab === 'project';

  const ad = adConfigs.find(a => a.name === currentAd);
  const variants = ad?.variants || [];

  const sidebar = document.createElement('div');
  sidebar.id = 'dev-settings-tray';
  sidebar.innerHTML = `
    <style>${sidebarStyles}${modalStyles}</style>
    <div class="sidebar-resize-handle"></div>
    <div class="sidebar-tabs">
      <button class="sidebar-tab${projectActive ? ' active' : ''}" data-tab="project">${settingsIcon.replace('<svg', '<svg class="sidebar-tab-icon"')} Project</button>
      ${!isAllView ? `<button class="sidebar-tab${!projectActive ? ' active' : ''}" data-tab="variables" title="${variablesTabLabel}">${adjustmentsIcon.replace('<svg', '<svg class="sidebar-tab-icon"')} <span class="sidebar-tab-label">${variablesTabLabel}</span></button>` : ''}
    </div>
    <div class="sidebar-tab-panel${projectActive ? ' active' : ''}" data-panel="project">
      <div class="tray-content">
        <div class="var-section${isSectionCollapsed('job-details') ? ' collapsed' : ''}" data-project-section="job-details">
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
              <div class="project-field project-toggle-field">
                <div class="project-toggle-row">
                  <label class="project-field-label project-toggle-label" for="dev-delay-hover-toggle">Delay Hover Until Animation Ends</label>
                  <label class="theme-switch" for="dev-delay-hover-toggle" title="Delay hover animation until intro animation completes">
                    <input type="checkbox" id="dev-delay-hover-toggle" />
                    <span class="theme-switch-track">
                      <span class="theme-switch-thumb"></span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="var-section${isSectionCollapsed('ad-sizes') ? ' collapsed' : ''}" data-project-section="ad-sizes">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${squaresIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Ad Sizes</span>
              <span class="var-section-count">(${adConfigs.length})</span>
            </div>
            <a class="var-section-view-all" href="/all.html" title="View all sizes">View All</a>
          </div>
          <div class="var-section-body">
            <div class="project-list" id="dev-ad-sizes-list">
              ${adConfigs.map(a => `
                <div class="project-list-item${a.name === currentAd ? ' active' : ''}" data-ad-size="${a.name}">
                  <a class="project-list-item-link" href="/${a.name}/index.html">${a.name}</a>
                  <button class="project-list-item-action delete-ad-size" data-ad-size="${a.name}" title="Delete ${a.name}"${adConfigs.length <= 1 ? ' disabled' : ''}>${trashIcon}</button>
                </div>
              `).join('')}
            </div>
            <button class="add-var-btn-bottom" id="dev-add-size-btn">${plusIcon} Add Size</button>
          </div>
        </div>
        ${currentAd !== 'all' ? `
        <div class="var-section${isSectionCollapsed('versions') ? ' collapsed' : ''}" data-project-section="versions">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${layersIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">${currentAd} Versions</span>
              <span class="var-section-count">(${variants.length + 1})</span>
            </div>
            <a class="var-section-view-all" href="/${currentAd}/all.html" title="View all versions">View All</a>
          </div>
          <div class="var-section-body">
            <div class="project-list" id="dev-versions-list">
              <div class="project-list-item${!currentVariant || currentVariant === '' ? ' active' : ''}" data-version="">
                <a class="project-list-item-link" href="/${currentAd}/index.html">Base</a>
                <button class="project-list-item-action delete-version" disabled title="Cannot delete base version">${trashIcon}</button>
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
        ` : ''}
      </div>
    </div>
    <div class="sidebar-tab-panel${!projectActive ? ' active' : ''}" data-panel="variables">
      <div class="tray-content">
        <div class="var-section${isSectionCollapsed('template') ? ' collapsed' : ''}" data-type="template">
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
              <div class="empty-message">No variables have been defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="template">${plusIcon} Add Template Variable</button>
            <div class="add-var-form">
              <div class="add-var-form-inputs">
                <input type="text" class="add-var-input var-name-input" placeholder="Variable name" />
                <input type="text" class="add-var-input var-value-input" placeholder="Default value" />
              </div>
              <div class="add-var-form-actions">
                <button class="add-var-cancel">Cancel</button>
              </div>
            </div>
          </div>
        </div>
        <div class="var-section${isSectionCollapsed('css-colors') ? ' collapsed' : ''}" data-type="css-colors">
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
              <div class="empty-message">No variables have been defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-colors">${plusIcon} Add Color Variable</button>
            <div class="add-var-form" data-use-color-picker="true">
              <div class="add-var-form-inputs">
                <input type="text" class="add-var-input var-name-input" placeholder="Variable name (e.g., bg-color)" />
                <div class="add-var-color-input-wrapper">
                  <input type="color" class="add-var-color-picker" tabindex="-1" value="#ffffff" />
                  <input type="text" class="add-var-input var-value-input" placeholder="#ffffff" />
                </div>
              </div>
              <div class="add-var-form-actions">
                <button class="add-var-cancel">Cancel</button>
              </div>
            </div>
          </div>
        </div>
        <div class="var-section${isSectionCollapsed('css-images') ? ' collapsed' : ''}" data-type="css-images">
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
              <div class="empty-message">No variables have been defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-images">${plusIcon} Add Image Variable</button>
            <div class="add-var-form" data-use-image-picker="true">
              <div class="add-var-form-inputs">
                <input type="text" class="add-var-input var-name-input" placeholder="Variable name (e.g., hero-image)" />
                <select class="add-var-input var-image-select">
                  <option value="">Loading images...</option>
                </select>
              </div>
              <div class="add-var-form-actions">
                <button class="add-var-cancel">Cancel</button>
              </div>
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
        <div class="var-section${isSectionCollapsed('css-typography') ? ' collapsed' : ''}" data-type="css-typography">
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
              <div class="empty-message">No variables have been defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-typography">${plusIcon} Add Typography Variable</button>
            <div class="add-var-form">
              <div class="add-var-form-inputs">
                <input type="text" class="add-var-input var-name-input" placeholder="Variable name (e.g., headline-size)" />
                <input type="text" class="add-var-input var-value-input" placeholder="Default value (e.g., 24px)" />
              </div>
              <div class="add-var-form-actions">
                <button class="add-var-cancel">Cancel</button>
              </div>
            </div>
          </div>
        </div>
        <div class="var-section${isSectionCollapsed('css-other') ? ' collapsed' : ''}" data-type="css-other">
          <div class="var-section-header">
            <div class="var-section-header-left">
              ${chevronDownIcon.replace('<svg', '<svg class="var-section-chevron"')}
              ${variableIcon.replace('<svg', '<svg class="var-section-icon"')}
              <span class="var-section-title">Other</span>
              <span class="var-section-count" id="other-count">(0)</span>
            </div>
          </div>
          <div class="var-section-body">
            <div class="var-list" id="css-other-list">
              <div class="empty-message">No variables have been defined</div>
            </div>
            <button class="add-var-btn-bottom" data-section="css-other">${plusIcon} Add CSS Variable</button>
            <div class="add-var-form">
              <div class="add-var-form-inputs">
                <input type="text" class="add-var-input var-name-input" placeholder="Variable name" />
                <input type="text" class="add-var-input var-value-input" placeholder="Default value" />
              </div>
              <div class="add-var-form-actions">
                <button class="add-var-cancel">Cancel</button>
              </div>
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
