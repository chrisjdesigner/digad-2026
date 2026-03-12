import type { AdConfig } from './types';

export function setupNavigation(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): void {
  const sizeSelect = document.getElementById('dev-size-select') as HTMLSelectElement;
  const versionSelect = document.getElementById('dev-version-select') as HTMLSelectElement | null;

  // Populate version options based on current ad
  function updateVersionOptions(adName: string) {
    if (!versionSelect) return;

    // Hide version dropdown when "all" sizes is selected
    if (adName === 'all') {
      versionSelect.style.display = 'none';
      return;
    }
    versionSelect.style.display = '';

    const ad = adConfigs.find(a => a.name === adName);
    const variants = ad?.variants || [];

    versionSelect.innerHTML = `
      <option value="">Base</option>
      ${variants.map(v => `
        <option value="${v}" ${v === currentVariant ? 'selected' : ''}>${v}</option>
      `).join('')}
      <option value="all" ${currentVariant === 'all' ? 'selected' : ''}>All</option>
    `;
  }

  // Initialize version options
  updateVersionOptions(currentAd);

  // Handle size change
  sizeSelect.addEventListener('change', () => {
    const newSize = sizeSelect.value;
    if (newSize === 'all') {
      window.location.href = '/all.html';
    } else {
      // Navigate to base version of new size
      window.location.href = `/${newSize}/index.html`;
    }
  });

  // Handle version change
  if (versionSelect) {
    versionSelect.addEventListener('change', () => {
      const newVersion = versionSelect.value;
      if (newVersion) {
        window.location.href = `/${currentAd}/${newVersion}.html`;
      } else {
        window.location.href = `/${currentAd}/index.html`;
      }
    });
  }
}
