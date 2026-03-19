import type { AdConfig } from '../models/types';

export function setupNavigation(
  adConfigs: AdConfig[],
  currentAd: string,
  currentVariant: string | null,
): void {
  const sizeSelect = document.getElementById('dev-size-select') as HTMLSelectElement;
  const versionSelect = document.getElementById('dev-version-select') as HTMLSelectElement | null;
  const isPreviewMode = window.__DEV_PREVIEW_MODE__ === true;

  function getSizeHref(newSize: string) {
    if (!isPreviewMode) {
      if (newSize === 'all') {
        return '/all.html';
      }

      return `/${newSize}/index.html`;
    }

    if (newSize === 'all') {
      return '../all.html';
    }

    return `../${newSize}/all.html`;
  }

  function getVersionHref(newVersion: string) {
    if (!isPreviewMode) {
      if (newVersion === 'all') {
        return `/${currentAd}/all.html`;
      }

      if (newVersion) {
        return `/${currentAd}/${newVersion}.html`;
      }

      return `/${currentAd}/index.html`;
    }

    if (newVersion === 'all') {
      return './all.html';
    }

    if (newVersion) {
      return `./${newVersion}.html`;
    }

    return './index.html';
  }

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
    window.location.href = getSizeHref(newSize);
  });

  // Handle version change
  if (versionSelect) {
    versionSelect.addEventListener('change', () => {
      const newVersion = versionSelect.value;
      window.location.href = getVersionHref(newVersion);
    });
  }
}
