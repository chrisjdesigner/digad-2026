import { createModalShell } from '../ui/modal-shell';

export function showDeleteConfirmModal(itemName: string, itemType: string = 'variable'): Promise<boolean> {
  return new Promise((resolve) => {
    const { body, confirmBtn, cancelBtn, close } = createModalShell(`Delete ${itemType === 'variable' ? 'Variable' : itemType}`);

    const message = document.createElement('div');
    message.style.color = 'var(--dev-text-secondary)';
    message.style.fontSize = '14px';
    message.style.lineHeight = '1.5';
    message.style.marginBottom = '4px';
    message.textContent = `Remove "${itemName}" from all versions?`;

    const warning = document.createElement('div');
    warning.style.color = 'var(--dev-text-muted)';
    warning.style.fontSize = '12px';
    warning.style.marginTop = '8px';
    warning.textContent = 'This cannot be undone.';

    body.append(message, warning);

    confirmBtn.textContent = 'Delete';
    confirmBtn.className = 'dev-modal-btn dev-modal-btn-danger';

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        finish(false);
      }
    };

    const finish = (result: boolean) => {
      document.removeEventListener('keydown', onEsc);
      close();
      resolve(result);
    };

    cancelBtn.addEventListener('click', () => finish(false));
    confirmBtn.addEventListener('click', () => finish(true));
    document.addEventListener('keydown', onEsc);
    
    // Focus delete button after modal is in DOM
    confirmBtn.focus();
  });
}
