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
        position: relative;
        top: 0;
        left: 0;
        margin-bottom: 20px;
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
        background: #222;
        border: 1px solid #333;
        border-radius: 4px;
        color: #fff;
        padding: 5px 8px;
        font-size: 12px;
        font-family: inherit;
        width: 80px;
        transition: all 0.2s;
      }
      
      #dev-toolbar input[type="text"]:focus {
        outline: none;
        border-color: #0078d4;
        background: #2a2a2a;
      }
      
      #dev-toolbar input[type="text"]::placeholder {
        color: #555;
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
        gap: 6px;
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
      
      /* Push body content down to make room for toolbar */
      body {
        margin-top: 40px !important;
      }
    </style>
    
    <div class="toolbar-group">
      <span class="input-label">Job #</span>
      <input type="text" id="dev-job-number" placeholder="000000" />
    </div>
    
    <div class="toolbar-group">
      <span class="input-label">Name</span>
      <input type="text" id="dev-job-name" placeholder="job-name" />
    </div>
    
    <div class="toolbar-divider"></div>
    
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
    
    <div class="toolbar-spacer"></div>
    
    <div class="toolbar-group">
      <button id="dev-screenshot-btn" title="Save screenshot to statics folder">${cameraIcon} Take a Screenshot</button>
    </div>
  `;

  document.body.prepend(toolbar);

  // Get elements
  const sizeSelect = document.getElementById('dev-size-select') as HTMLSelectElement;
  const versionSelect = document.getElementById('dev-version-select') as HTMLSelectElement;
  const jobNumberInput = document.getElementById('dev-job-number') as HTMLInputElement;
  const jobNameInput = document.getElementById('dev-job-name') as HTMLInputElement;

  // Load job settings and populate inputs
  fetch('/api/job-settings')
    .then(res => res.json())
    .then(data => {
      jobNumberInput.value = data.jobNumber || '';
      jobNameInput.value = data.jobName || '';
    })
    .catch(err => console.error('Failed to load job settings:', err));

  // Save job settings on blur
  const saveJobSettings = () => {
    fetch('/api/job-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobNumber: jobNumberInput.value || '000000',
        jobName: jobNameInput.value || 'job-name',
      }),
    }).catch(err => console.error('Failed to save job settings:', err));
  };

  jobNumberInput.addEventListener('blur', saveJobSettings);
  jobNameInput.addEventListener('blur', saveJobSettings);

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

  // Handle screenshot button
  const screenshotBtn = document.getElementById('dev-screenshot-btn') as HTMLButtonElement;
  const defaultBtnContent = `${cameraIcon} Take a Screenshot`;
  
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

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createToolbar);
} else {
  createToolbar();
}
