export const sidebarStyles = `
  #dev-settings-tray {
    position: relative;
    width: var(--sidebar-width, 340px);
    min-width: 240px;
    max-width: 600px;
    height: 100vh;
    flex-shrink: 0;
    background: var(--dev-bg-secondary);
    border-left: 1px solid var(--dev-border);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    display: flex;
    flex-direction: column;
  }
  
  #dev-settings-tray .sidebar-resize-handle {
    position: absolute;
    top: 0;
    left: -4px;
    width: 8px;
    height: 100%;
    cursor: col-resize;
    z-index: 10;
  }
  
  #dev-settings-tray .sidebar-resize-handle:hover,
  #dev-settings-tray .sidebar-resize-handle.dragging {
    background: var(--dev-accent);
    opacity: 0.5;
  }

  #dev-settings-tray .tray-content {
    flex: 1;
    overflow-y: auto;
    padding: 0;
  }

  /* Tabs */
  #dev-settings-tray .sidebar-tabs {
    display: flex;
    background: var(--dev-bg-tertiary);
    border-bottom: 1px solid var(--dev-border);
    flex-shrink: 0;
  }

  #dev-settings-tray .sidebar-tab {
    flex: 1;
    padding: 15px 12px;
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--dev-text-dimmed);
    font-size: 12px;
    font-weight: 600;
    font-family: inherit;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  #dev-settings-tray .sidebar-tab .sidebar-tab-icon {
    width: 14px;
    height: 14px;
    stroke: currentColor;
    flex-shrink: 0;
  }

  #dev-settings-tray .sidebar-tab:hover {
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
  }

  #dev-settings-tray .sidebar-tab.active {
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
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
    padding: 0;
  }

  #dev-settings-tray .project-section {
    padding: 0;
  }

  #dev-settings-tray .project-field {
    padding: 12px 20px;
    border-bottom: 1px solid var(--dev-bg-hover);
  }

  #dev-settings-tray .project-field-label {
    display: block;
    color: var(--dev-text-dimmed);
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 6px;
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
    border-radius: 4px;
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
    padding: 4px 12px;
  }

  #dev-settings-tray .project-list-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    border-radius: 4px;
    transition: background 0.15s;
  }

  #dev-settings-tray .project-list-item:hover {
    background: var(--dev-bg-hover);
  }

  #dev-settings-tray .project-list-item.active {
    background: var(--dev-bg-hover);
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
    padding: 7px 0;
    display: block;
    transition: color 0.15s;
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

  #dev-settings-tray .project-list-item-action svg {
    width: 14px;
    height: 14px;
    stroke: var(--dev-text-muted);
  }

  #dev-settings-tray .project-list-item-action.delete-version:hover svg,
  #dev-settings-tray .project-list-item-action.delete-ad-size:hover svg {
    stroke: var(--dev-danger);
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
    cursor: pointer;
    user-select: none;
  }
  
  #dev-settings-tray .var-section-header:hover {
    background: var(--dev-bg-hover);
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
    flex-shrink: 0;
  }
  
  #dev-settings-tray .var-section-chevron {
    width: 12px;
    height: 12px;
    stroke: var(--dev-text-faint);
    transition: transform 0.2s;
    flex-shrink: 0;
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
  }
  
  #dev-settings-tray .var-section-count {
    color: var(--dev-text-faint);
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
    color: var(--dev-text-muted);
    font-size: 12px;
    font-weight: 600;
    min-width: 100px;
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
    stroke: var(--dev-text-muted);
  }
  
  #dev-settings-tray .var-action-btn.var-delete:hover svg {
    stroke: var(--dev-danger);
  }
  
  #dev-settings-tray .var-action-btn.var-copy:hover svg {
    stroke: var(--dev-accent);
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
    padding: 12px 20px 8px;
    color: var(--dev-text-dimmed);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  #dev-settings-tray .sprite-subsection-count {
    color: var(--dev-text-faint);
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
    background: var(--dev-bg-hover);
    border-radius: 4px;
    padding: 8px 10px;
  }
  
  #dev-settings-tray .sprite-item:last-child {
    margin-bottom: 0;
  }
  
  #dev-settings-tray .sprite-name {
    color: var(--dev-text-secondary);
    font-size: 12px;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', monospace;
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
    width: 16px;
    height: 16px;
    stroke: var(--dev-text-muted);
  }
  
  #dev-settings-tray .sprite-copy-btn:hover svg {
    stroke: var(--dev-text-primary);
  }

  #dev-settings-tray .add-var-btn-bottom {
    display: flex;
    align-items: center;
    gap: 6px;
    background: transparent;
    border: 1px dashed var(--dev-border-input);
    border-radius: 4px;
    color: var(--dev-text-dimmed);
    padding: 8px 12px;
    margin: 8px 20px 16px;
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    width: calc(100% - 40px);
  }
  
  #dev-settings-tray .add-var-btn-bottom:hover {
    border-color: var(--dev-text-dimmed);
    color: var(--dev-text-muted);
    background: var(--dev-bg-hover);
  }
  
  #dev-settings-tray .add-var-btn-bottom svg {
    width: 12px;
    height: 12px;
    stroke: currentColor;
  }
  
  #dev-settings-tray .add-var-form {
    display: none;
    padding: 12px 20px;
    background: var(--dev-bg-tertiary);
    gap: 8px;
    flex-wrap: wrap;
  }
  
  #dev-settings-tray .add-var-form.active {
    display: flex;
  }
  
  #dev-settings-tray .add-var-input {
    flex: 1;
    min-width: 100px;
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
    flex: 1;
    min-width: 120px;
    background: var(--dev-bg-input);
    border: 1px solid var(--dev-border-input);
    border-radius: 4px;
    color: var(--dev-text-primary);
    padding: 6px 10px;
    font-size: 12px;
    font-family: inherit;
    cursor: pointer;
  }
  
  #dev-settings-tray .var-image-select:focus {
    outline: none;
    border-color: var(--dev-accent);
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
  
  #dev-settings-tray .add-var-submit {
    background: var(--dev-accent);
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
    background: var(--dev-accent-hover);
  }
  
  #dev-settings-tray .add-var-cancel {
    background: transparent;
    border: 1px solid var(--dev-border-hover);
    border-radius: 4px;
    color: var(--dev-text-muted);
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  #dev-settings-tray .add-var-cancel:hover {
    border-color: var(--dev-text-muted);
    color: var(--dev-text-primary);
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
    color: var(--dev-text-faint);
    font-size: 12px;
    font-style: italic;
    padding: 4px 0;
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
