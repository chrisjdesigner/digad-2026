import { fetchConfig, fetchJobSettings, saveHoverGateSetting, saveJobSettings } from '../api/config-api';

export function setupJobSettings(currentAd: string, currentVariant: string | null): void {
  const jobNumberInput = document.getElementById('dev-job-number') as HTMLInputElement;
  const jobNameInput = document.getElementById('dev-job-name') as HTMLInputElement;
  const delayHoverToggle = document.getElementById('dev-delay-hover-toggle') as HTMLInputElement | null;

  // Load job settings and populate inputs
  fetchJobSettings()
    .then(data => {
      jobNumberInput.value = data.jobNumber || '';
      jobNameInput.value = data.jobName || '';
    })
    .catch(err => console.error('Failed to load job settings:', err));

  if (delayHoverToggle && currentAd !== 'all') {
    fetchConfig(currentAd, currentVariant)
      .then(data => {
        delayHoverToggle.checked = !!(data.templateVariables?.delayedHover ?? data.templateVariables?.requireMainTimelineCompleteForHover);
      })
      .catch(err => console.error('Failed to load hover-gate setting from config:', err));
  }

  if (delayHoverToggle && currentAd === 'all') {
    delayHoverToggle.disabled = true;
    delayHoverToggle.checked = false;
  }

  // Save job settings on blur
  const save = () => {
    const jobNumber = jobNumberInput.value || '000000';
    const delayedHover = !!delayHoverToggle?.checked;
    saveJobSettings(jobNumber, jobNameInput.value || 'job-name', delayedHover)
      .catch(err => console.error('Failed to save job settings:', err));
  };

  jobNumberInput.addEventListener('blur', save);
  jobNameInput.addEventListener('blur', save);

  // Handle Enter key - blur to save
  const handleEnterKey = (e: KeyboardEvent, input: HTMLInputElement) => {
    if (e.key === 'Enter') {
      input.blur();
    }
  };

  jobNumberInput.addEventListener('keydown', (e) => handleEnterKey(e, jobNumberInput));
  jobNameInput.addEventListener('keydown', (e) => handleEnterKey(e, jobNameInput));

  if (delayHoverToggle && currentAd !== 'all') {
    delayHoverToggle.addEventListener('change', async () => {
      const delayedHover = !!delayHoverToggle.checked;

      try {
        await saveHoverGateSetting(currentAd, delayedHover);
        window.dispatchEvent(new CustomEvent('dev:hover-gate-setting-changed', {
          detail: { delayedHover },
        }));
      } catch (err) {
        console.error('Failed to update hover-gate setting:', err);
      }
    });
  }
}
