import type { AdConfig, ConfigData } from '../toolbar/models/types';
import { fetchConfig, fetchImages, createVersion, deleteVersion, createSize, deleteSize } from '../toolbar/api/config-api';
import { setupVariables } from './features/variables';
import type { VariableElements } from './features/variables';
import { showCreateVersionModal, showCreateSizeModal, showDeleteConfirmModal } from '../modals';

const STORAGE_KEY = 'dev-sidebar-width';
const TAB_STORAGE_KEY = 'dev-sidebar-tab';
const SECTION_STORAGE_PREFIX = 'dev-section-';
const DEFAULT_WIDTH = 340;
const MIN_WIDTH = 240;
const MAX_WIDTH = 600;
const COMMON_AD_SIZES = [
  '120x600',
  '125x125',
  '160x600',
  '180x150',
  '200x200',
  '240x400',
  '250x250',
  '300x50',
  '320x488',
  '300x100',
  '300x250',
  '300x600',
  '600x500',
  '640x1000',
  '320x50',
  '812x457',
  '970x66',
  '320x100',
  '320x480',
  '336x280',
  '468x60',
  '480x320',
  '728x90',
  '970x90',
  '970x250',
  '970x415',
  '980x120',
  '980x240',
  '980x400',
  '1080x1080',
  '1080x1350',
  '1080x1920',
  '1200x628',
  '1200x627',
  '1200x675',
  '1600x900',
];

function getSavedWidth(): number {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const w = parseInt(saved, 10);
    if (w >= MIN_WIDTH && w <= MAX_WIDTH) return w;
  }
  return DEFAULT_WIDTH;
}

function applySidebarWidth(width: number) {
  const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, width));
  document.documentElement.style.setProperty('--sidebar-width', `${clamped}px`);
}

function setupVariablesTabLoop(sidebar: HTMLDivElement) {
  const panel = sidebar.querySelector('.sidebar-tab-panel[data-panel="variables"]') as HTMLDivElement | null;
  if (!panel) return;

  const getTabFields = (): Array<HTMLInputElement | HTMLSelectElement> => {
    const candidates = Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
      '.var-item .var-input, .var-item .var-image-select, .add-var-form.active .var-name-input, .add-var-form.active .var-value-input, .add-var-form.active .var-image-select',
    ));

    return candidates.filter((field) => {
      if (field.disabled) return false;
      if (field instanceof HTMLInputElement && field.type === 'hidden') return false;
      if (!field.isConnected) return false;
      const style = window.getComputedStyle(field);
      if (style.display === 'none' || style.visibility === 'hidden') return false;
      return field.offsetParent !== null || style.position === 'fixed';
    });
  };

  panel.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;

    // Variable list fields handle Tab themselves (commit + controlled focus move).
    // Do not intercept those here in capture phase or their blur handlers can run
    // before commit logic executes.
    if (target.closest('.var-item')) return;

    const fields = getTabFields();
    if (fields.length === 0) return;

    const currentIndex = fields.indexOf(target);
    if (currentIndex === -1) return;

    event.preventDefault();
    const direction = event.shiftKey ? -1 : 1;
    const nextIndex = (currentIndex + direction + fields.length) % fields.length;
    const nextField = fields[nextIndex];
    nextField.focus();

    if (nextField instanceof HTMLInputElement && nextField.type !== 'color') {
      nextField.select();
    }
  }, true);
}

function setupProjectTabLoop(sidebar: HTMLDivElement) {
  const panel = sidebar.querySelector('.sidebar-tab-panel[data-panel="project"]') as HTMLDivElement | null;
  if (!panel) return;

  const isFocusable = (el: HTMLElement | null): el is HTMLElement => {
    if (!el) return false;
    if (el instanceof HTMLInputElement && el.disabled) return false;
    if (el instanceof HTMLButtonElement && el.disabled) return false;
    if (!el.isConnected) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return el.offsetParent !== null || style.position === 'fixed';
  };

  const getTabTargets = (): HTMLElement[] => {
    const targets: HTMLElement[] = [];

    const jobNumber = panel.querySelector('#dev-job-number') as HTMLInputElement | null;
    const jobName = panel.querySelector('#dev-job-name') as HTMLInputElement | null;
    const delayToggle = panel.querySelector('#dev-delay-hover-toggle') as HTMLInputElement | null;
    const adSizeLinks = Array.from(panel.querySelectorAll('#dev-ad-sizes-list .project-list-item-link')) as HTMLAnchorElement[];
    const versionLinks = Array.from(panel.querySelectorAll('#dev-versions-list .project-list-item-link')) as HTMLAnchorElement[];

    [jobNumber, jobName, delayToggle, ...adSizeLinks, ...versionLinks].forEach((el) => {
      if (isFocusable(el)) {
        targets.push(el);
      }
    });

    return targets;
  };

  panel.addEventListener('keydown', (event: KeyboardEvent) => {
    if (event.key !== 'Tab') return;

    const targets = getTabTargets();
    if (targets.length === 0) return;

    const active = document.activeElement as HTMLElement | null;
    const currentIndex = active ? targets.indexOf(active) : -1;

    event.preventDefault();
    const direction = event.shiftKey ? -1 : 1;
    const fallbackIndex = event.shiftKey ? targets.length - 1 : 0;
    const nextIndex = currentIndex === -1
      ? fallbackIndex
      : (currentIndex + direction + targets.length) % targets.length;

    const nextTarget = targets[nextIndex];
    nextTarget.focus();

    if (nextTarget instanceof HTMLInputElement && nextTarget.type !== 'checkbox') {
      nextTarget.select();
    }
  }, true);
}

