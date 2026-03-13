export const layoutStyles = `
  #dev-layout-wrapper {
    display: flex;
    height: 100vh;
    overflow: hidden;
  }

  #dev-layout-main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  #dev-ad-content {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: auto;
    background: var(--dev-ad-content-bg);
    position: relative;
  }

  /* Contain GSDevTools bar within the main area, not spanning the sidebar */
  .gs-dev-tools {
    width: calc(100% - var(--sidebar-width, 340px)) !important;
  }

  #dev-layout-wrapper.no-sidebar .gs-dev-tools {
    width: 100% !important;
  }

  /* GSDevTools light mode overrides */
  [data-dev-theme="light"] .gs-dev-tools .gs-bottom {
    background: rgba(240, 240, 240, 1) !important;
    border-top: 1px solid #ddd !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .gs-top {
    background: rgba(240, 240, 240, 0.95) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .timeline-track {
    background: #ccc !important;
  }

  [data-dev-theme="light"] .gs-dev-tools label {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools label span {
    color: rgba(0, 0, 0, 0.7) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .gs-btn-white {
    fill: rgba(0, 0, 0, 0.5) !important;
    stroke: none !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .time-scale,
  [data-dev-theme="light"] .gs-dev-tools .time-container {
    color: rgba(0, 0, 0, 0.5) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .time-scale span {
    color: rgba(0, 0, 0, 0.5) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .select-animation-container {
    background: rgba(0, 0, 0, 0) !important;
    border-color: #ccc !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .select-animation {
    color: rgba(0, 0, 0, 0.6) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .select-arrow-shape {
    stroke: rgba(0, 0, 0, 0.5) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .loop-path {
    fill: rgba(0, 0, 0, 0.5) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .ease-path {
    stroke: rgba(0, 0, 0, 0.5) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .ease-border {
    fill: rgba(0, 0, 0, 0.15) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .grab {
    stroke: rgba(0, 0, 0, 0.3) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .rewind-path {
    opacity: .5 !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .in-point-shape {
    stroke: rgba(0, 0, 0, 0.3) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools .out-point-shape {
    stroke: rgba(0, 0, 0, 0.3) !important;
  }

  [data-dev-theme="light"] .gs-dev-tools.minimal .gs-top,
  [data-dev-theme="light"] .gs-dev-tools.minimal .gs-bottom {
    background: rgba(240, 240, 240, 1) !important;
  }
`;

export const toolbarStyles = `
  #dev-toolbar {
    position: relative;
    top: 0;
    left: 0;
    height: 48px;
    background: var(--dev-bg-primary);
    display: flex;
    align-items: center;
    padding: 0 18px;
    gap: 10px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--dev-border);
  }
  
  #dev-toolbar label {
    color: var(--dev-text-muted);
    font-size: 11px;
    letter-spacing: 0.5px;
  }
  
  #dev-toolbar select {
    appearance: none;
    -webkit-appearance: none;
    background: var(--dev-bg-secondary);
    border: 1px solid var(--dev-border);
    border-radius: 9999px;
    transition: all 0.2s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23888'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 14px;
    font-weight: 700;
    color: var(--dev-text-muted);
    padding: 6px 33px 6px 15px;
    font-size: 13px;
    cursor: pointer;
  }
  
  #dev-toolbar select:hover {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23fff'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
    color: var(--dev-text-secondary);
    border-color: var(--dev-border-hover) !important;
    background-color: var(--dev-bg-hover);
  }

  [data-dev-theme="light"] #dev-toolbar select {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  }

  [data-dev-theme="light"] #dev-toolbar select:hover {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23111'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m19.5 8.25-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E");
  }
  
  #dev-toolbar select:focus {
    outline: none;
    border-color: var(--dev-accent);
  }
  
  #dev-toolbar input[type="text"] {
    background: transparent;
    border: none;
    border-radius: 4px;
    color: var(--dev-text-muted);
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
    color: var(--dev-text-primary);
  }
  
  #dev-toolbar input[type="text"]::placeholder {
    color: var(--dev-text-faint);
  }
  
  #dev-toolbar .input-prefix {
    color: var(--dev-text-muted);
    font-size: 12px;
    font-weight: 700;
    margin-left: 4px;
  }
  
  #dev-toolbar .input-label {
    color: var(--dev-text-dimmed);
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

  #dev-toolbar .toolbar-brand {
    padding-right: 6px;
    margin-right: 2px;
  }

  #dev-toolbar .toolbar-brand-logo {
    display: inline-flex;
    align-items: center;
    color: var(--dev-text-primary);
  }

  #dev-toolbar .toolbar-brand-logo svg {
    display: block;
    width: 18px;
    height: auto;
    max-height: 28px;
  }
  
  #dev-toolbar .toolbar-divider {
    width: 1px;
    height: 24px;
    background: var(--dev-border);
    margin: 0 8px;
  }
  
  #dev-toolbar .toolbar-spacer {
    flex: 1;
  }
  
  #dev-toolbar button {
    background: var(--dev-bg-secondary);
    border: 1px solid var(--dev-border);
    border-radius: 9999px;
    color: var(--dev-text-muted);
    padding: 6px 15px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  
  #dev-toolbar button svg {
    width: 16px;
    height: 16px;
    stroke: var(--dev-text-muted);
    transition: stroke 0.2s;
  }
  
  #dev-toolbar button:hover {
    border-color: var(--dev-border-hover);
    color: var(--dev-text-secondary);
    background: var(--dev-bg-hover);
  }
  
  #dev-toolbar button:hover svg {
    stroke: var(--dev-text-primary);
  }
  
  #dev-toolbar button:active {
    background: var(--dev-bg-input);
  }
  
  #dev-toolbar button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  #dev-toolbar .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--dev-text-faint);
    border-top-color: var(--dev-text-muted);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Theme toggle switch */
  .theme-switch {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
    margin: 0;
    padding: 0;
  }

  .theme-switch input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }

  .theme-switch-track {
    position: relative;
    width: 52px;
    height: 28px;
    background: var(--dev-bg-secondary);
    border-radius: 14px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    border: 1px solid var(--dev-border);
  }

  .theme-switch:hover .theme-switch-track {
    border-color: var(--dev-border-hover);
    background: var(--dev-bg-hover);
  }

  .theme-switch input:checked ~ .theme-switch-track {
    background: var(--dev-bg-hover);
  }

  .theme-switch-thumb {
    position: absolute;
    left: 3px;
    width: 22px;
    height: 22px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .theme-switch input:checked ~ .theme-switch-track .theme-switch-thumb {
    transform: translateX(24px);
  }

  .theme-switch-icon {
    display: none;
    align-items: center;
    justify-content: center;
  }

  .theme-switch-icon svg {
    width: 14px;
    height: 14px;
  }

  /* Dark mode: show moon icon in thumb */
  .theme-switch-icon--moon {
    display: flex;
    color: #2a2a2a;
  }
  .theme-switch-icon--sun {
    display: none;
  }

  /* Light mode: show sun icon in thumb */
  .theme-switch input:checked ~ .theme-switch-track .theme-switch-icon--moon {
    display: none;
  }
  .theme-switch input:checked ~ .theme-switch-track .theme-switch-icon--sun {
    display: flex;
  }
`;
