export interface ModalShell {
  backdrop: HTMLDivElement;
  modal: HTMLDivElement;
  body: HTMLDivElement;
  error: HTMLDivElement;
  confirmBtn: HTMLButtonElement;
  cancelBtn: HTMLButtonElement;
  close: () => void;
}

export function createModalShell(title: string): ModalShell {
  const backdrop = document.createElement('div');
  backdrop.className = 'dev-modal-backdrop';

  const modal = document.createElement('div');
  modal.className = 'dev-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');

  const header = document.createElement('div');
  header.className = 'dev-modal-header';
  header.textContent = title;

  const body = document.createElement('div');
  body.className = 'dev-modal-body';

  const error = document.createElement('div');
  error.className = 'dev-modal-error';

  const footer = document.createElement('div');
  footer.className = 'dev-modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'dev-modal-btn';
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'dev-modal-btn dev-modal-btn-primary';
  confirmBtn.type = 'button';
  confirmBtn.textContent = 'Create';

  footer.append(cancelBtn, confirmBtn);
  modal.append(header, body, footer);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  const close = () => {
    backdrop.remove();
  };

  return { backdrop, modal, body, error, confirmBtn, cancelBtn, close };
}