export function setupSidebar(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): void {
  const sidebar = document.getElementById('dev-settings-tray') as HTMLDivElement;
  const resizeHandle = sidebar.querySelector('.sidebar-resize-handle') as HTMLDivElement;
  const isAllView = currentAd === 'all' || currentVariant === 'all';

  // Apply saved sidebar width
  const initialWidth = getSavedWidth();
  applySidebarWidth(initialWidth);
  setupProjectTabLoop(sidebar);

  // Shared config state (mutated by reference in both this module and variables)
  const configData: ConfigData = {
    templateVariables: {},
    cssVariables: { colors: {}, images: {}, typography: {}, other: {} },
  };

  let renderVariables: (() => void) | undefined;
  let loadSprites: (() => void) | undefined;
  let addVariable: ((name: string, defaultValue: string, type: 'template' | 'css', category?: 'colors' | 'images' | 'typography' | 'other') => Promise<void>) | undefined;
  let updateSectionCounts: ((t: number, c: number, i: number, ty: number, o: number) => void) | undefined;

  if (!isAllView) {
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
    const vars = setupVariables(variableElements, currentAd, currentVariant, configData);
    renderVariables = vars.renderVariables;
    loadSprites = vars.loadSprites;
    addVariable = vars.addVariable;
    updateSectionCounts = vars.updateSectionCounts;
    setupVariablesTabLoop(sidebar);
  }

  // Section toggle (collapse/expand) with persistence
  sidebar.querySelectorAll('.var-section-header').forEach(header => {
    header.addEventListener('click', (e) => {
      // Don't toggle if clicking a View All link
      if ((e.target as HTMLElement).closest('.var-section-view-all')) return;
      const section = header.closest('.var-section') as HTMLElement;
      section.classList.toggle('collapsed');
      const key = section.getAttribute('data-project-section') || section.getAttribute('data-type') || '';
      if (key) {
        localStorage.setItem(SECTION_STORAGE_PREFIX + key, section.classList.contains('collapsed') ? 'collapsed' : 'open');
      }
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
    if (isAllView || !renderVariables || !updateSectionCounts) {
      return;
    }

    try {
      const data = await fetchConfig(currentAd, currentVariant);

      // Mutate existing configData object (shared reference with variables module)
      configData.templateVariables = data.templateVariables;
      configData.cssVariables = data.cssVariables;

      renderVariables();
      loadSprites!();
    } catch (error) {
      console.error('Failed to load config:', error);
      ['template-vars-list', 'css-colors-list', 'css-images-list', 'css-typography-list', 'css-other-list'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<div class="empty-message">Failed to load config</div>';
      });
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
      const confirmed = await showDeleteConfirmModal(versionName, 'Version');
      if (!confirmed) return;

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

      // Auto-generate next version name (v2, v3, ...)
      const existingNumbers = variants
        .map(v => { const m = v.match(/^v(\d+)$/); return m ? parseInt(m[1], 10) : 0; })
        .filter(n => n > 0);
      const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 2;

      const modalResult = await showCreateVersionModal(variants, `v${nextNumber}`);
      if (!modalResult) return;

      const { sourceVersion, newVersionName } = modalResult;

      try {
        addVersionBtn.disabled = true;
        addVersionBtn.textContent = 'Creating...';
        await createVersion(currentAd, newVersionName, sourceVersion);
        window.location.href = `/${currentAd}/${newVersionName}.html`;
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

      const defaultSource = allSizes.includes(currentAd) ? currentAd : allSizes[0];
      const modalResult = await showCreateSizeModal(allSizes, defaultSource, COMMON_AD_SIZES);
      if (!modalResult) return;

      const { sourceSize, newSizeName } = modalResult;

      // Show loading overlay
      const overlay = document.createElement('div');
      overlay.id = 'dev-loading-overlay';
      overlay.innerHTML = '<div class="spinner"></div><div class="spinner-label">Creating size&hellip;</div>';
      document.body.appendChild(overlay);
      addSizeBtn.disabled = true;

      try {
        await createSize(newSizeName, sourceSize);
        window.location.href = `/${newSizeName}/index.html`;
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

      const confirmed = await showDeleteConfirmModal(sizeName, 'Size');
      if (!confirmed) return;

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
  if (!isAllView && addVariable) {
    setupAddVariableForms(sidebar, currentAd, addVariable);
  }
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
    const colorPicker = form.querySelector('.add-var-color-picker') as HTMLInputElement | null;
    const cancelBtn = form.querySelector('.add-var-cancel') as HTMLButtonElement;
    const isColorPicker = form.getAttribute('data-use-color-picker') === 'true';
    const isImagePicker = form.getAttribute('data-use-image-picker') === 'true';

    const errorEl = document.createElement('div');
    errorEl.className = 'add-var-error';
    form.appendChild(errorEl);

    const clearError = () => {
      errorEl.textContent = '';
    };

    const setError = (message: string) => {
      errorEl.textContent = message;
    };

    const resetInputs = () => {
      nameInput.value = '';
      if (valueInput instanceof HTMLInputElement) {
        valueInput.value = isColorPicker ? '#ffffff' : '';
      }
      if (imageSelect) {
        imageSelect.selectedIndex = 0;
      }
      clearError();
    };

    const variableExistsInSection = (name: string): boolean => {
      const target = name.toLowerCase();
      return Array.from(section.querySelectorAll('.var-list .var-item[data-name]'))
        .some(item => ((item as HTMLElement).getAttribute('data-name') || '').toLowerCase() === target);
    };

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
      clearError();

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
      resetInputs();
    });

    const handleSubmit = async () => {
      const name = nameInput.value.trim();
      let value = '';
      if (isImagePicker && imageSelect) {
        value = imageSelect.value;
      } else if (valueInput instanceof HTMLInputElement) {
        value = valueInput.value;
      }

      if (!name) {
        setError('Please enter a variable name.');
        nameInput.focus();
        return;
      }

      if (isImagePicker && !value) {
        setError('Please choose an image value.');
        imageSelect?.focus();
        return;
      }

      // Validate name format (lowercase, hyphens, alphanumeric)
      if (!/^[a-z][a-z0-9-]*$/.test(name)) {
        setError('Use lowercase letters, numbers, and hyphens (must start with a letter).');
        nameInput.focus();
        return;
      }

      if (variableExistsInSection(name)) {
        setError(`"${name}" already exists in this section.`);
        nameInput.focus();
        nameInput.select();
        return;
      }

      clearError();

      await addVariable(name, value, apiType, cssCategory);

      // Close form after successful add
      form.classList.remove('active');
      addBtn.style.display = '';
      resetInputs();
    };

    // Handle Enter key in form
    nameInput.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') {
        e.preventDefault();
        if (valueInput instanceof HTMLInputElement && valueInput.type !== 'color') {
          valueInput.focus();
        } else {
          handleSubmit();
        }
      } else if (e.key === 'Escape') {
        cancelBtn.click();
      }
    });

    if (valueInput instanceof HTMLInputElement) {
      valueInput.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === 'Escape') {
          cancelBtn.click();
        }
      });

      valueInput.addEventListener('input', (e) => {
        e.stopPropagation();
        if (colorPicker && isColorPicker) {
          colorPicker.value = (valueInput as HTMLInputElement).value || '#ffffff';
        }
      });
    }

    if (colorPicker) {
      colorPicker.addEventListener('input', (e) => {
        e.stopPropagation();
        if (valueInput instanceof HTMLInputElement) {
          valueInput.value = colorPicker.value;
        }
      });
    }

    if (imageSelect) {
      imageSelect.addEventListener('change', (e) => {
        e.stopPropagation();
        if (imageSelect.value) {
          handleSubmit();
        }
      });

      imageSelect.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        } else if (e.key === 'Escape') {
          cancelBtn.click();
        }
      });
    }
  });
}
