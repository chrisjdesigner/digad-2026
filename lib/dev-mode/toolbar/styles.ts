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
    background: #222;
    position: relative;
  }

  /* Contain GSDevTools bar within the main area, not spanning the sidebar */
  .gs-dev-tools {
    width: calc(100% - var(--sidebar-width, 340px)) !important;
  }
`;

export const toolbarStyles = `
  #dev-toolbar {
    position: relative;
    top: 0;
    left: 0;
    height: 46px;
    background: #111111;
    display: flex;
    align-items: center;
    padding: 0 6px;
    gap: 10px;
    z-index: 999999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    flex-shrink: 0;
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
    background: transparent;
    border: none;
    border-radius: 4px;
    color: #888;
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
    color: #fff;
  }
  
  #dev-toolbar input[type="text"]::placeholder {
    color: #555;
  }
  
  #dev-toolbar .edit-btn {
    background: transparent;
    border: none;
    padding: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.4;
    transition: opacity 0.2s;
  }
  
  #dev-toolbar .edit-btn:hover {
    opacity: 1;
  }
  
  #dev-toolbar .edit-btn svg {
    width: 14px;
    height: 14px;
    stroke: #888;
  }
  
  #dev-toolbar .edit-btn:hover svg {
    stroke: #fff;
  }
  
  #dev-toolbar .input-prefix {
    color: #888;
    font-size: 12px;
    font-weight: 700;
    margin-left: 4px;
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
    gap: 0;
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
`;
