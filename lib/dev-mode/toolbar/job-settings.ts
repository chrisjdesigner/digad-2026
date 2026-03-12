import { fetchJobSettings, saveJobSettings } from './config-api';

export function setupJobSettings(): void {
  const jobNumberInput = document.getElementById('dev-job-number') as HTMLInputElement;
  const jobNameInput = document.getElementById('dev-job-name') as HTMLInputElement;
  const editJobNumberBtn = document.getElementById('dev-edit-job-number') as HTMLButtonElement;
  const editJobNameBtn = document.getElementById('dev-edit-job-name') as HTMLButtonElement;

  // Load job settings and populate inputs
  fetchJobSettings()
    .then(data => {
      jobNumberInput.value = '#' + (data.jobNumber || '');
      jobNameInput.value = data.jobName || '';
    })
    .catch(err => console.error('Failed to load job settings:', err));

  // Save job settings on blur (strip # from job number)
  const save = () => {
    const jobNumber = jobNumberInput.value.replace(/^#/, '') || '000000';
    // Ensure # is always shown in the input
    if (!jobNumberInput.value.startsWith('#')) {
      jobNumberInput.value = '#' + jobNumber;
    }
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

  // Edit button handlers - clear input and focus
  editJobNumberBtn.addEventListener('click', () => {
    jobNumberInput.value = '#';
    jobNumberInput.focus();
  });

  editJobNameBtn.addEventListener('click', () => {
    jobNameInput.value = '';
    jobNameInput.focus();
  });
}
