import html2canvas from 'html2canvas-pro';
import { cameraIcon, checkIcon } from './icons';

export function setupScreenshot(
  currentAd: string,
  currentVariant: string | null,
): void {
  const screenshotBtn = document.getElementById('dev-screenshot-btn') as HTMLButtonElement | null;
  if (!screenshotBtn) return;

  const defaultBtnContent = `${cameraIcon} Take a Screenshot`;

  screenshotBtn.addEventListener('click', async () => {
    screenshotBtn.disabled = true;
    screenshotBtn.innerHTML = '<div class="spinner"></div> Take a Screenshot';

    try {
      // Find the ad container - typically the first element after the toolbar
      const adContainer = document.querySelector('.ad, #ad, main, [class*="banner"], [id*="banner"]') as HTMLElement
        || document.body.children[1] as HTMLElement;

      if (!adContainer || adContainer.id === 'dev-toolbar') {
        throw new Error('Could not find ad container');
      }

      // Capture the ad at 2x resolution for better quality
      const hiResCanvas = await html2canvas(adContainer, {
        backgroundColor: null,
        useCORS: true,
        logging: false,
        scale: 2,
      });

      // Create a canvas at 1x resolution and draw the 2x image scaled down
      const canvas = document.createElement('canvas');
      canvas.width = hiResCanvas.width / 2;
      canvas.height = hiResCanvas.height / 2;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(hiResCanvas, 0, 0, canvas.width, canvas.height);

      // Convert to JPEG
      const imageData = canvas.toDataURL('image/jpeg', 0.8);

      // Send to server
      const response = await fetch('/api/save-screenshot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adSize: currentAd,
          version: currentVariant || 'v1',
          imageData,
        }),
      });

      const result = await response.json();

      if (result.success) {
        screenshotBtn.innerHTML = `${checkIcon} Take a Screenshot`;
        setTimeout(() => {
          screenshotBtn.innerHTML = defaultBtnContent;
          screenshotBtn.disabled = false;
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to save screenshot');
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      screenshotBtn.innerHTML = '✗ Take a Screenshot';
      setTimeout(() => {
        screenshotBtn.innerHTML = defaultBtnContent;
        screenshotBtn.disabled = false;
      }, 2000);
    }
  });
}
