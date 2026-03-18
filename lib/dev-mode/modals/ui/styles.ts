export const modalStyles = `
  /* Modal */
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
    color: var(--dev-danger);
    font-size: 11px;
  }

  .dev-modal-error:empty {
    display: none;
  }

  .dev-modal-footer {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
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
    border-color: var(--dev-primary-action);
    color: var(--dev-primary-action);
  }

  .dev-modal-btn-primary:hover {
    border-color: var(--dev-primary-action);
    color: white;
    background: var(--dev-primary-action);
    text-decoration: none;
  }

  .dev-modal-btn-danger {
    border-color: var(--dev-danger);
    color: var(--dev-danger);
  }

  .dev-modal-btn-danger:hover {
    border-color: var(--dev-danger);
    color: white;
    background: var(--dev-danger);
    text-decoration: none;
  }

  .dev-modal-btn:focus-visible {
    outline: 1px solid var(--dev-border-input);
    outline-offset: 2px;
  }

  .dev-modal-btn-danger:focus-visible {
    outline-color: var(--dev-danger);
  }
`;
