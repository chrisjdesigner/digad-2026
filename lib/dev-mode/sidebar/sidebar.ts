import type { AdConfig, ConfigData } from '../toolbar/types';
import { fetchConfig, fetchImages, createVersion, deleteVersion, createSize, deleteSize } from '../toolbar/config-api';
import { setupVariables } from './variables';
import type { VariableElements } from './variables';

const STORAGE_KEY = 'dev-sidebar-width';
const TAB_STORAGE_KEY = 'dev-sidebar-tab';
const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 240;
const MAX_WIDTH = 600;

function getSavedWidth(): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const w = parseInt(saved, 10);
    if (w >= MIN_WIDTH && w <= MAX_WIDTH) return w;
  }
  return DEFAULT_WIDTH;
}

function applySidebarWidth(width: number) {
  document.documentElement.style.setProperty('--sidebar-width', `${width}px`);
}

export function setupSidebar(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): void {
  const sidebar = document.getElementById('dev-settings-tray') as HTMLDivElement;
  const resizeHandle = sidebar.querySelector('.sidebar-resize-handle') as HTMLDivElement;

  // Apply saved sidebar width
  const initialWidth = getSavedWidth();
  applySidebarWidth(initialWidth);

  // Shared config state (mutated by reference in both this module and variables)
  const configData: ConfigData = {
    templateVariables: {},
    cssVariables: { colors: {}, images: {}, typography: {}, other: {} },
  };

  // Get variable list elements
  const variableElements: VariableElements = {
    templateVarsList: document.getElementById('template-vars-list') as HTMLDivElement,
    cssColorsList: document.getElementById('css-colors-list') as HTMLDivElement,
    cssImagesList: document.getElementById('css-images-list') as HTMLDivElement,
    cssTypographyList: document.getElementById('css-typography-list') as HTMLDivElement,
    cssOtherList: document.getElementById('css-other-list') as HTMLDivElement,
    spriteImagesList: document.getElementById('sprite-images-list') as HTMLDivElement,
    spritesCount: document.getElementById('sprites-count') as HTMLSpanElement,
  };

  // Setup variable rendering and CRUD
  const { renderVariables, loadSprites, addVariable, updateSectionCounts } =
    setupVariables(variableElements, currentAd, currentVariant, configData);

  // Section toggle (collapse/expand)
  sidebar.querySelectorAll('.var-section-header').forEach(header => {
    header.addEventListener('click', () => {
      const section = header.closest('.var-section') as HTMLElement;
      section.classList.toggle('collapsed');
    });
  });

  // --- Tab switching ---
  sidebar.querySelectorAll('.sidebar-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = (tab as HTMLElement).getAttribute('data-tab')!;
      sidebar.querySelectorAll('.sidebar-tab').forEach(t => t.classList.remove('active'));
      sidebar.querySelectorAll('.sidebar-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      sidebar.querySelector(`.sidebar-tab-panel[data-panel="${tabName}"]`)?.classList.add('active');
      localStorage.setItem(TAB_STORAGE_KEY, tabName);
    });
  });

  // --- Resize handle drag logic ---
  let isDragging = false;

  resizeHandle.addEventListener('mousedown', (e: MouseEvent) => {
    e.preventDefault();
    isDragging = true;
    resizeHandle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  });

  document.addEventListener('mousemove', (e: MouseEvent) => {
    if (!isDragging) return;
    const rect = sidebar.parentElement!.getBoundingClientRect();
    const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, rect.right - e.clientX));
    applySidebarWidth(newWidth);
  });

  document.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    resizeHandle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    // Persist width
    const current = parseInt(getComputedStyle(sidebar).width, 10);
    localStorage.setItem(STORAGE_KEY, String(current));
  });

  // Load config from server
  async function loadConfig() {
    if (currentAd === 'all' || currentVariant === 'all') {
      variableElements.templateVarsList.innerHTML = '<div class="empty-message">Select a specific ad size and version to edit variables</div>';
      variableElements.cssColorsList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      variableElements.cssImagesList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      variableElements.cssTypographyList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      variableElements.cssOtherList.innerHTML = '<div class="empty-message">Select a specific version to edit</div>';
      variableElements.spriteImagesList.innerHTML = '<div class="empty-message">Select a specific ad size</div>';
      if (variableElements.spritesCount) variableElements.spritesCount.textContent = '(0)';
      updateSectionCounts(0, 0, 0, 0, 0);
      return;
    }

    try {
      const data = await fetchConfig(currentAd, currentVariant);

      // Mutate existing configData object (shared reference with variables module)
      configData.templateVariables = data.templateVariables;
      configData.cssVariables = data.cssVariables;

      renderVariables();
      loadSprites();
    } catch (error) {
      console.error('Failed to load config:', error);
      variableElements.templateVarsList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      variableElements.cssColorsList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      variableElements.cssImagesList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      variableElements.cssTypographyList.innerHTML = '<div class="empty-message">Failed to load config</div>';
      variableElements.cssOtherList.innerHTML = '<div class="empty-message">Failed to load config</div>';
    }
  }

  // Auto-load config since sidebar is always visible
  loadConfig();

  // --- Delete version handlers ---
  sidebar.querySelectorAll('.delete-version').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const versionName = (btn as HTMLElement).getAttribute('data-version')!;
      if (!confirm(`Delete version "${versionName}"? This cannot be undone.`)) return;

      try {
        await deleteVersion(currentAd, versionName);
        // If we deleted the version we're currently viewing, go to base
        if (currentVariant === versionName) {
          window.location.href = `/${currentAd}/index.html`;
        } else {
          window.location.reload();
        }
      } catch (error) {
        alert(`Failed to delete version: ${(error as Error).message}`);
      }
    });
  });

  // --- Add version button ---
  const addVersionBtn = document.getElementById('dev-add-version-btn') as HTMLButtonElement | null;
  if (addVersionBtn) {
    addVersionBtn.addEventListener('click', async () => {
      const ad = adConfigs.find(a => a.name === currentAd);
      const variants = ad?.variants || [];
      const allVersions = ['Base', ...variants];

      // Determine source version
      let sourceVersion: string;
      if (allVersions.length === 1) {
        sourceVersion = 'base';
      } else {
        const choices = allVersions.map((v, i) => `${i + 1}. ${v}`).join('\n');
        const input = prompt(`Which version would you like to duplicate?\n\n${choices}\n\nEnter the number:`);
        if (!input) return;
        const index = parseInt(input, 10) - 1;
        if (isNaN(index) || index < 0 || index >= allVersions.length) {
          alert('Invalid selection.');
          return;
        }
        sourceVersion = index === 0 ? 'base' : variants[index - 1];
      }

      // Auto-generate next version name
      const existingNumbers = variants
        .map(v => { const m = v.match(/^v(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
        .filter(n => n > 0);
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 2;
      const newName = prompt('Enter a name for the new version:', `v${nextNumber}`);
      if (!newName) return;

      try {
        addVersionBtn.disabled = true;
        addVersionBtn.textContent = 'Creating...';
        await createVersion(currentAd, newName, sourceVersion);
        window.location.href = `/${currentAd}/${newName}.html`;
      } catch (error) {
        alert(`Failed to create version: ${(error as Error).message}`);
        addVersionBtn.disabled = false;
        addVersionBtn.textContent = '+ Add Version';
      }
    });
  }

  // --- Add size button ---
  const addSizeBtn = document.getElementById('dev-add-size-btn') as HTMLButtonElement | null;
  if (addSizeBtn) {
    addSizeBtn.addEventListener('click', async () => {
      const allSizes = adConfigs.map(a => a.name);

      // Determine source size
      let sourceSize: string;
      if (allSizes.length === 1) {
        sourceSize = allSizes[0];
      } else {
        const choices = allSizes.map((s, i) => `${i + 1}. ${s}`).join('\n');
        const input = prompt(`Which size would you like to duplicate?\n\n${choices}\n\nEnter the number:`);
        if (!input) return;
        const index = parseInt(input, 10) - 1;
        if (isNaN(index) || index < 0 || index >= allSizes.length) {
          alert('Invalid selection.');
          return;
        }
        sourceSize = allSizes[index];
      }

      const newName = prompt('Enter the new ad size (e.g. 728x90):');
      if (!newName) return;

      if (!/^\d+x\d+(-\w+)*$/.test(newName)) {
        alert('Size name must be in format WIDTHxHEIGHT (e.g. 728x90)');
        return;
      }

      // Show loading overlay
      const overlay = document.createElement('div');
      overlay.id = 'dev-loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div><div class="spinner-label">Creating size&hellip;</div>';
      document.body.appendChild(overlay);
      addSizeBtn.disabled = true;

      try {
        await createSize(newName, sourceSize);
        window.location.href = `/${newName}/index.html`;
      } catch (error) {
        overlay.remove();
        alert(`Failed to create size: ${(error as Error).message}`);
        addSizeBtn.disabled = false;
      }
    });
  }

  // --- Delete size handlers ---
  sidebar.querySelectorAll('.delete-ad-size').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sizeName = (btn as HTMLElement).getAttribute('data-ad-size')!;

      if (adConfigs.length <= 1) {
        alert('Cannot delete the last remaining ad size.');
        return;
      }

      if (!confirm(`Delete size "${sizeName}" and all its versions? This cannot be undone.`)) return;

      try {
        await deleteSize(sizeName);
        // If we deleted the size we're currently viewing, go to another size
        if (currentAd === sizeName) {
          const remaining = adConfigs.find(a => a.name !== sizeName);
          window.location.href = remaining ? `/${remaining.name}/index.html` : '/';
        } else {
          window.location.reload();
        }
      } catch (error) {
        alert(`Failed to delete size: ${(error as Error).message}`);
      }
    });
  });

  // Add variable form handlers
  setupAddVariableForms(sidebar, currentAd, addVariable);
}

// Wire up the "Add Variable" forms in each section
function setupAddVariableForms(
  sidebar: HTMLDivElement,
  currentAd: string,
  addVariable: (name: string, defaultValue: string, type: 'template' | 'css', category?: 'colors' | 'images' | 'typography' | 'other') => Promise<void>,
): void {
  sidebar.querySelectorAll('.var-section[data-type]').forEach(section => {
    const dataType = section.getAttribute('data-type')!;
    const apiType: 'template' | 'css' = dataType === 'template' ? 'template' : 'css';
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
          const images = await fetchImages(currentAd);
          if (images.length > 0) {
            imageSelect.innerHTML = '<option value="">Select an image...</option>' +
              images.map(img =>
                `<option value="${img.cssValue}">${img.filename}</option>`
              ).join('');
          } else {
            imageSelect.innerHTML = '<option value="">No images found in src/img/</option>';
          }
        } catch {
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
