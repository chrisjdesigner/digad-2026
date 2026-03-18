import { createModalShell } from '../ui/modal-shell';

export function showCreateSizeModal(
  allSizes: string[],
  defaultSourceSize: string,
  suggestions: string[],
): Promise<{ sourceSize: string; newSizeName: string } | null> {
  return new Promise((resolve) => {
    const { backdrop, modal, body, error, confirmBtn, cancelBtn, close } = createModalShell('Create New Ad Size');
    let selectedSource = defaultSourceSize;
    let highlightedSuggestion = -1;

    const sourceLabel = document.createElement('div');
    sourceLabel.className = 'dev-modal-label';
    sourceLabel.textContent = 'Duplicate from';

    const sourceChoices = document.createElement('div');
    sourceChoices.className = 'dev-modal-choice-grid';

    allSizes.forEach((size) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dev-modal-choice-btn';
      if (size === selectedSource) btn.classList.add('active');
      btn.textContent = size;
      btn.addEventListener('click', () => {
        selectedSource = size;
        sourceChoices.querySelectorAll('.dev-modal-choice-btn').forEach(el => el.classList.remove('active'));
        btn.classList.add('active');
      });
      sourceChoices.appendChild(btn);
    });

    const nameLabel = document.createElement('div');
    nameLabel.className = 'dev-modal-label';
    nameLabel.textContent = 'New ad size';

    const nameInput = document.createElement('input');
    nameInput.className = 'dev-modal-input dev-modal-size-input';
    nameInput.type = 'text';
    nameInput.placeholder = 'e.g. 728x90';

    const sizeField = document.createElement('div');
    sizeField.className = 'dev-modal-size-field';
    const suggestionList = document.createElement('div');
    suggestionList.className = 'dev-modal-size-suggestions';
    sizeField.append(nameInput, suggestionList);

    const sourceGroup = document.createElement('div');
    sourceGroup.className = 'dev-modal-group';
    sourceGroup.append(sourceLabel, sourceChoices);

    const nameGroup = document.createElement('div');
    nameGroup.className = 'dev-modal-group';
    nameGroup.append(nameLabel, sizeField);

    body.append(sourceGroup, nameGroup, error);

    const getFilteredSuggestions = () => {
      const value = nameInput.value.trim().toLowerCase();
      if (!value) return [];
      return suggestions.filter(size => size.toLowerCase().includes(value));
    };

    const closeSuggestions = () => {
      sizeField.classList.remove('open');
      highlightedSuggestion = -1;
    };

    const openSuggestions = () => {
      const filtered = getFilteredSuggestions();
      if (filtered.length === 0) {
        closeSuggestions();
        return;
      }
      sizeField.classList.add('open');
    };

    const renderSuggestions = () => {
      const filtered = getFilteredSuggestions();
      suggestionList.innerHTML = '';
      highlightedSuggestion = Math.min(highlightedSuggestion, filtered.length - 1);

      filtered.forEach((size, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'dev-modal-size-suggestion';
        if (index === highlightedSuggestion) item.classList.add('active');
        item.textContent = size;
        item.addEventListener('click', () => {
          nameInput.value = size;
          closeSuggestions();
          nameInput.focus();
        });
        suggestionList.appendChild(item);
      });

      if (filtered.length > 0) {
        openSuggestions();
        const activeItem = suggestionList.querySelector('.dev-modal-size-suggestion.active') as HTMLButtonElement | null;
        if (activeItem) {
          activeItem.scrollIntoView({ block: 'nearest' });
        }
      } else {
        closeSuggestions();
      }
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        finish(null);
      }
    };

    const finish = (result: { sourceSize: string; newSizeName: string } | null) => {
      document.removeEventListener('keydown', onEsc);
      document.removeEventListener('mousedown', onOutsideClick);
      close();
      resolve(result);
    };

    const onOutsideClick = (e: MouseEvent) => {
      if (!sizeField.contains(e.target as Node)) {
        closeSuggestions();
      }
    };

    cancelBtn.addEventListener('click', () => finish(null));
    document.addEventListener('keydown', onEsc);
    document.addEventListener('mousedown', onOutsideClick);

    nameInput.addEventListener('focus', () => {
      closeSuggestions();
    });

    nameInput.addEventListener('input', () => {
      renderSuggestions();
    });

    nameInput.addEventListener('keydown', (e) => {
      const filtered = getFilteredSuggestions();

      if (e.key === 'ArrowDown') {
        if (filtered.length === 0) return;
        e.preventDefault();
        highlightedSuggestion = Math.min(highlightedSuggestion + 1, filtered.length - 1);
        renderSuggestions();
        return;
      }

      if (e.key === 'ArrowUp') {
        if (filtered.length === 0) return;
        e.preventDefault();
        highlightedSuggestion = Math.max(highlightedSuggestion - 1, 0);
        renderSuggestions();
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (sizeField.classList.contains('open') && highlightedSuggestion >= 0 && filtered.length > 0) {
          nameInput.value = filtered[highlightedSuggestion];
          closeSuggestions();
        }
        submitCreate();
      }
    });

    modal.addEventListener('click', () => {
      if (document.activeElement !== nameInput) {
        closeSuggestions();
      }
    });

    const submitCreate = () => {
      const newSizeName = nameInput.value.trim();
      if (!newSizeName) {
        error.textContent = 'Please enter a size name.';
        nameInput.focus();
        return;
      }
      if (!/^\d+x\d+(-\w+)*$/.test(newSizeName)) {
        error.textContent = 'Size name must be in format WIDTHxHEIGHT (e.g. 728x90).';
        nameInput.focus();
        return;
      }
      finish({ sourceSize: selectedSource, newSizeName });
    };

    confirmBtn.addEventListener('click', submitCreate);

    nameInput.focus();
  });
}
