import { fetchJobSettings, saveJobSettings } from '../api/config-api';

export function setupJobSettings(currentAd: string): void {
  const jobNumberInput = document.getElementById('dev-job-number') as HTMLInputElement;
  const jobNameInput = document.getElementById('dev-job-name') as HTMLInputElement;
  const delayHoverToggle = document.getElementById('dev-delay-hover-toggle') as HTMLInputElement | null;
  let delayedHoverValue = false;
  let lastSavedState = '';

  const buildStateKey = (jobNumber: string, jobName: string, delayedHover: boolean): string => {
    return `${jobNumber}\u0000${jobName}\u0000${delayedHover ? '1' : '0'}`;
  };

  const emitJobSettingsChanged = (jobNumber: string, jobName: string, delayedHover: boolean) => {
    window.dispatchEvent(new CustomEvent('dev:job-settings-changed', {
      detail: { jobNumber, jobName, delayedHover },
    }));
  };

  // Load job settings and populate inputs
  fetchJobSettings()
    .then(data => {
      jobNumberInput.value = data.jobNumber || '';
      jobNameInput.value = data.jobName || '';
      delayedHoverValue = !!data.delayedHover;
      if (delayHoverToggle) {
        delayHoverToggle.checked = delayedHoverValue;
      }
      const jobNumber = jobNumberInput.value || '000000';
      const jobName = jobNameInput.value || 'job-name';
      lastSavedState = buildStateKey(jobNumber, jobName, delayedHoverValue);
      emitJobSettingsChanged(jobNumber, jobName, delayedHoverValue);
    })
    .catch(err => console.error('Failed to load job settings:', err));

  if (delayHoverToggle && currentAd === 'all') {
    delayHoverToggle.disabled = true;
  }

  // Save job settings on blur
  const save = async () => {
    const jobNumber = jobNumberInput.value || '000000';
    const jobName = jobNameInput.value || 'job-name';
    const delayedHover = delayHoverToggle && !delayHoverToggle.disabled
      ? !!delayHoverToggle.checked
      : delayedHoverValue;
    delayedHoverValue = delayedHover;
    const stateKey = buildStateKey(jobNumber, jobName, delayedHover);

    if (stateKey === lastSavedState) {
      return;
    }

    lastSavedState = stateKey;
    emitJobSettingsChanged(jobNumber, jobName, delayedHover);

    try {
      await saveJobSettings(jobNumber, jobName, delayedHover);
    } catch (err) {
      console.error('Failed to save job settings:', err);
      lastSavedState = '';
    }
  };

  jobNumberInput.addEventListener('blur', () => {
    void save();
  });
  jobNameInput.addEventListener('blur', () => {
    void save();
  });

  // Commit immediately on Enter or Tab.
  const handleEnterKey = (e: KeyboardEvent, input: HTMLInputElement) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void save();
      input.blur();
      return;
    }

    if (e.key === 'Tab') {
      void save();
    }
  };

  jobNumberInput.addEventListener('keydown', (e) => handleEnterKey(e, jobNumberInput));
  jobNameInput.addEventListener('keydown', (e) => handleEnterKey(e, jobNameInput));

  if (delayHoverToggle) {
    delayHoverToggle.addEventListener('change', async () => {
      const delayedHover = !!delayHoverToggle.checked;
      delayedHoverValue = delayedHover;

      try {
        void save();
        window.dispatchEvent(new CustomEvent('dev:hover-gate-setting-changed', {
          detail: { delayedHover },
        }));
      } catch (err) {
        console.error('Failed to update hover-gate setting:', err);
      }
    });
  }
}
