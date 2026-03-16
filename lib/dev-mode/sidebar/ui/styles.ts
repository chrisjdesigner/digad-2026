export const sidebarStyles = `
  #dev-settings-tray {
    position: relative;
    width: var(--sidebar-width, 340px);
    min-width: 370px;
    max-width: 600px;
    height: 100vh;
    flex-shrink: 0;
    background: var(--dev-bg-primary);
    border-left: 1px solid var(--dev-border);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    display: flex;
    flex-direction: column;
  }
  
  #dev-settings-tray .sidebar-resize-handle {
    position: absolute;
    top: 0;
    left: -1px;
    width: 2px;
    height: 100%;
    cursor: col-resize;
    z-index: 999999;
  }
  
  #dev-settings-tray .sidebar-resize-handle:hover,
  #dev-settings-tray .sidebar-resize-handle.dragging {
    background: var(--dev-resize-active);
    opacity: 1;
  }

  #dev-settings-tray .tray-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  /* Tabs */
  #dev-settings-tray .sidebar-tabs {
    display: flex;
    background: var(--dev-bg-primary);
    border-bottom: 1px solid var(--dev-border);
    flex-shrink: 0;
  }

  #dev-settings-tray .sidebar-tab {
    flex: 0 0 50%;
    padding: 17px 12px;
    background: var(--dev-bg-primary);
    border: none;
    color: var(--dev-text-faint);
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-width: 0;
    white-space: nowrap;
  }

  #dev-settings-tray .sidebar-tab:first-of-type {
    border-right: 1px solid var(--dev-border);
  }

  #dev-settings-tray .sidebar-tab .sidebar-tab-icon {
    width: 14px;
    height: 14px;
    fill: currentColor;
    flex-shrink: 0;
  }

  #dev-settings-tray .sidebar-tab .sidebar-tab-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  #dev-settings-tray .sidebar-tab:hover {
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
  }

  #dev-settings-tray .sidebar-tab.active {
    color: var(--dev-text-secondary);
    background: var(--dev-bg-section);
  }

  #dev-settings-tray .sidebar-tab-panel {
    display: none;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  #dev-settings-tray .sidebar-tab-panel.active {
    display: flex;
  }

  /* Project tab */
  #dev-settings-tray .project-fields {
    display: flex;
    flex-direction: column;
    gap: 17px;
    padding: 0;
  }

  #dev-settings-tray .project-section {
    padding: 0;
  }

  #dev-settings-tray .project-field {
    padding: 0;
  }

  #dev-settings-tray .project-field-label {
    display: block;
    color: var(--dev-text-dimmed);
    font-size: 10px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  #dev-settings-tray .project-field-input-wrap {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  #dev-settings-tray .project-field-input {
    flex: 1;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 8px;
    color: var(--dev-text-primary);
    padding: 7px 10px;
    font-size: 13px;
    font-weight: 600;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  #dev-settings-tray .project-field-input:hover {
    border-color: var(--dev-border-hover);
  }

  #dev-settings-tray .project-field-input:focus {
    outline: none;
    border-color: var(--dev-accent);
  }

  #dev-settings-tray .project-field-input::placeholder {
    color: var(--dev-text-faint);
  }

  #dev-settings-tray .project-field-edit {
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

  #dev-settings-tray .project-field-edit:hover {
    opacity: 1;
  }

  #dev-settings-tray .project-field-edit svg {
    width: 14px;
    height: 14px;
    stroke: var(--dev-text-muted);
  }

  #dev-settings-tray .project-field-edit:hover svg {
    stroke: var(--dev-text-primary);
  }

  /* Project list items (ad sizes, versions) */
  #dev-settings-tray .project-list {
    padding: 0;
  }

  #dev-settings-tray .project-list-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  #dev-settings-tray .project-list-item.active .project-list-item-link {
    background: var(--dev-bg-hover);
    border: 1px solid var(--dev-border);
  }

  #dev-settings-tray .project-list-item.active .project-list-item-link {
    color: var(--dev-text-primary);
  }

  #dev-settings-tray .project-list-item-link {
    flex: 1;
    color: var(--dev-text-muted);
    font-size: 12px;
    font-weight: 600;
    text-decoration: none;
    padding: 7px 15px;
    border-radius: 9999px;
    display: block;
    transition: all 0.15s;
  }

  #dev-settings-tray .project-list-item-link:hover {
    color: var(--dev-text-primary);
  }

  #dev-settings-tray .project-list-item-action {
    background: transparent;
    border: none;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.3;
    transition: opacity 0.15s;
    flex-shrink: 0;
  }

  #dev-settings-tray .project-list-item-action:hover {
    opacity: 1;
  }

  #dev-settings-tray .project-list-item-action:disabled {
    opacity: 0.15;
    cursor: not-allowed;
    pointer-events: none;
  }

  #dev-settings-tray .project-list-item-action svg {
    width: 14px;
    height: 14px;
    fill: var(--dev-text-muted);
  }

  #dev-settings-tray .project-list-item-action.delete-version:hover svg,
  #dev-settings-tray .project-list-item-action.delete-ad-size:hover svg {
    fill: var(--dev-danger);
  }
  
  #dev-settings-tray .var-section {
    border-bottom: 1px solid var(--dev-border);
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
    background: var(--dev-bg-section);
    border-bottom: 1px solid var(--dev-border);
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease, border-color 0.2s ease;
  }
  
  #dev-settings-tray .var-section-header:hover {
    background: var(--dev-bg-hover);
  }

  #dev-settings-tray .var-section-header:hover .var-section-title,
  #dev-settings-tray .var-section-header:hover .var-section-count,
  #dev-settings-tray .var-section-header:hover .var-section-icon,
  #dev-settings-tray .var-section-header:hover .var-section-chevron {
    color: var(--dev-text-secondary);
    stroke: var(--dev-text-secondary);
  }
  
  #dev-settings-tray .var-section-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  #dev-settings-tray .var-section-icon {
    width: 16px;
    height: 16px;
    stroke: var(--dev-text-dimmed);
    color: var(--dev-text-dimmed);
    flex-shrink: 0;
    transition: color 0.2s ease, stroke 0.2s ease;
  }
  
  #dev-settings-tray .var-section-chevron {
    width: 12px;
    height: 12px;
    stroke: var(--dev-text-faint);
    flex-shrink: 0;
    transition: transform 0.2s ease, stroke 0.2s ease;
  }
  
  #dev-settings-tray .var-section.collapsed .var-section-chevron {
    transform: rotate(-90deg);
  }
  
  #dev-settings-tray .var-section-title {
    color: var(--dev-text-muted);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.2s ease;
  }
  
  #dev-settings-tray .var-section-count {
    color: var(--dev-text-faint);
    font-size: 10px;
    font-weight: 600;
    transition: color 0.2s ease;
  }

  #dev-settings-tray .var-section-view-all {
    font-size: 10px;
    font-weight: 600;
    color: var(--dev-text-faint);
    text-decoration: none;
    padding: 3px 8px;
    border-radius: 99px;
    border: 1px solid var(--dev-border);
    transition: all 0.15s;
    letter-spacing: 0.3px;
    cursor: pointer;
  }

  #dev-settings-tray .var-section-view-all:hover {
    border-color: var(--dev-border-hover);
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
  }

  #dev-settings-tray .var-section-body {
    /* container for var-list and add button */
    padding: 15px 15px;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
  
  #dev-settings-tray .var-list {
    padding: 0;
  }
  
  #dev-settings-tray .var-item {
    display: flex;
    align-items: stretch;
    gap: 8px;
    margin-bottom: 10px;
    position: relative;
  }

  #dev-settings-tray .var-item.dragging {
    opacity: 0.55;
  }

  #dev-settings-tray .var-item.drop-before::before,
  #dev-settings-tray .var-item.drop-after::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    border-radius: 2px;
    background: var(--dev-resize-active);
    pointer-events: none;
  }

  #dev-settings-tray .var-item.drop-before::before {
    top: -6px;
  }

  #dev-settings-tray .var-item.drop-after::after {
    bottom: -6px;
  }

  #dev-settings-tray .var-main {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  #dev-settings-tray .var-drag-handle {
    background: transparent;
    border: none;
    color: var(--dev-text-dimmed);
    width: 14px;
    height: 29px;
    padding: 0;
    cursor: grab;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    align-self: flex-end;
    transition: color 0.2s, border-color 0.2s;
  }

  #dev-settings-tray .var-drag-handle:active {
    cursor: grabbing;
  }

  #dev-settings-tray .var-drag-handle:hover {
    color: var(--dev-text-secondary);
    border-color: var(--dev-border-hover);
  }

  #dev-settings-tray .var-drag-handle svg {
    width: 14px;
    height: 14px;
    stroke: currentColor;
  }
  
  #dev-settings-tray .var-item:last-child {
    margin-bottom: 0;
  }
  
  #dev-settings-tray .var-name {
    color: var(--dev-text-dimmed);
    font-size: 10px;
    font-weight: 600;
    width: 100%;
    flex-shrink: 0;
  }
  
  #dev-settings-tray .var-input {
    flex: 1;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    color: var(--dev-text-primary);
    padding: 6px 10px;
    font-size: 12px;
    font-family: inherit;
    transition: border-color 0.2s;
  }
  
  #dev-settings-tray .var-input:hover {
    border-color: var(--dev-border-hover);
  }
  
  #dev-settings-tray .var-input:focus {
    outline: none;
    border-color: var(--dev-accent);
  }
  
  #dev-settings-tray .var-color-input {
    width: 32px;
    height: 28px;
    padding: 2px;
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    background: var(--dev-bg-input);
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

  #dev-settings-tray .var-image-select {
    appearance: none;
    -webkit-appearance: none;
    flex: 1;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    color: var(--dev-text-primary);
    padding: 6px 33px 6px 10px;
    font-size: 12px;
    font-family: inherit;
    transition: border-color 0.2s;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 14px;
  }

  #dev-settings-tray .var-image-select:hover {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23fff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
    border-color: var(--dev-border-hover);
  }

  #dev-settings-tray .var-image-select:focus {
    outline: none;
    border-color: var(--dev-accent);
  }

  #dev-settings-tray .var-image-select option {
    background: var(--dev-bg-primary);
    color: var(--dev-text-primary);
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
    -webkit-appearance: none;
  }
  
  #dev-settings-tray .var-action-btn:hover {
    opacity: 1;
  }

  #dev-settings-tray .var-action-btn:focus-visible {
    outline: none;
  }
  
  #dev-settings-tray .var-action-btn svg {
    width: 14px;
    height: 14px;
    fill: var(--dev-text-muted);
  }
  
  #dev-settings-tray .var-action-btn.var-delete:hover svg {
    fill: var(--dev-danger);
  }
  
  #dev-settings-tray .var-action-btn.var-copy:hover svg {
    fill: var(--dev-text-primary);
  }
  
  /* Sprite subsection styles */
  #dev-settings-tray .sprite-subsection {
    border-top: 1px solid var(--dev-border);
    margin-top: 8px;
  }
  
  #dev-settings-tray .sprite-subsection-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 0 8px;
    color: var(--dev-text-dimmed);
    font-size: 10px;
    font-weight: 600;
  }
  
  #dev-settings-tray .sprite-subsection-count {
    color: var(--dev-text-faint);
    font-weight: 400;
  }
  
  #dev-settings-tray .sprite-list {
    padding: 0 0 12px;
  }
  
  #dev-settings-tray .sprite-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
    background: var(--dev-bg-section);
    border: 1px solid var(--dev-border);
    border-radius: 10px;
    padding: 8px 10px;
  }
  
  #dev-settings-tray .sprite-item:last-child {
    margin-bottom: 0;
  }
  
  #dev-settings-tray .sprite-name {
    color: var(--dev-text-secondary);
    font-size: 10px;
    flex: 1;
  }
  
  #dev-settings-tray .sprite-filename {
    color: var(--dev-text-faint);
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
    width: 13px;
    height: 13px;
    fill: var(--dev-text-muted);
  }
  
  #dev-settings-tray .sprite-copy-btn:hover svg {
    fill: var(--dev-text-primary);
  }

  #dev-settings-tray .add-var-btn-bottom {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px solid var(--dev-border-input);
    border-radius: 9999px;
    color: var(--dev-text-dimmed);
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: 100%;
  }
  
  #dev-settings-tray .add-var-btn-bottom:hover {
    border-color: var(--dev-border-hover);
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
  }
  
  #dev-settings-tray .add-var-btn-bottom svg {
    width: 12px;
    height: 12px;
    stroke: currentColor;
  }
  
  #dev-settings-tray .add-var-form {
    display: none;
    flex-direction: row;
    align-items: center;
    padding: 10px 12px;
    border: 1px solid var(--dev-border);
    border-radius: 10px;
    background: var(--dev-bg-section);
    gap: 8px;
    flex-wrap: wrap;
  }
  
  #dev-settings-tray .add-var-form.active {
    display: flex;
  }
  
  #dev-settings-tray .add-var-form-inputs {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 8px;
    min-width: 210px;
  }
  
  #dev-settings-tray .add-var-form-actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
  }
  
  #dev-settings-tray .add-var-input {
    flex: 1;
    min-width: 0;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    color: var(--dev-text-primary);
    padding: 6px 10px;
    font-size: 12px;
    font-family: inherit;
  }
  
  #dev-settings-tray .add-var-input:focus {
    outline: none;
    border-color: var(--dev-accent);
  }
  
  #dev-settings-tray .var-image-select {
    appearance: none;
    -webkit-appearance: none;
    flex: 1;
    min-width: 0;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    color: var(--dev-text-primary);
    padding: 6px 33px 6px 10px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 14px;
  }
  
  #dev-settings-tray .var-image-select:focus {
    outline: none;
    border-color: var(--dev-accent);
  }

  #dev-settings-tray .var-image-select:hover {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23fff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  }

  [data-dev-theme="light"] #dev-settings-tray .var-image-select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  }

  [data-dev-theme="light"] #dev-settings-tray .var-image-select:hover {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23111'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  }
  
  #dev-settings-tray .add-var-color {
    width: 36px;
    height: 30px;
    padding: 2px;
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    background: var(--dev-bg-input);
    cursor: pointer;
  }
  
  #dev-settings-tray .add-var-cancel {
    display: none;
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9999px;
    color: var(--dev-text-dimmed);
    padding: 6px 15px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  #dev-settings-tray .add-var-cancel:hover {
    color: var(--dev-text-secondary);
    text-decoration: underline;
  }

  #dev-settings-tray .add-var-color-input-wrapper {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    overflow: hidden;
  }

  #dev-settings-tray .add-var-color-picker {
    width: 40px;
    height: 32px;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
    flex-shrink: 0;
    outline: none;
    box-shadow: none;
    background: transparent;
  }

  #dev-settings-tray .add-var-color-picker::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  #dev-settings-tray .add-var-color-picker::-webkit-color-swatch {
    border: none;
  }

  #dev-settings-tray .add-var-color-input-wrapper .add-var-input {
    flex: 1;
    border: none;
    border-radius: 0;
    padding: 6px 10px;
    background: transparent;
    min-width: 0;
  }

  #dev-settings-tray .add-var-error {
    width: 100%;
    color: var(--dev-danger);
    font-size: 11px;
    line-height: 1.25;
    min-height: 0;
  }

  #dev-settings-tray .add-var-error:empty {
    display: none;
  }
  
  #dev-settings-tray .sync-notice {
    padding: 12px 20px;
    background: var(--dev-bg-section);
    color: var(--dev-text-muted);
    font-size: 11px;
    border-top: 1px solid var(--dev-border);
  }
  
  #dev-settings-tray .sync-notice strong {
    color: var(--dev-text-secondary);
  }
  
  #dev-settings-tray .empty-message {
    color: var(--dev-text-muted);
    font-size: 12px;
    font-style: italic;
    padding: 4px 0;
  }

  /* Create size/version modal */
  .dev-modal-backdrop {
    position: fixed;
    inset: 0;
    background: var(--dev-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000000;
    padding: 20px;
    backdrop-filter: blur(10px);
  }

  .dev-modal {
    width: min(460px, 92vw);
    background: var(--dev-bg-primary);
    border: 1px solid var(--dev-border);
    border-radius: 12px;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .dev-modal-header {
    color: var(--dev-text-secondary);
    font-size: 15px;
    font-weight: 700;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--dev-border);
  }

  .dev-modal-body {
    display: flex;
    flex-direction: column;
    padding: 20px 0;
    gap: 20px;
  }

  .dev-modal-group {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .dev-modal-label {
    color: var(--dev-text-dimmed);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .dev-modal-choice-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .dev-modal-choice-btn {
    background: transparent;
    border: 1px solid var(--dev-border-input);
    color: var(--dev-text-muted);
    border-radius: 9999px;
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }

  .dev-modal-choice-btn:hover {
    border-color: var(--dev-border-hover);
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
  }

  .dev-modal-choice-btn.active {
    border-color: var(--dev-border-hover);
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
  }

  .dev-modal-input {
    width: 100%;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 8px;
    color: var(--dev-text-primary);
    padding: 8px 10px;
    font-size: 12px;
    font-family: inherit;
  }

  .dev-modal-size-field {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .dev-modal-size-input {
    appearance: none;
    -webkit-appearance: none;
    padding-right: 33px;
  }

  .dev-modal-size-field.open .dev-modal-size-input {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    border-color: var(--dev-border-hover);
  }

  .dev-modal-size-suggestions {
    display: none;
    position: absolute;
    top: calc(100% - 1px);
    left: 0;
    right: 0;
    z-index: 10;
    border: 1px solid var(--dev-border-input);
    border-top: none;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    background: var(--dev-bg-input);
    max-height: 180px;
    overflow-y: auto;
  }

  .dev-modal-size-field.open .dev-modal-size-suggestions {
    display: block;
    border-color: var(--dev-border-hover);
  }

  .dev-modal-size-suggestion {
    display: block;
    width: 100%;
    background: transparent;
    border: none;
    border-top: 1px solid var(--dev-border);
    color: var(--dev-text-muted);
    text-align: left;
    padding: 8px 10px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
    transition: background-color 0.15s, color 0.15s;
  }

  .dev-modal-size-suggestion:first-child {
    border-top: none;
  }

  .dev-modal-size-suggestion:hover,
  .dev-modal-size-suggestion.active {
    background: var(--dev-bg-hover);
    color: var(--dev-text-secondary);
  }

  .dev-modal-input:focus {
    outline: none;
    border-color: var(--dev-accent);
  }

  .dev-modal-error {
    min-height: 0;
    margin-top: 8px;
    color: var(--dev-danger);
    font-size: 11px;
  }

  .dev-modal-error:empty {
    display: none;
  }

  .dev-modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 12px;
    gap: 8px;
    border-top: 1px solid var(--dev-border);
  }

  .dev-modal-btn {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 9999px;
    color: var(--dev-text-dimmed);
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .dev-modal-btn:hover {
    color: var(--dev-text-secondary);
    text-decoration: underline;
  }

  .dev-modal-btn-primary {
    border-color: var(--dev-border-input);
    color: var(--dev-text-secondary);
  }

  .dev-modal-btn-primary:hover {
    border-color: var(--dev-border-hover);
    background: var(--dev-bg-hover);
    text-decoration: none;
  }

  .dev-modal-btn-danger {
    border-color: #dc2626;
    color: #dc2626;
  }

  .dev-modal-btn-danger:hover {
    border-color: #991b1b;
    color: #fff;
    background: #dc2626;
    text-decoration: none;
  }

  .dev-modal-btn:focus-visible {
    outline: 1px solid var(--dev-border-input);
    outline-offset: 2px;
  }

  .dev-modal-btn-danger:focus-visible {
    outline-color: #dc2626;
  }

  /* Loading overlay */
  #dev-loading-overlay {
    position: fixed;
    inset: 0;
    background: var(--dev-overlay);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 100000;
    gap: 16px;
  }

  #dev-loading-overlay .spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--dev-spinner-track);
    border-top-color: var(--dev-accent);
    border-radius: 50%;
    animation: dev-spin 0.7s linear infinite;
  }

  #dev-loading-overlay .spinner-label {
    color: var(--dev-text-secondary);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
  }

  @keyframes dev-spin {
    to { transform: rotate(360deg); }
  }
`;
