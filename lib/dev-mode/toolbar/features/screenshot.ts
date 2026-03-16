import html2canvas from 'html2canvas-pro';
import { cameraIcon, checkIcon } from '../ui/icons';

function findAdContainer(currentAd: string): HTMLElement | null {
  const adContent = document.getElementById('dev-ad-content');
  if (!adContent) return null;

  const commonSelector = [
    '#banner',
    '#ad',
    '.ad',
    'main',
    '[class*="banner"]',
    '[id*="banner"]',
  ].join(', ');

  const explicit = adContent.querySelector(commonSelector) as HTMLElement | null;
  if (explicit) return explicit;

  const sizeMatch = currentAd.match(/^(\d+)x(\d+)/);
  if (sizeMatch) {
    const expectedWidth = parseInt(sizeMatch[1], 10);
    const expectedHeight = parseInt(sizeMatch[2], 10);
    const allElements = Array.from(adContent.querySelectorAll('*')) as HTMLElement[];
    const byDimensions = allElements.find((el) => {
      const rect = el.getBoundingClientRect();
      return Math.round(rect.width) === expectedWidth && Math.round(rect.height) === expectedHeight;
    });
    if (byDimensions) return byDimensions;
  }

  const firstChild = Array.from(adContent.children).find((el) => {
    const tag = el.tagName;
    return tag !== 'SCRIPT' && tag !== 'STYLE';
  }) as HTMLElement | undefined;

  return firstChild || null;
}

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
      const adContainer = findAdContainer(currentAd);
      if (!adContainer) {
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
      const imageData = canvas.toDataURL('image/jpeg', 0.98);

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
        screenshotBtn.classList.add('success');
        screenshotBtn.querySelector('svg')!.style.stroke = '#22c55e';
        setTimeout(() => {
          screenshotBtn.innerHTML = defaultBtnContent;
          screenshotBtn.classList.remove('success');
          screenshotBtn.disabled = false;
        }, 2000);
      } else {
        throw new Error(result.error || 'Failed to save screenshot');
      }
    } catch (error) {
      console.error('Screenshot error:', error);
      screenshotBtn.innerHTML = '✗ Take a Screenshot';
      screenshotBtn.style.color = '#ef4444';
      setTimeout(() => {
        screenshotBtn.innerHTML = defaultBtnContent;
        screenshotBtn.style.color = '';
        screenshotBtn.disabled = false;
      }, 2000);
    }
  });
}
