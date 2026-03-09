/**
 * Dev Mode Toolbar
 * Provides navigation between ad sizes and versions during development.
 * This code is only loaded in dev mode and never included in builds.
 */

export {}; // Make this a module

import html2canvas from 'html2canvas-pro';
import cameraIcon from './icons/camera.svg?raw';
import checkIcon from './icons/check.svg?raw';
import chevronDownIcon from './icons/chevron-down.svg?raw';
import chevronRightIcon from './icons/chevron-right.svg?raw';
import editIcon from './icons/edit.svg?raw';
import settingsIcon from './icons/settings.svg?raw';
import closeIcon from './icons/close.svg?raw';
import plusIcon from './icons/plus.svg?raw';
import trashIcon from './icons/trash.svg?raw';
import copyIcon from './icons/copy.svg?raw';
import codeBracketIcon from './icons/code-bracket.svg?raw';
import swatchIcon from './icons/swatch.svg?raw';
import photoIcon from './icons/photo.svg?raw';
import typographyIcon from './icons/typography.svg?raw';
import adjustmentsIcon from './icons/adjustments.svg?raw';

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
  // Skip toolbar if ?notoolbar=1 is in the URL (used for iframe previews)
  if (new URLSearchParams(window.location.search).get('notoolbar') === '1') {
    return;
  }

  const adConfigs = window.__DEV_AD_CONFIGS__ || [];
  const currentAd = window.__DEV_CURRENT_AD__ || '';
  const currentVariant = window.__DEV_CURRENT_VARIANT__ || null;

  // Create toolbar container
  const toolbar = document.createElement('div');
  toolbar.id = 'dev-toolbar';
  toolbar.innerHTML = `
    <style>
      #dev-toolbar {
        position: relative;
        top: 0;
        left: 0;
        margin-bottom: 20px;
        height: 46px;
        background: #111111;
        display: flex;
        align-items: center;
        padding: 0 6px;
        gap: 10px;
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
        appearance: none;
        -webkit-appearance: none;
        background: transparent;
        transition: all 0.2s;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 4px center;
        background-size: 14px;
        border: none;
        font-weight: 700;
        color: #888;
        padding: 6px 24px 6px 10px;
        font-size: 13px;
        cursor: pointer;
      }
      
      #dev-toolbar select:hover {
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23fff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
        color: #fff;
      }
      
      #dev-toolbar select:focus {
        outline: none;
        border-color: #0078d4;
      }
      
      #dev-toolbar input[type="text"] {
        background: transparent;
        border: none;
        border-radius: 4px;
        color: #888;
        padding: 5px 8px;
        font-size: 12px;
        font-family: inherit;
        display: inline-flex;
        width: auto;
        min-width: 50px;
        transition: all 0.2s;
        font-weight: 700;
      }
      
      #dev-toolbar input[type="text"]:hover,
      #dev-toolbar input[type="text"]:focus {
        outline: none;
        color: #fff;
      }
      
      #dev-toolbar input[type="text"]::placeholder {
        color: #555;
      }
      
      #dev-toolbar .edit-btn {
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.4;
        transition: opacity 0.2s;
      }
      
      #dev-toolbar .edit-btn:hover {
        opacity: 1;
      }
      
      #dev-toolbar .edit-btn svg {
        width: 14px;
        height: 14px;
        stroke: #888;
      }
      
      #dev-toolbar .edit-btn:hover svg {
        stroke: #fff;
      }
      
      #dev-toolbar .input-prefix {
        color: #888;
        font-size: 12px;
        font-weight: 700;
        margin-left: 4px;
      }
      
      #dev-toolbar .input-label {
        color: #666;
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-right: 4px;
      }
      
      #dev-toolbar .toolbar-group {
        display: flex;
        align-items: center;
        gap: 0;
      }
      
      #dev-toolbar .toolbar-divider {
        width: 1px;
        height: 24px;
        background: #191919;
        margin: 0 8px;
      }
      
      #dev-toolbar .toolbar-spacer {
        flex: 1;
      }
      
      #dev-toolbar button {
        background: transparent;
        border: none;
        color: #888;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      #dev-toolbar button svg {
        width: 16px;
        height: 16px;
        stroke: #888;
        transition: stroke 0.2s;
      }
      
      #dev-toolbar button:hover {
        // background: #222;
        border-color: #444;
        color: #aaa;
      }
      
      #dev-toolbar button:hover svg {
        stroke: #fff;
      }
      
      #dev-toolbar button:active {
        background: #333;
      }
      
      #dev-toolbar button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      #dev-toolbar .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #555;
        border-top-color: #888;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
    
    <div class="toolbar-group">
      <button class="edit-btn" id="dev-edit-job-number" title="Edit job number">${editIcon}</button>
      <input type="text" id="dev-job-number" placeholder="#000000" />
    </div>
    
    <div class="toolbar-group">
      <button class="edit-btn" id="dev-edit-job-name" title="Edit job name">${editIcon}</button>
      <input type="text" id="dev-job-name" placeholder="job-name" />
    </div>
        
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
        
    ${currentAd !== 'all' && currentVariant !== 'all' ? `
    <div class="toolbar-group">
      <button id="dev-screenshot-btn" title="Save screenshot to statics folder">${cameraIcon} Take a Screenshot</button>
    </div>
    ` : ''}
    
    <div class="toolbar-spacer"></div>
    
    ${currentAd !== 'all' && currentVariant !== 'all' ? `
    <div class="toolbar-group">
      <button id="dev-settings-btn" title="Edit ad config variables">${settingsIcon} Edit ${currentAd} ${currentVariant ? currentVariant.toUpperCase() : 'Base'} Variables</button>
    </div>
    ` : ''}
  `;

  document.body.prepend(toolbar);

  // Create settings tray
  const tray = document.createElement('div');
  tray.id = 'dev-settings-tray';
  tray.innerHTML = `
    <style>
      #dev-settings-tray {
        position: fixed;
        top: 0;
        right: -400px;
        width: 400px;
        height: 100vh;
        background: #1a1a1a;
        box-shadow: -4px 0 20px rgba(0,0,0,0.5);
        z-index: 1000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 13px;
        transition: right 0.3s ease;
        display: flex;
        flex-direction: column;
      }
      
      #dev-settings-tray.open {
        right: 0;
      }
      
      #dev-settings-tray .tray-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid #333;
        background: #222;
      }
      
      #dev-settings-tray .tray-title {
        color: #fff;
        font-size: 15px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      #dev-settings-tray .tray-title svg {
        width: 18px;
        height: 18px;
        stroke: #888;
      }
      
      #dev-settings-tray .tray-close {
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.6;
        transition: opacity 0.2s;
      }
      
      #dev-settings-tray .tray-close:hover {
        opacity: 1;
      }
      
      #dev-settings-tray .tray-close svg {
        width: 20px;
        height: 20px;
        stroke: #888;
      }
      
      #dev-settings-tray .tray-content {
        flex: 1;
        overflow-y: auto;
        padding: 0;
      }
      
      #dev-settings-tray .var-section {
        border-bottom: 1px solid #333;
      }
      
      #dev-settings-tray .var-section.collapsed .var-section-body {
        display: none;
      }
      
      #dev-settings-tray .var-section.disabled .var-section-header,
      #dev-settings-tray .var-section.disabled .var-list {
        opacity: 0.5;
      }
      
      #dev-settings-tray .var-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: #252525;
        cursor: pointer;
        user-select: none;
      }
      
      #dev-settings-tray .var-section-header:hover {
        background: #2a2a2a;
      }
      
      #dev-settings-tray .var-section-header-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      #dev-settings-tray .var-section-icon {
        width: 16px;
        height: 16px;
        stroke: #666;
        flex-shrink: 0;
      }
      
      #dev-settings-tray .var-section-chevron {
        width: 12px;
        height: 12px;
        stroke: #555;
        transition: transform 0.2s;
        flex-shrink: 0;
      }
      
      #dev-settings-tray .var-section.collapsed .var-section-chevron {
        transform: rotate(-90deg);
      }
      
      #dev-settings-tray .var-section-title {
        color: #888;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      #dev-settings-tray .var-section-count {
        color: #555;
        font-size: 10px;
        font-weight: 600;
      }
      
      #dev-settings-tray .var-section-body {
        /* container for var-list and add button */
      }
      
      #dev-settings-tray .var-list {
        padding: 12px 20px 8px;
      }
      
      #dev-settings-tray .var-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }
      
      #dev-settings-tray .var-item:last-child {
        margin-bottom: 0;
      }
      
      #dev-settings-tray .var-name {
        color: #888;
        font-size: 12px;
        font-weight: 600;
        min-width: 100px;
        flex-shrink: 0;
      }
      
      #dev-settings-tray .var-input {
        flex: 1;
        background: #333;
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        padding: 6px 10px;
        font-size: 12px;
        font-family: inherit;
        transition: border-color 0.2s;
      }
      
      #dev-settings-tray .var-input:hover {
        border-color: #555;
      }
      
      #dev-settings-tray .var-input:focus {
        outline: none;
        border-color: #0078d4;
      }
      
      #dev-settings-tray .var-color-input {
        width: 32px;
        height: 28px;
        padding: 2px;
        border: 1px solid #444;
        border-radius: 4px;
        background: #333;
        cursor: pointer;
        flex-shrink: 0;
      }
      
      #dev-settings-tray .var-color-input::-webkit-color-swatch-wrapper {
        padding: 0;
      }
      
      #dev-settings-tray .var-color-input::-webkit-color-swatch {
        border: none;
        border-radius: 2px;
      }
      
      #dev-settings-tray .var-action-btn {
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.3;
        transition: opacity 0.2s;
      }
      
      #dev-settings-tray .var-action-btn:hover {
        opacity: 1;
      }
      
      #dev-settings-tray .var-action-btn svg {
        width: 14px;
        height: 14px;
        stroke: #888;
      }
      
      #dev-settings-tray .var-action-btn.var-delete:hover svg {
        stroke: #ff5555;
      }
      
      #dev-settings-tray .var-action-btn.var-copy:hover svg {
        stroke: #0078d4;
      }
      
      /* Sprite subsection styles */
      #dev-settings-tray .sprite-subsection {
        border-top: 1px solid #333;
        margin-top: 8px;
      }
      
      #dev-settings-tray .sprite-subsection-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 20px 8px;
        color: #666;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      #dev-settings-tray .sprite-subsection-count {
        color: #555;
        font-weight: 400;
      }
      
      #dev-settings-tray .sprite-list {
        padding: 0 20px 12px;
      }
      
      #dev-settings-tray .sprite-item {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 8px;
        background: #2a2a2a;
        border-radius: 4px;
        padding: 8px 10px;
      }
      
      #dev-settings-tray .sprite-item:last-child {
        margin-bottom: 0;
      }
      
      #dev-settings-tray .sprite-name {
        color: #999;
        font-size: 12px;
        font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
        flex: 1;
      }
      
      #dev-settings-tray .sprite-filename {
        color: #555;
        font-size: 10px;
        flex-shrink: 0;
      }
      
      #dev-settings-tray .sprite-copy-btn {
        background: transparent;
        border: none;
        padding: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.4;
        transition: opacity 0.2s;
        flex-shrink: 0;
      }
      
      #dev-settings-tray .sprite-copy-btn:hover {
        opacity: 1;
      }
      
      #dev-settings-tray .sprite-copy-btn svg {
        width: 16px;
        height: 16px;
        stroke: #888;
      }
      
      #dev-settings-tray .sprite-copy-btn:hover svg {
        stroke: #fff;
      }

      #dev-settings-tray .add-var-btn-bottom {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px dashed #444;
        border-radius: 4px;
        color: #666;
        padding: 8px 12px;
        margin: 8px 20px 16px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        width: calc(100% - 40px);
      }
      
      #dev-settings-tray .add-var-btn-bottom:hover {
        border-color: #666;
        color: #888;
        background: #2a2a2a;
      }
      
      #dev-settings-tray .add-var-btn-bottom svg {
        width: 12px;
        height: 12px;
        stroke: currentColor;
      }
      
      #dev-settings-tray .add-var-form {
        display: none;
        padding: 12px 20px;
        background: #222;
        gap: 8px;
        flex-wrap: wrap;
      }
      
      #dev-settings-tray .add-var-form.active {
        display: flex;
      }
      
      #dev-settings-tray .add-var-input {
        flex: 1;
        min-width: 100px;
        background: #333;
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        padding: 6px 10px;
        font-size: 12px;
        font-family: inherit;
      }
      
      #dev-settings-tray .add-var-input:focus {
        outline: none;
        border-color: #0078d4;
      }
      
      #dev-settings-tray .var-image-select {
        flex: 1;
        min-width: 120px;
        background: #333;
        border: 1px solid #444;
        border-radius: 4px;
        color: #fff;
        padding: 6px 10px;
        font-size: 12px;
        font-family: inherit;
        cursor: pointer;
      }
      
      #dev-settings-tray .var-image-select:focus {
        outline: none;
        border-color: #0078d4;
      }
      
      #dev-settings-tray .add-var-color {
        width: 36px;
        height: 30px;
        padding: 2px;
        border: 1px solid #444;
        border-radius: 4px;
        background: #333;
        cursor: pointer;
      }
      
      #dev-settings-tray .add-var-submit {
        background: #0078d4;
        border: none;
        border-radius: 4px;
        color: #fff;
        padding: 6px 12px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.2s;
      }
      
      #dev-settings-tray .add-var-submit:hover {
        background: #0086ee;
      }
      
      #dev-settings-tray .add-var-cancel {
        background: transparent;
        border: 1px solid #555;
        border-radius: 4px;
        color: #888;
        padding: 6px 12px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      #dev-settings-tray .add-var-cancel:hover {
        border-color: #888;
        color: #fff;
      }
      
      #dev-settings-tray .sync-notice {
        padding: 12px 20px;
        background: #252525;
        color: #888;
        font-size: 11px;
        border-top: 1px solid #333;
      }
      
      #dev-settings-tray .sync-notice strong {
        color: #aaa;
      }
      
      #dev-settings-tray .empty-message {
        color: #555;
        font-size: 12px;
        font-style: italic;
        padding: 4px 0;
      }
      
      #dev-settings-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 999999;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }
      
      #dev-settings-overlay.active {
        opacity: 1;
        pointer-events: auto;
      }
    </style>
    <div class="tray-header">
      <span class="tray-title" id="tray-title">${settingsIcon} ${currentAd} ${currentVariant ? currentVariant.toUpperCase() : 'Base'} Variables</span>
      <button class="tray-close" title="Close">${closeIcon}</button>
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

  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'dev-settings-overlay';

  document.body.appendChild(tray);
  document.body.appendChild(overlay);

  // Get elements
  const sizeSelect = document.getElementById('dev-size-select') as HTMLSelectElement;
  const versionSelect = document.getElementById('dev-version-select') as HTMLSelectElement;
  const jobNumberInput = document.getElementById('dev-job-number') as HTMLInputElement;
  const jobNameInput = document.getElementById('dev-job-name') as HTMLInputElement;

  // Helper to resize input to fit text
  const resizeInput = (input: HTMLInputElement) => {
    const value = input.value || input.placeholder || '';
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    span.textContent = value;
    document.body.appendChild(span);
    input.style.width = `${Math.max(span.offsetWidth + 20, 50)}px`;
    document.body.removeChild(span);
  };

  // Load job settings and populate inputs
  fetch('/api/job-settings')
    .then(res => res.json())
    .then(data => {
      jobNumberInput.value = '#' + (data.jobNumber || '');
      jobNameInput.value = data.jobName || '';
      resizeInput(jobNumberInput);
      resizeInput(jobNameInput);
    })
    .catch(err => console.error('Failed to load job settings:', err));

  // Save job settings on blur (strip # from job number)
  const saveJobSettings = () => {
    const jobNumber = jobNumberInput.value.replace(/^#/, '') || '000000';
    // Ensure # is always shown in the input
    if (!jobNumberInput.value.startsWith('#')) {
      jobNumberInput.value = '#' + jobNumber;
      resizeInput(jobNumberInput);
    }
    fetch('/api/job-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobNumber,
        jobName: jobNameInput.value || 'job-name',
      }),
    }).catch(err => console.error('Failed to save job settings:', err));
  };

  jobNumberInput.addEventListener('blur', saveJobSettings);
  jobNameInput.addEventListener('blur', saveJobSettings);

  // Handle Enter key - resize and blur
  const handleEnterKey = (e: KeyboardEvent, input: HTMLInputElement) => {
    if (e.key === 'Enter') {
      resizeInput(input);
      input.blur();
    }
  };

  jobNumberInput.addEventListener('keydown', (e) => handleEnterKey(e, jobNumberInput));
  jobNameInput.addEventListener('keydown', (e) => handleEnterKey(e, jobNameInput));

  // Edit button handlers - clear input and focus
  const editJobNumberBtn = document.getElementById('dev-edit-job-number') as HTMLButtonElement;
  const editJobNameBtn = document.getElementById('dev-edit-job-name') as HTMLButtonElement;

  editJobNumberBtn.addEventListener('click', () => {
    jobNumberInput.value = '#';
    jobNumberInput.focus();
  });

  editJobNameBtn.addEventListener('click', () => {
    jobNameInput.value = '';
    jobNameInput.focus();
  });

  // Populate version options based on current ad
  function updateVersionOptions(adName: string) {
    // Hide version dropdown when "all" sizes is selected
    if (adName === 'all') {
      versionSelect.style.display = 'none';
      return;
    }
    versionSelect.style.display = '';
    
    const ad = adConfigs.find(a => a.name === adName);
    const variants = ad?.variants || [];
    
    versionSelect.innerHTML = `
      <option value="">Base</option>
      ${variants.map(v => `
        <option value="${v}" ${v === currentVariant ? 'selected' : ''}>${v}</option>
      `).join('')}
      <option value="all" ${currentVariant === 'all' ? 'selected' : ''}>All</option>
    `;
  }

  // Initialize version options
  updateVersionOptions(currentAd);

  // Handle size change
  sizeSelect.addEventListener('change', () => {
    const newSize = sizeSelect.value;
    if (newSize === 'all') {
      window.location.href = '/all.html';
    } else {
      // Navigate to base version of new size
      window.location.href = `/${newSize}/index.html`;
    }
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

  // Handle screenshot button
  const screenshotBtn = document.getElementById('dev-screenshot-btn') as HTMLButtonElement | null;
  const defaultBtnContent = `${cameraIcon} Take a Screenshot`;
  
  if (screenshotBtn) {
  screenshotBtn.addEventListener('click', async () => {
    screenshotBtn.disabled = true;
    screenshotBtn.innerHTML = '<div class="spinner"></div> Take a Screenshot';

    try {
      // Find the ad container - typically the first element after the toolbar
      // Look for .ad, #ad, or the first main content container
      const adContainer = document.querySelector('.ad, #ad, main, [class*="banner"], [id*="banner"]') as HTMLElement
        || document.body.children[1] as HTMLElement;

      if (!adContainer || adContainer.id === 'dev-toolbar') {
        throw new Error('Could not find ad container');
      }

      // Capture the ad at 2x resolution for better quality
      const hiResCanvas = await html2canvas(adContainer, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
        scale: 2,
      });

      // Create a canvas at 1x resolution and draw the 2x image scaled down
      const canvas = document.createElement('canvas');
      canvas.width = hiResCanvas.width / 2;
      canvas.height = hiResCanvas.height / 2;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(hiResCanvas, 0, 0, canvas.width, canvas.height);

      // Convert to JPEG
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send to server
      const response = await fetch('/api/save-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adSize: currentAd,
          version: currentVariant || 'v1',
          imageData,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        screenshotBtn.innerHTML = `${checkIcon} Take a Screenshot`;
        setTimeout(() => {
          screenshotBtn.innerHTML = defaultBtnContent;
          screenshotBtn.disabled = false;
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to save screenshot');
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      screenshotBtn.innerHTML = '✗ Take a Screenshot';
      setTimeout(() => {
        screenshotBtn.innerHTML = defaultBtnContent;
        screenshotBtn.disabled = false;
      }, 2000);
    }
  });
  }

  // Settings tray logic
  const settingsBtn = document.getElementById('dev-settings-btn') as HTMLButtonElement | null;
  const settingsTray = document.getElementById('dev-settings-tray') as HTMLDivElement;
  const settingsOverlay = document.getElementById('dev-settings-overlay') as HTMLDivElement;
  const trayClose = settingsTray.querySelector('.tray-close') as HTMLButtonElement;
  const templateVarsList = document.getElementById('template-vars-list') as HTMLDivElement;
  const cssColorsList = document.getElementById('css-colors-list') as HTMLDivElement;
  const cssImagesList = document.getElementById('css-images-list') as HTMLDivElement;
  const cssTypographyList = document.getElementById('css-typography-list') as HTMLDivElement;
  const cssOtherList = document.getElementById('css-other-list') as HTMLDivElement;
  const spriteImagesList = document.getElementById('sprite-images-list') as HTMLDivElement;
  const spritesCount = document.getElementById('sprites-count') as HTMLSpanElement;

  // Section toggle (collapse/expand)
  settingsTray.querySelectorAll('.var-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.var-section') as HTMLElement;
      section.classList.toggle('collapsed');
    });
  });

  // Categorize CSS variables
  function categorizeCssVar(name: string, value: string): 'colors' | 'images' | 'typography' | 'other' {
    const nameLower = name.toLowerCase();
    const valueLower = value.toLowerCase();
    
    // Images: url() values or name hints
    if (valueLower.includes('url(') || 
        nameLower.includes('url') || 
        nameLower.includes('image') || 
        nameLower.includes('img') || 
        nameLower.includes('photo')) {
      return 'images';
    }
    
    // Typography: font/size/text related
    if (nameLower.includes('font') || 
        nameLower.includes('size') || 
        nameLower.includes('line-height') ||
        nameLower.includes('weight') || 
        nameLower.includes('family') || 
        nameLower.includes('text') ||
        nameLower.includes('letter') ||
        nameLower.includes('spacing') ||
        valueLower.match(/^\d+(\.\d+)?(px|em|rem|pt|%)$/)) {
      return 'typography';
    }
    
    // Colors: hex colors, rgb, rgba, hsl, color keywords, or name hints
    if (nameLower.includes('color') || 
        nameLower.includes('bg') ||
        nameLower.includes('background') ||
        valueLower.match(/^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i) ||
        valueLower.match(/^(rgb|rgba|hsl|hsla)\(/) ||
        ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'gray', 'grey', 'transparent'].some(c => valueLower === c)) {
      return 'colors';
    }
    
    // Default to other
    return 'other';
  }

  // Current config data - cssVariables is now categorized
  let configData: {
    templateVariables: Record<string, string>;
    cssVariables: {
      colors: Record<string, string>;
      images: Record<string, string>;
      typography: Record<string, string>;
      other: Record<string, string>;
    };
  } = { 
    templateVariables: {}, 
    cssVariables: { colors: {}, images: {}, typography: {}, other: {} } 
  };

  // Open/close tray
  const openTray = () => {
    settingsTray.classList.add('open');
    settingsOverlay.classList.add('active');
    loadConfig();
  };

  const closeTray = () => {
    settingsTray.classList.remove('open');
    settingsOverlay.classList.remove('active');
    // Close any open add forms
    settingsTray.querySelectorAll('.add-var-form').forEach(form => {
      form.classList.remove('active');
    });
  };

  settingsBtn?.addEventListener('click', openTray);
  trayClose.addEventListener('click', closeTray);
  settingsOverlay.addEventListener('click', closeTray);

  // Handle Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsTray.classList.contains('open')) {
      closeTray();
    }
  });

  // Load config from server
  async function loadConfig() {
    // Don't load if viewing "all" pages
    if (currentAd === 'all' || currentVariant === 'all') {
      templateVarsList.innerHTML = '<div class="empty-message">Select a specific ad size and version to edit variables</div>';
      cssColorsList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      cssImagesList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      cssTypographyList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      cssOtherList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      spriteImagesList.innerHTML = '<div class="empty-message">Select a specific ad size</div>';
      if (spritesCount) spritesCount.textContent = '(0)';
      updateSectionCounts(0, 0, 0, 0, 0);
      return;
    }

    try {
      const version = currentVariant || 'base';
      const response = await fetch(`/api/ad-config?adSize=${currentAd}&version=${version}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      configData = {
        templateVariables: data.templateVariables || {},
        cssVariables: {
          colors: data.cssVariables?.colors || {},
          images: data.cssVariables?.images || {},
          typography: data.cssVariables?.typography || {},
          other: data.cssVariables?.other || {},
        },
      };

      renderVariables();
      loadSprites();
    } catch (error) {
      console.error('Failed to load config:', error);
      templateVarsList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      cssColorsList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      cssImagesList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      cssTypographyList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      cssOtherList.innerHTML = '<div class="empty-message">Failed to load config</div>';
    }
  }

  // Load sprite images from server
  async function loadSprites() {
    if (currentAd === 'all') {
      spriteImagesList.innerHTML = '<div class="empty-message">Select a specific ad size</div>';
      if (spritesCount) spritesCount.textContent = '(0)';
      return;
    }

    try {
      const response = await fetch(`/api/sprites?adSize=${currentAd}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const sprites = data.sprites || [];
      if (spritesCount) spritesCount.textContent = `(${sprites.length})`;

      if (sprites.length === 0) {
        spriteImagesList.innerHTML = '<div class="empty-message">No sprite images found</div>';
        return;
      }

      spriteImagesList.innerHTML = sprites.map((sprite: { name: string; file: string }) => `
        <div class="sprite-item" data-name="${sprite.name}">
          <span class="sprite-name">${sprite.name}</span>
          <span class="sprite-filename">${sprite.file}</span>
          <button class="sprite-copy-btn" title="Copy SCSS include">${copyIcon}</button>
        </div>
      `).join('');

      // Attach copy listeners to sprite items
      attachSpriteListeners();
    } catch (error) {
      console.error('Failed to load sprites:', error);
      spriteImagesList.innerHTML = '<div class="empty-message">Failed to load sprites</div>';
      if (spritesCount) spritesCount.textContent = '(0)';
    }
  }

  // Attach listeners to sprite copy buttons
  function attachSpriteListeners() {
    spriteImagesList.querySelectorAll('.sprite-item').forEach(item => {
      const name = item.getAttribute('data-name')!;
      const copyBtn = item.querySelector('.sprite-copy-btn') as HTMLButtonElement;

      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const scssInclude = `@include sprite.sprite(sprite.$${name});`;
          try {
            await navigator.clipboard.writeText(scssInclude);
            // Show feedback
            const originalIcon = copyBtn.innerHTML;
            copyBtn.innerHTML = checkIcon;
            copyBtn.style.opacity = '1';
            copyBtn.querySelector('svg')!.style.stroke = '#22c55e';
            setTimeout(() => {
              copyBtn.innerHTML = originalIcon;
              copyBtn.style.opacity = '';
            }, 1500);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
      }
    });
  }

  // Update section item counts
  function updateSectionCounts(template: number, colors: number, images: number, typography: number, other: number) {
    const templateCount = document.getElementById('template-count');
    const colorsCount = document.getElementById('colors-count');
    const imagesCount = document.getElementById('images-count');
    const typographyCount = document.getElementById('typography-count');
    const otherCount = document.getElementById('other-count');
    
    if (templateCount) templateCount.textContent = `(${template})`;
    if (colorsCount) colorsCount.textContent = `(${colors})`;
    if (imagesCount) imagesCount.textContent = `(${images})`;
    if (typographyCount) typographyCount.textContent = `(${typography})`;
    if (otherCount) otherCount.textContent = `(${other})`;
    
    // Disable empty sections visually
    const otherSection = cssOtherList.closest('.var-section');
    if (otherSection) {
      if (other === 0) {
        otherSection.classList.add('disabled');
      } else {
        otherSection.classList.remove('disabled');
      }
    }
  }

  // Helper to convert hex to closest color value for picker
  function toHexColor(value: string): string {
    const v = value.trim().toLowerCase();
    // If already a hex color
    if (v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)) {
      return v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v;
    }
    // Color keywords
    const colorMap: Record<string, string> = {
      white: '#ffffff', black: '#000000', red: '#ff0000', blue: '#0000ff',
      green: '#008000', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
      gray: '#808080', grey: '#808080', transparent: '#ffffff'
    };
    return colorMap[v] || '#ffffff';
  }

  // Render variable lists
  function renderVariables() {
    // Render template variables
    const templateVars = Object.entries(configData.templateVariables);
    if (templateVars.length === 0) {
      templateVarsList.innerHTML = '<div class="empty-message">No template variables defined</div>';
    } else {
      templateVarsList.innerHTML = templateVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}">
          <span class="var-name">${name}</span>
          <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
          <button class="var-action-btn var-copy" title="Copy as template variable">${copyIcon}</button>
          <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
        </div>
      `).join('');
    }

    // Use pre-categorized CSS variables from API
    const colorVars = Object.entries(configData.cssVariables.colors);
    const imageVars = Object.entries(configData.cssVariables.images);
    const typographyVars = Object.entries(configData.cssVariables.typography);
    const otherVars = Object.entries(configData.cssVariables.other);

    // Update counts
    updateSectionCounts(templateVars.length, colorVars.length, imageVars.length, typographyVars.length, otherVars.length);

    // Render color variables with color pickers
    if (colorVars.length === 0) {
      cssColorsList.innerHTML = '<div class="empty-message">No color variables defined</div>';
    } else {
      cssColorsList.innerHTML = colorVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="colors">
          <span class="var-name">${name}</span>
          <input type="color" class="var-color-input" value="${toHexColor(String(value))}" data-original="${escapeHtml(String(value))}" />
          <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
          <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
          <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
        </div>
      `).join('');
    }

    // Render image variables
    if (imageVars.length === 0) {
      cssImagesList.innerHTML = '<div class="empty-message">No image variables defined</div>';
    } else {
      cssImagesList.innerHTML = imageVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="images">
          <span class="var-name">${name}</span>
          <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
          <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
          <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
        </div>
      `).join('');
    }

    // Render typography variables
    if (typographyVars.length === 0) {
      cssTypographyList.innerHTML = '<div class="empty-message">No typography variables defined</div>';
    } else {
      cssTypographyList.innerHTML = typographyVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="typography">
          <span class="var-name">${name}</span>
          <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
          <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
          <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
        </div>
      `).join('');
    }

    // Render other variables
    if (otherVars.length === 0) {
      cssOtherList.innerHTML = '<div class="empty-message">No other CSS variables defined</div>';
    } else {
      cssOtherList.innerHTML = otherVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="other">
          <span class="var-name">${name}</span>
          <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
          <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
          <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
        </div>
      `).join('');
    }

    // Attach event listeners to inputs
    attachVariableListeners();
  }

  // Helper to escape HTML
  function escapeHtml(str: string): string {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // Attach listeners to variable inputs and delete buttons
  function attachVariableListeners() {
    // Helper for copy feedback - show checkmark briefly
    const showCopyFeedback = (btn: HTMLButtonElement) => {
      const originalIcon = btn.innerHTML;
      btn.innerHTML = checkIcon;
      btn.style.opacity = '1';
      btn.querySelector('svg')!.style.stroke = '#22c55e';
      setTimeout(() => {
        btn.innerHTML = originalIcon;
        btn.style.opacity = '';
      }, 1500);
    };

    // Template variable inputs
    templateVarsList.querySelectorAll('.var-item').forEach(item => {
      const name = item.getAttribute('data-name')!;
      const input = item.querySelector('.var-input') as HTMLInputElement;
      const copyBtn = item.querySelector('.var-copy') as HTMLButtonElement;
      const deleteBtn = item.querySelector('.var-delete') as HTMLButtonElement;

      // Store original value for reverting on blur/Escape
      let originalValue = input.value;

      input.addEventListener('focus', () => {
        originalValue = input.value;
      });

      input.addEventListener('blur', () => {
        // Silently revert - no save, no side effects
        input.value = originalValue;
      });

      input.addEventListener('keydown', (e) => {
        // Stop propagation so GSDevTools and other listeners don't interfere
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          originalValue = input.value;
          configData.templateVariables[name] = input.value;
          saveConfig().then(() => {
            // Template variables are server-rendered, reload to apply
            window.location.reload();
          });
        } else if (e.key === 'Escape') {
          input.value = originalValue;
          input.blur();
        }
      });

      // Copy button handler for template variables
      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const templateVar = `{{${name}}}`;
          try {
            await navigator.clipboard.writeText(templateVar);
            showCopyFeedback(copyBtn);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
      }

      deleteBtn.addEventListener('click', () => {
        if (confirm(`Remove "${name}" from all versions?`)) {
          deleteVariable(name, 'template');
        }
      });
    });

    // CSS variable inputs (all categories including other)
    [cssColorsList, cssImagesList, cssTypographyList, cssOtherList].forEach(list => {
      list.querySelectorAll('.var-item').forEach(item => {
        const name = item.getAttribute('data-name')!;
        const input = item.querySelector('.var-input') as HTMLInputElement;
        const colorInput = item.querySelector('.var-color-input') as HTMLInputElement;
        const copyBtn = item.querySelector('.var-copy') as HTMLButtonElement;
        const deleteBtn = item.querySelector('.var-delete') as HTMLButtonElement;
        const category = item.getAttribute('data-category') as 'colors' | 'images' | 'typography' | 'other';

        // Store original value for reverting on blur/Escape
        let originalValue = input.value;

        input.addEventListener('focus', () => {
          originalValue = input.value;
        });

        // Text input handlers - revert on blur, save only on Enter
        input.addEventListener('blur', () => {
          input.value = originalValue;
          // Revert live CSS variable too
          document.documentElement.style.setProperty(`--${category}-${name}`, originalValue);
          if (colorInput) {
            colorInput.value = toHexColor(originalValue);
          }
        });

        input.addEventListener('keydown', (e) => {
          // Stop propagation so GSDevTools and other listeners don't interfere
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
            // Commit the new value
            originalValue = input.value;
            if (category && configData.cssVariables[category]) {
              configData.cssVariables[category][name] = input.value;
            }
            document.documentElement.style.setProperty(`--${category}-${name}`, input.value);
            saveConfig();
            if (colorInput) {
              colorInput.value = toHexColor(input.value);
            }
            input.blur();
          } else if (e.key === 'Escape') {
            input.value = originalValue;
            input.blur();
          }
        });

        // Color picker handler
        if (colorInput) {
          colorInput.addEventListener('input', () => {
            input.value = colorInput.value;
            if (category && configData.cssVariables[category]) {
              configData.cssVariables[category][name] = colorInput.value;
            }
            // Update live CSS variable in the DOM
            document.documentElement.style.setProperty(`--${category}-${name}`, colorInput.value);
            saveConfig();
          });
        }

        // Copy button handler
        if (copyBtn) {
          copyBtn.addEventListener('click', async () => {
            const cssVar = `var(--${category}-${name})`;
            try {
              await navigator.clipboard.writeText(cssVar);
              showCopyFeedback(copyBtn);
            } catch (err) {
              console.error('Failed to copy:', err);
            }
          });
        }

        // Delete button handler
        deleteBtn.addEventListener('click', () => {
          if (confirm(`Remove "${name}" from all versions?`)) {
            deleteVariable(name, 'css', category);
          }
        });
      });
    });
  }

  // Save config to server
  async function saveConfig() {
    try {
      const version = currentVariant || 'base';
      await fetch(`/api/ad-config?adSize=${currentAd}&version=${version}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData),
      });
    } catch (error) {
      console.error('Failed to save config:', error);
    }
  }

  // Add variable to all versions
  async function addVariable(name: string, defaultValue: string, type: 'template' | 'css', category?: 'colors' | 'images' | 'typography' | 'other') {
    try {
      const response = await fetch('/api/ad-config/sync-variable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adSize: currentAd,
          variableName: name,
          variableType: type,
          action: 'add',
          defaultValue,
          category: type === 'css' ? category : undefined,
        }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to add variable');
      }
      
      // Update local state
      if (type === 'template') {
        configData.templateVariables[name] = defaultValue;
      } else if (category) {
        configData.cssVariables[category][name] = defaultValue;
        // Apply live CSS variable to the DOM
        document.documentElement.style.setProperty(`--${category}-${name}`, defaultValue);
      }
      
      renderVariables();
    } catch (error) {
      console.error('Failed to add variable:', error);
    }
  }

  // Delete variable from all versions
  async function deleteVariable(name: string, type: 'template' | 'css', category?: 'colors' | 'images' | 'typography' | 'other') {
    try {
      const response = await fetch('/api/ad-config/sync-variable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adSize: currentAd,
          variableName: name,
          variableType: type,
          action: 'remove',
        }),
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete variable');
      }
      
      // Update local state
      if (type === 'template') {
        delete configData.templateVariables[name];
      } else if (category && configData.cssVariables[category]) {
        delete configData.cssVariables[category][name];
        // Remove live CSS variable from the DOM
        document.documentElement.style.removeProperty(`--${category}-${name}`);
      }
      
      renderVariables();
    } catch (error) {
      console.error('Failed to delete variable:', error);
    }
  }

  // Add variable form handlers
  settingsTray.querySelectorAll('.var-section').forEach(section => {
    const dataType = section.getAttribute('data-type')!;
    // Map data-type to API type ('template' or 'css') and category
    const apiType: 'template' | 'css' = dataType === 'template' ? 'template' : 'css';
    // Map data-type to CSS category
    const categoryMap: Record<string, 'colors' | 'images' | 'typography' | 'other'> = {
      'css-colors': 'colors',
      'css-images': 'images',
      'css-typography': 'typography',
      'css-other': 'other',
    };
    const cssCategory = categoryMap[dataType];
    
    const addBtn = section.querySelector('.add-var-btn-bottom') as HTMLButtonElement | null;
    const form = section.querySelector('.add-var-form') as HTMLDivElement | null;
    
    // Skip sections without add forms (like sprite images)
    if (!addBtn || !form) return;
    
    const nameInput = form.querySelector('.var-name-input') as HTMLInputElement;
    const valueInput = form.querySelector('.var-value-input') as HTMLInputElement | HTMLElement;
    const imageSelect = form.querySelector('.var-image-select') as HTMLSelectElement | null;
    const submitBtn = form.querySelector('.add-var-submit') as HTMLButtonElement;
    const cancelBtn = form.querySelector('.add-var-cancel') as HTMLButtonElement;
    const isColorPicker = form.getAttribute('data-use-color-picker') === 'true';
    const isImagePicker = form.getAttribute('data-use-image-picker') === 'true';

    // Auto-convert spaces to hyphens and enforce lowercase
    nameInput.addEventListener('input', () => {
      // Replace spaces with hyphens and remove invalid characters
      nameInput.value = nameInput.value
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
    });

    addBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      form.classList.add('active');
      addBtn.style.display = 'none';
      
      // Load images for image picker
      if (isImagePicker && imageSelect) {
        imageSelect.innerHTML = '<option value="">Loading images...</option>';
        try {
          const res = await fetch(`/api/images?adSize=${currentAd}`);
          const data = await res.json();
          if (data.images && data.images.length > 0) {
            imageSelect.innerHTML = '<option value="">Select an image...</option>' +
              data.images.map((img: { filename: string; cssValue: string }) => 
                `<option value="${img.cssValue}">${img.filename}</option>`
              ).join('');
          } else {
            imageSelect.innerHTML = '<option value="">No images found in src/img/</option>';
          }
        } catch (err) {
          imageSelect.innerHTML = '<option value="">Error loading images</option>';
        }
      }
      
      nameInput.focus();
    });

    cancelBtn.addEventListener('click', () => {
      form.classList.remove('active');
      addBtn.style.display = '';
      nameInput.value = '';
      if (valueInput instanceof HTMLInputElement) {
        valueInput.value = isColorPicker ? '#ffffff' : '';
      }
      if (imageSelect) {
        imageSelect.selectedIndex = 0;
      }
    });

    submitBtn.addEventListener('click', () => {
      const name = nameInput.value.trim();
      let value = '';
      if (isImagePicker && imageSelect) {
        value = imageSelect.value;
      } else if (valueInput instanceof HTMLInputElement) {
        value = valueInput.value;
      }
      
      if (!name) {
        nameInput.focus();
        return;
      }
      
      if (isImagePicker && !value) {
        imageSelect?.focus();
        return;
      }
      
      // Validate name format (lowercase, hyphens, alphanumeric)
      if (!/^[a-z][a-z0-9-]*$/.test(name)) {
        alert('Variable names must start with a letter and contain only lowercase letters, numbers, and hyphens');
        nameInput.focus();
        return;
      }

      addVariable(name, value, apiType, cssCategory);
      form.classList.remove('active');
      addBtn.style.display = '';
      nameInput.value = '';
      if (valueInput instanceof HTMLInputElement) {
        valueInput.value = isColorPicker ? '#ffffff' : '';
      }
      if (imageSelect) {
        imageSelect.selectedIndex = 0;
      }
    });

    // Handle Enter key in form
    nameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (valueInput instanceof HTMLInputElement) valueInput.focus();
      } else if (e.key === 'Escape') {
        cancelBtn.click();
      }
    });

    if (valueInput instanceof HTMLInputElement && valueInput.type !== 'color') {
      valueInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitBtn.click();
        } else if (e.key === 'Escape') {
          cancelBtn.click();
        }
      });
    }
  });
}

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createToolbar);
} else {
  createToolbar();
}
