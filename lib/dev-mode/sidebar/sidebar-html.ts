import {
  settingsIcon,
  chevronDownIcon,
  codeBracketIcon,
  swatchIcon,
  photoIcon,
  typographyIcon,
  adjustmentsIcon,
  plusIcon,
} from '../toolbar/icons';
import { sidebarStyles } from './styles';

export function createSidebarElement(
  currentAd: string,
  currentVariant: string | null,
): HTMLDivElement {
  const sidebar = document.createElement('div');
  sidebar.id = 'dev-settings-tray';
  sidebar.innerHTML = `
    <style>${sidebarStyles}</style>
    <div class="sidebar-resize-handle"></div>
    <div class="tray-header">
      <span class="tray-title" id="tray-title">${settingsIcon} ${currentAd} ${currentVariant ? currentVariant.toUpperCase() : 'Base'} Variables</span>
    </div>
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
  `;

  return sidebar;
}
