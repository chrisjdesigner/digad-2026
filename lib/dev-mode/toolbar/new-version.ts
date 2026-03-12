import type { AdConfig } from './types';
import { createVersion } from './config-api';

export function setupNewVersion(
  adConfigs: AdConfig[],
  currentAd: string,
): void {
  const newVersionBtn = document.getElementById('dev-new-version-btn') as HTMLButtonElement | null;
  if (!newVersionBtn) return;

  const defaultContent = newVersionBtn.innerHTML;

  newVersionBtn.addEventListener('click', async () => {
    const ad = adConfigs.find(a => a.name === currentAd);
    const variants = ad?.variants || [];
    const allVersions = ['Base', ...variants];

    // Determine source version
    let sourceVersion: string;

    if (allVersions.length === 1) {
      // Only Base exists — skip the prompt
      sourceVersion = 'base';
    } else {
      // Ask which version to duplicate
      const choices = allVersions.map((v, i) => `${i + 1}. ${v}`).join('\n');
      const input = prompt(`Which version would you like to duplicate?\n\n${choices}\n\nEnter the number:`);

      if (!input) return; // Cancelled

      const index = parseInt(input, 10) - 1;
      if (isNaN(index) || index < 0 || index >= allVersions.length) {
        alert('Invalid selection.');
        return;
      }

      sourceVersion = index === 0 ? 'base' : variants[index - 1];
    }

    // Generate the next version name (v2, v3, v4, etc.)
    const existingVersionNumbers = variants
      .map(v => {
        const match = v.match(/^v(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    const nextNumber = existingVersionNumbers.length > 0
      ? Math.max(...existingVersionNumbers) + 1
      : 2;

    const suggestedName = `v${nextNumber}`;
    const newName = prompt('Enter a name for the new version:', suggestedName);

    if (!newName) return; // Cancelled

    try {
      newVersionBtn.disabled = true;
      newVersionBtn.textContent = 'Creating...';

      await createVersion(currentAd, newName, sourceVersion);

      // Navigate to the new version
      window.location.href = `/${currentAd}/${newName}.html`;
    } catch (error) {
      alert(`Failed to create version: ${(error as Error).message}`);
      newVersionBtn.disabled = false;
      newVersionBtn.innerHTML = defaultContent;
    }
  });
}
