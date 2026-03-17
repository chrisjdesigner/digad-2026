import type { ConfigData } from '../../toolbar/models/types';
import { escapeHtml, toHexColor } from '../../toolbar/shared/utils';
import { copyIcon, trashIcon, checkIcon } from '../../toolbar/ui/icons';
import { postConfig, syncVariable, syncVariableOrder, fetchSprites, fetchImages } from '../../toolbar/api/config-api';
import { showDeleteConfirmModal } from '../sidebar';

const dragHandleIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="9" y1="6" x2="9" y2="6"/><line x1="9" y1="12" x2="9" y2="12"/><line x1="9" y1="18" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="6"/><line x1="15" y1="12" x2="15" y2="12"/><line x1="15" y1="18" x2="15" y2="18"/></svg>';

export interface VariableElements {
  templateVarsList: HTMLDivElement;
  cssColorsList: HTMLDivElement;
  cssImagesList: HTMLDivElement;
  cssTypographyList: HTMLDivElement;
  cssOtherList: HTMLDivElement;
  spriteImagesList: HTMLDivElement;
  spritesCount: HTMLSpanElement;
}

export function setupVariables(
  elements: VariableElements,
  currentAd: string,
  currentVariant: string | null,
  configData: ConfigData,
) {
  const {
    templateVarsList,
    cssColorsList,
    cssImagesList,
    cssTypographyList,
    cssOtherList,
    spriteImagesList,
    spritesCount,
  } = elements;

  type CssCategory = 'colors' | 'images' | 'typography' | 'other';

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

  // Helper for copy feedback - show checkmark briefly
  function showCopyFeedback(btn: HTMLButtonElement) {
    const originalIcon = btn.innerHTML;
    btn.innerHTML = checkIcon;
    btn.style.opacity = '1';
    btn.querySelector('svg')!.style.stroke = '#22c55e';
    setTimeout(() => {
      btn.innerHTML = originalIcon;
      btn.style.opacity = '';
    }, 1500);
  }

  // Render variable lists
  function renderVariables() {
    // Render template variables
    const templateVars = Object.entries(configData.templateVariables);
    if (templateVars.length === 0) {
      templateVarsList.innerHTML = '<div class="empty-message">No variables have been defined</div>';
    } else {
      templateVarsList.innerHTML = templateVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}">
          <button class="var-drag-handle" type="button" title="Drag to reorder" aria-label="Drag to reorder">${dragHandleIcon}</button>
          <div class="var-main">
            <span class="var-name">${name}</span>
            <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
            <button class="var-action-btn var-copy" title="Copy as template variable">${copyIcon}</button>
            <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
          </div>
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
      cssColorsList.innerHTML = '<div class="empty-message">No variables have been defined</div>';
    } else {
      cssColorsList.innerHTML = colorVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="colors">
          <button class="var-drag-handle" type="button" title="Drag to reorder" aria-label="Drag to reorder">${dragHandleIcon}</button>
          <div class="var-main">
            <span class="var-name">${name}</span>
            <input type="color" class="var-color-input" tabindex="-1" value="${toHexColor(String(value))}" data-original="${escapeHtml(String(value))}" />
            <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
            <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
            <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
          </div>
        </div>
      `).join('');
    }

    // Render image variables as dropdowns
    if (imageVars.length === 0) {
      cssImagesList.innerHTML = '<div class="empty-message">No variables have been defined</div>';
    } else {
      cssImagesList.innerHTML = imageVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="images">
          <button class="var-drag-handle" type="button" title="Drag to reorder" aria-label="Drag to reorder">${dragHandleIcon}</button>
          <div class="var-main">
            <span class="var-name">${name}</span>
            <select class="var-image-select">
              <option value="">Loading images...</option>
            </select>
            <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
            <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
          </div>
        </div>
      `).join('');
      
      // Load images for all dropdowns after rendering
      loadImageSelects();
    }

    // Render typography variables
    if (typographyVars.length === 0) {
      cssTypographyList.innerHTML = '<div class="empty-message">No variables have been defined</div>';
    } else {
      cssTypographyList.innerHTML = typographyVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="typography">
          <button class="var-drag-handle" type="button" title="Drag to reorder" aria-label="Drag to reorder">${dragHandleIcon}</button>
          <div class="var-main">
            <span class="var-name">${name}</span>
            <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
            <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
            <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
          </div>
        </div>
      `).join('');
    }

    // Render other variables
    if (otherVars.length === 0) {
      cssOtherList.innerHTML = '<div class="empty-message">No variables have been defined</div>';
    } else {
      cssOtherList.innerHTML = otherVars.map(([name, value]) => `
        <div class="var-item" data-name="${name}" data-category="other">
          <button class="var-drag-handle" type="button" title="Drag to reorder" aria-label="Drag to reorder">${dragHandleIcon}</button>
          <div class="var-main">
            <span class="var-name">${name}</span>
            <input type="text" class="var-input" value="${escapeHtml(String(value))}" />
            <button class="var-action-btn var-copy" title="Copy as CSS variable">${copyIcon}</button>
            <button class="var-action-btn var-delete" title="Remove from all versions">${trashIcon}</button>
          </div>
        </div>
      `).join('');
    }

    // Attach event listeners to inputs
    attachVariableListeners();
    attachReorderListeners();
  }

  function reorderRecordByDomOrder(listEl: HTMLDivElement, source: Record<string, string>): Record<string, string> {
    const reordered: Record<string, string> = {};
    listEl.querySelectorAll('.var-item').forEach(item => {
      const name = item.getAttribute('data-name');
      if (name && Object.prototype.hasOwnProperty.call(source, name)) {
        reordered[name] = source[name];
      }
    });

    // Keep any keys that might not be represented in the DOM as a safeguard.
    Object.keys(source).forEach(name => {
      if (!Object.prototype.hasOwnProperty.call(reordered, name)) {
        reordered[name] = source[name];
      }
    });

    return reordered;
  }

  function attachReorderListeners() {
    const attachForList = (
      listEl: HTMLDivElement,
      onReorder: () => Promise<void>,
    ) => {
      let draggedItem: HTMLDivElement | null = null;
      let didReorder = false;
      let lastPlacement: { item: HTMLDivElement; after: boolean } | null = null;

      const BEFORE_ZONE_MAX = 0.42;
      const AFTER_ZONE_MIN = 0.58;

      const clearIndicators = () => {
        listEl.querySelectorAll('.var-item.drop-before, .var-item.drop-after').forEach(el => {
          el.classList.remove('drop-before', 'drop-after');
        });
      };

      listEl.querySelectorAll('.var-item').forEach(el => {
        const item = el as HTMLDivElement;
        item.draggable = false;

        const handle = item.querySelector('.var-drag-handle') as HTMLButtonElement | null;
        if (handle) {
          handle.addEventListener('mousedown', () => {
            item.classList.add('drag-armed');
            item.draggable = true;
          });

          handle.addEventListener('mouseup', () => {
            if (!item.classList.contains('dragging')) {
              item.classList.remove('drag-armed');
              item.draggable = false;
            }
          });
        }

        item.addEventListener('dragstart', (event) => {
          if (!item.classList.contains('drag-armed')) {
            event.preventDefault();
            return;
          }

          draggedItem = item;
          didReorder = false;
          lastPlacement = null;
          item.classList.add('dragging');
          if (event.dataTransfer) {
            event.dataTransfer.effectAllowed = 'move';
            event.dataTransfer.setData('text/plain', item.getAttribute('data-name') || '');
          }
        });

        item.addEventListener('dragend', () => {
          item.classList.remove('dragging');
          item.classList.remove('drag-armed');
          item.draggable = false;
          clearIndicators();
          lastPlacement = null;
          draggedItem = null;
        });

        item.addEventListener('dragover', (event) => {
          if (!draggedItem || draggedItem === item) return;
          event.preventDefault();

          const rect = item.getBoundingClientRect();
          const pointerRatio = (event.clientY - rect.top) / rect.height;

          // Use a dead zone around midpoint so the item does not jitter when the cursor is near center.
          if (pointerRatio > BEFORE_ZONE_MAX && pointerRatio < AFTER_ZONE_MIN) {
            return;
          }

          const shouldInsertAfter = pointerRatio >= AFTER_ZONE_MIN;
          if (lastPlacement && lastPlacement.item === item && lastPlacement.after === shouldInsertAfter) {
            return;
          }

          const alreadyInSpot = shouldInsertAfter
            ? item.nextElementSibling === draggedItem
            : item.previousElementSibling === draggedItem;

          clearIndicators();
          if (alreadyInSpot) {
            // Do not show a placement line for a no-op slot.
            // This ensures any visible line always means a real move target.
            lastPlacement = null;
            return;
          }

          if (shouldInsertAfter) {
            item.after(draggedItem);
            item.classList.add('drop-after');
          } else {
            item.before(draggedItem);
            item.classList.add('drop-before');
          }
          lastPlacement = { item, after: shouldInsertAfter };
          didReorder = true;
        });
      });

      listEl.addEventListener('drop', async (event) => {
        if (!draggedItem) return;
        event.preventDefault();
        clearIndicators();
        lastPlacement = null;
        if (didReorder) {
          await onReorder();
        }
      });

      listEl.addEventListener('dragover', (event) => {
        if (!draggedItem) return;
        // Allow dropping anywhere in the list bounds (including small gaps).
        event.preventDefault();
      });

      listEl.addEventListener('dragleave', (event) => {
        const related = event.relatedTarget as Node | null;
        if (related && listEl.contains(related)) return;
        clearIndicators();
        lastPlacement = null;
      });
    };

    attachForList(templateVarsList, async () => {
      configData.templateVariables = reorderRecordByDomOrder(templateVarsList, configData.templateVariables);
      await syncVariableOrder(currentAd, 'template', Object.keys(configData.templateVariables));
    });

    const attachCssReorder = (listEl: HTMLDivElement, category: CssCategory) => {
      attachForList(listEl, async () => {
        configData.cssVariables[category] = reorderRecordByDomOrder(listEl, configData.cssVariables[category]);
        await syncVariableOrder(currentAd, 'css', Object.keys(configData.cssVariables[category]), category);
      });
    };

    attachCssReorder(cssColorsList, 'colors');
    attachCssReorder(cssImagesList, 'images');
    attachCssReorder(cssTypographyList, 'typography');
    attachCssReorder(cssOtherList, 'other');
  }

  // Attach listeners to variable inputs and delete buttons
  function attachVariableListeners() {
    // Template variable inputs
    templateVarsList.querySelectorAll('.var-item').forEach(item => {
      const name = item.getAttribute('data-name')!;
      const input = item.querySelector('.var-input') as HTMLInputElement;
      const copyBtn = item.querySelector('.var-copy') as HTMLButtonElement;
      const deleteBtn = item.querySelector('.var-delete') as HTMLButtonElement;

      let originalValue = input.value;

      input.addEventListener('focus', () => {
        originalValue = input.value;
      });

      input.addEventListener('blur', () => {
        input.value = originalValue;
      });

      input.addEventListener('input', (e) => {
        e.stopPropagation();
      });

      input.addEventListener('keydown', (e) => {
        e.stopPropagation();
        if (e.key === 'Enter') {
          e.preventDefault();
          originalValue = input.value;
          configData.templateVariables[name] = input.value;
          saveConfig().then(() => {
            // Template variables are server-rendered, reload to apply
            window.location.reload();
          });
        } else if (e.key === 'Tab') {
          originalValue = input.value;
          configData.templateVariables[name] = input.value;
          saveConfig();
        } else if (e.key === 'Escape') {
          input.value = originalValue;
          input.blur();
        }
      });

      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const templateVar = `{{{${name}}}}`;
          try {
            await navigator.clipboard.writeText(templateVar);
            showCopyFeedback(copyBtn);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
      }

      deleteBtn.addEventListener('click', async () => {
        const confirmed = await showDeleteConfirmModal(name, 'Variable');
        if (confirmed) {
          deleteVariable(name, 'template');
        }
      });
    });

    // CSS variable inputs (all categories)
    [cssColorsList, cssTypographyList, cssOtherList].forEach(list => {
      list.querySelectorAll('.var-item').forEach(item => {
        const name = item.getAttribute('data-name')!;
        const input = item.querySelector('.var-input') as HTMLInputElement;
        const colorInput = item.querySelector('.var-color-input') as HTMLInputElement;
        const copyBtn = item.querySelector('.var-copy') as HTMLButtonElement;
        const deleteBtn = item.querySelector('.var-delete') as HTMLButtonElement;
        const category = item.getAttribute('data-category') as 'colors' | 'images' | 'typography' | 'other';

        let originalValue = input.value;

        input.addEventListener('focus', () => {
          originalValue = input.value;
        });

        // Text input handlers - revert on blur, save on Enter/Tab
        input.addEventListener('blur', () => {
          input.value = originalValue;
          document.documentElement.style.setProperty(`--${category}-${name}`, originalValue);
          if (colorInput) {
            colorInput.value = toHexColor(originalValue);
          }
        });

        input.addEventListener('input', (e) => {
          e.stopPropagation();
        });

        input.addEventListener('keydown', (e) => {
          e.stopPropagation();
          if (e.key === 'Enter') {
            e.preventDefault();
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
          } else if (e.key === 'Tab') {
            originalValue = input.value;
            if (category && configData.cssVariables[category]) {
              configData.cssVariables[category][name] = input.value;
            }
            document.documentElement.style.setProperty(`--${category}-${name}`, input.value);
            saveConfig();
            if (colorInput) {
              colorInput.value = toHexColor(input.value);
            }
          } else if (e.key === 'Escape') {
            input.value = originalValue;
            input.blur();
          }
        });

        // Color picker handler
        if (colorInput) {
          colorInput.addEventListener('input', (e) => {
            e.stopPropagation();
            input.value = colorInput.value;
            if (category && configData.cssVariables[category]) {
              configData.cssVariables[category][name] = colorInput.value;
            }
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
        deleteBtn.addEventListener('click', async () => {
          const confirmed = await showDeleteConfirmModal(name, 'Variable');
          if (confirmed) {
            deleteVariable(name, 'css', category);
          }
        });
      });
    });

    // Image variable selects - handled separately
    cssImagesList.querySelectorAll('.var-item').forEach(item => {
      const name = item.getAttribute('data-name')!;
      const select = item.querySelector('.var-image-select') as HTMLSelectElement;
      const copyBtn = item.querySelector('.var-copy') as HTMLButtonElement;
      const deleteBtn = item.querySelector('.var-delete') as HTMLButtonElement;
      const currentValue = configData.cssVariables.images[name];

      if (select) {
        select.addEventListener('change', () => {
          const newValue = select.value;
          if (newValue) {
            configData.cssVariables.images[name] = newValue;
            document.documentElement.style.setProperty('--images-' + name, newValue);
            saveConfig();
          }
        });

        // Set initial value
        if (currentValue) {
          select.value = currentValue;
        }
      }

      if (copyBtn) {
        copyBtn.addEventListener('click', async () => {
          const cssVar = `var(--images-${name})`;
          try {
            await navigator.clipboard.writeText(cssVar);
            showCopyFeedback(copyBtn);
          } catch (err) {
            console.error('Failed to copy:', err);
          }
        });
      }

      deleteBtn.addEventListener('click', async () => {
        const confirmed = await showDeleteConfirmModal(name, 'Variable');
        if (confirmed) {
          deleteVariable(name, 'css', 'images');
        }
      });
    });
  }

  // Load available images into all image selection dropdowns
  async function loadImageSelects() {
    try {
      const images = await fetchImages(currentAd);
      
      cssImagesList.querySelectorAll('.var-image-select').forEach(selectEl => {
        const select = selectEl as HTMLSelectElement;
        const varItem = select.closest('.var-item');
        const varName = varItem?.getAttribute('data-name');
        const currentValue = varName ? configData.cssVariables.images[varName] : '';
        
        if (images.length > 0) {
          // Build options without placeholder if we have a current value
          const hasCurrentValue = currentValue && images.some(img => img.cssValue === currentValue);
          const placeholderOption = hasCurrentValue 
            ? '' 
            : '<option value="">Select an image...</option>';
          
          select.innerHTML = placeholderOption +
            images.map(img =>
              `<option value="${img.cssValue}">${img.filename}</option>`
            ).join('');
          
          // Set to current value if it exists
          if (currentValue) {
            select.value = currentValue;
          }
        } else {
          select.innerHTML = '<option value="">No images found in src/img/</option>';
        }
      });
    } catch (error) {
      console.error('Failed to load images:', error);
      cssImagesList.querySelectorAll('.var-image-select').forEach(selectEl => {
        const select = selectEl as HTMLSelectElement;
        select.innerHTML = '<option value="">Error loading images</option>';
      });
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

  // Save config to server – serialised to prevent concurrent request races.
  // If a save is already in flight, queue one more attempt so the final state
  // is always persisted even if edits arrive while a request is pending.
  let _saveInFlight = false;
  let _savePending = false;

  async function saveConfig() {
    if (_saveInFlight) {
      _savePending = true;
      return;
    }
    _saveInFlight = true;
    _savePending = false;
    try {
      await postConfig(currentAd, currentVariant, configData);
    } catch (error) {
      console.error('Failed to save config:', error);
    } finally {
      _saveInFlight = false;
      if (_savePending) {
        // A write arrived while we were in flight – persist it now.
        void saveConfig();
      }
    }
  }

  // Add variable to all versions
  async function addVariable(name: string, defaultValue: string, type: 'template' | 'css', category?: 'colors' | 'images' | 'typography' | 'other') {
    try {
      await syncVariable(currentAd, name, type, 'add', defaultValue, category);

      // Update local state
      if (type === 'template') {
        configData.templateVariables[name] = defaultValue;
      } else if (category) {
        configData.cssVariables[category][name] = defaultValue;
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
      await syncVariable(currentAd, name, type, 'remove');

      // Update local state
      if (type === 'template') {
        delete configData.templateVariables[name];
      } else if (category && configData.cssVariables[category]) {
        delete configData.cssVariables[category][name];
        document.documentElement.style.removeProperty(`--${category}-${name}`);
      }

      renderVariables();
    } catch (error) {
      console.error('Failed to delete variable:', error);
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
      const sprites = await fetchSprites(currentAd);
      if (spritesCount) spritesCount.textContent = `(${sprites.length})`;

      if (sprites.length === 0) {
        spriteImagesList.innerHTML = '<div class="empty-message">No sprite images found</div>';
        return;
      }

      spriteImagesList.innerHTML = sprites.map(sprite => `
        <div class="sprite-item" data-name="${sprite.name}">
          <span class="sprite-name">${sprite.name}</span>
          <span class="sprite-filename">${sprite.file}</span>
          <button class="sprite-copy-btn" title="Copy SCSS include">${copyIcon}</button>
        </div>
      `).join('');

      attachSpriteListeners();
    } catch (error) {
      console.error('Failed to load sprites:', error);
      spriteImagesList.innerHTML = '<div class="empty-message">Failed to load sprites</div>';
      if (spritesCount) spritesCount.textContent = '(0)';
    }
  }

  return {
    renderVariables,
    loadSprites,
    addVariable,
    updateSectionCounts,
  };
}
