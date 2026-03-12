import type { ConfigData } from '../toolbar/types';
import { escapeHtml, toHexColor } from '../toolbar/utils';
import { copyIcon, trashIcon, checkIcon } from '../toolbar/icons';
import { postConfig, syncVariable, fetchSprites } from '../toolbar/config-api';

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

    // CSS variable inputs (all categories)
    [cssColorsList, cssImagesList, cssTypographyList, cssOtherList].forEach(list => {
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

        // Text input handlers - revert on blur, save only on Enter
        input.addEventListener('blur', () => {
          input.value = originalValue;
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

  // Save config to server
  async function saveConfig() {
    try {
      await postConfig(currentAd, currentVariant, configData);
    } catch (error) {
      console.error('Failed to save config:', error);
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
