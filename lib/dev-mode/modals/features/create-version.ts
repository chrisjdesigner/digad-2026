import { createModalShell } from '../ui/modal-shell';

export function showCreateVersionModal(
  variants: string[],
  suggestedName: string,
): Promise<{ sourceVersion: string; newVersionName: string } | null> {
  return new Promise((resolve) => {
    const { backdrop, body, error, confirmBtn, cancelBtn, close } = createModalShell('Create New Version');
    const allVersions = ['Base', ...variants];
    let selectedSource = 'base';

    const sourceLabel = document.createElement('div');
    sourceLabel.className = 'dev-modal-label';
    sourceLabel.textContent = 'Duplicate from';

    const sourceChoices = document.createElement('div');
    sourceChoices.className = 'dev-modal-choice-grid';

    allVersions.forEach((label, index) => {
      const value = index === 0 ? 'base' : variants[index - 1];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dev-modal-choice-btn';
      if (value === selectedSource) btn.classList.add('active');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        selectedSource = value;
        sourceChoices.querySelectorAll('.dev-modal-choice-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
      });
      sourceChoices.appendChild(btn);
    });

    const nameLabel = document.createElement('div');
    nameLabel.className = 'dev-modal-label';
    nameLabel.textContent = 'New version name';

    const nameInput = document.createElement('input');
    nameInput.className = 'dev-modal-input';
    nameInput.type = 'text';
    nameInput.value = suggestedName;
    nameInput.placeholder = 'v2';

    const sourceGroup = document.createElement('div');
    sourceGroup.className = 'dev-modal-group';
    sourceGroup.append(sourceLabel, sourceChoices);

    const nameGroup = document.createElement('div');
    nameGroup.className = 'dev-modal-group';
    nameGroup.append(nameLabel, nameInput);

    body.append(sourceGroup, nameGroup, error);

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        finish(null);
      }
    };

    const finish = (result: { sourceVersion: string; newVersionName: string } | null) => {
      document.removeEventListener('keydown', onEsc);
      close();
      resolve(result);
    };

    cancelBtn.addEventListener('click', () => finish(null));
    document.addEventListener('keydown', onEsc);

    const submitCreate = () => {
      const newVersionName = nameInput.value.trim();
      if (!newVersionName) {
        error.textContent = 'Please enter a version name.';
        nameInput.focus();
        return;
      }
      if (!/^[a-zA-Z0-9-]+$/.test(newVersionName)) {
        error.textContent = 'Version name must contain only letters, numbers, and hyphens.';
        nameInput.focus();
        return;
      }
      finish({ sourceVersion: selectedSource, newVersionName });
    };

    nameInput.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      submitCreate();
    });

    confirmBtn.addEventListener('click', submitCreate);

    nameInput.focus();
    nameInput.select();
  });
}
