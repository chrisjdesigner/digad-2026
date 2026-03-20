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

/**
 * Read all CSS custom properties from :root into a key/value map.
 * Example key format: "--ad-width".
 */
export function getRootCssVariables(): Record<string, string> {
  const styles = getComputedStyle(document.documentElement);
  const cssVars: Record<string, string> = {};

  for (let i = 0; i < styles.length; i += 1) {
    const propertyName = styles.item(i);
    if (!propertyName || !propertyName.startsWith('--')) continue;
    cssVars[propertyName] = styles.getPropertyValue(propertyName).trim();
  }

  return cssVars;
}

/**
 * Read one CSS custom property from :root.
 */
export function getRootCssVariable(name: string, fallback = ''): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}
