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
    justify-content: flex-start;
    overflow-x: auto;
    overflow-y: auto;
    padding: 20px;
    box-sizing: border-box;
    scrollbar-gutter: stable both-edges;
    background: var(--dev-ad-content-bg);
    position: relative;
  }

  #dev-ad-content > * {
    flex-shrink: 0;
    margin-left: auto;
    margin-right: auto;
  }

  #dev-layout-wrapper.is-all-view #dev-ad-content {
    align-items: flex-start;
    justify-content: flex-start;
    padding: 0;
  }

  #dev-layout-wrapper.is-all-view #dev-ad-content > * {
    margin-left: 0;
    margin-right: 0;
    min-width: 100%;
  }

  .dev-preview-stage {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    gap: 10px;
    max-width: none;
    flex-shrink: 0;
    padding: 24px;
  }

  .dev-preview-ad-shell {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    max-width: none;
    flex-shrink: 0;
    position: relative;
    background: var(--dev-bg-secondary, #181819);
    box-shadow: 0 4px 12px var(--dev-shadow, rgba(0, 0, 0, 0.3));
  }

  .dev-preview-ad-shell > :not(.dev-preview-loading) {
    max-width: none;
    flex-shrink: 0;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.22s ease;
  }

  .dev-preview-ad-shell.is-ready > :not(.dev-preview-loading) {
    opacity: 1;
    visibility: visible;
  }

  .dev-preview-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    width: 100%;
  }

  .dev-preview-loading {
    position: absolute;
    inset: 0;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--dev-bg-secondary, #181819);
    transition: opacity 0.2s ease, visibility 0.2s ease;
    pointer-events: none;
  }

  .dev-preview-ad-shell.is-ready .dev-preview-loading {
    opacity: 0;
    visibility: hidden;
  }

  .dev-preview-loading .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid var(--dev-spinner-track, #2B2C2E);
    border-top-color: var(--dev-accent, #909090);
    border-radius: 50%;
    animation: preview-spin 0.7s linear infinite;
  }

  @keyframes preview-spin {
    to { transform: rotate(360deg); }
  }

  .dev-preview-replay-btn {
    appearance: none;
    -webkit-appearance: none;
    border: 1px solid var(--dev-border);
    border-radius: 9999px;
    background: var(--dev-bg-secondary);
    color: var(--dev-text-muted);
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .dev-preview-replay-btn svg {
    width: 14px;
    height: 14px;
    display: block;
    transform-origin: center;
    transition: transform 0.45s ease;
  }

  .dev-preview-replay-btn:hover {
    color: var(--dev-text-primary);
    background: var(--dev-bg-hover);
    border-color: var(--dev-border-hover);
  }

  .dev-preview-replay-btn:hover svg {
    transform: rotate(360deg);
  }

  .dev-preview-replay-btn:focus-visible {
    outline: 2px solid var(--dev-accent);
    outline-offset: 2px;
  }

  @media (max-width: 720px) {
    .dev-preview-stage {
      padding: 16px;
    }
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
    font-family: var(--dev-ui-font-family, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
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
    text-decoration: none;
    opacity: 0.85;
    transition: opacity 0.15s ease;
  }

  #dev-toolbar .toolbar-brand-logo:hover {
    opacity: 1;
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

  #dev-toolbar button.success svg {
    stroke: #22c55e;
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
