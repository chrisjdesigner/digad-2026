/**
 * UTILITY FUNCTIONS
 * Helpers for setup and orchestration
 */

/**
 * Wait for all web fonts to load before proceeding.
 * This prevents text reflow/jumping when SplitText or animations begin.
 * Safely handles browsers that don't support the FontFaceSet API.
 */
export async function waitForFonts(): Promise<void> {
  if ('fonts' in document && document.fonts?.ready) {
    await document.fonts.ready;
  }
}
