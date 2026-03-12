import type { ConfigData } from '../toolbar/types';
import { fetchConfig, fetchImages } from '../toolbar/config-api';
import { setupVariables } from './variables';
import type { VariableElements } from './variables';

const STORAGE_KEY = 'dev-sidebar-width';
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

  // Add variable form handlers
  setupAddVariableForms(sidebar, currentAd, addVariable);
}

// Wire up the "Add Variable" forms in each section
function setupAddVariableForms(
  sidebar: HTMLDivElement,
  currentAd: string,
  addVariable: (name: string, defaultValue: string, type: 'template' | 'css', category?: 'colors' | 'images' | 'typography' | 'other') => Promise<void>,
): void {
  sidebar.querySelectorAll('.var-section').forEach(section => {
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
