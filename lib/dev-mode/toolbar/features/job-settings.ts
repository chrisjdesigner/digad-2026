import { fetchJobSettings, saveJobSettings } from '../api/config-api';

export function setupJobSettings(): void {
  const jobNumberInput = document.getElementById('dev-job-number') as HTMLInputElement;
  const jobNameInput = document.getElementById('dev-job-name') as HTMLInputElement;

  // Load job settings and populate inputs
  fetchJobSettings()
    .then(data => {
      jobNumberInput.value = data.jobNumber || '';
      jobNameInput.value = data.jobName || '';
    })
    .catch(err => console.error('Failed to load job settings:', err));

  // Save job settings on blur
  const save = () => {
    const jobNumber = jobNumberInput.value || '000000';
    saveJobSettings(jobNumber, jobNameInput.value || 'job-name')
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
}
