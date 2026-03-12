/**
 * Dev Mode Toolbar
 * Provides navigation between ad sizes and versions during development.
 * This code is only loaded in dev mode and never included in builds.
 */

import type { AdConfig } from './types';
import { layoutStyles } from './styles';
import { createToolbarElement } from './toolbar-html';
import { createSidebarElement } from '../sidebar/sidebar-html';
import { setupJobSettings } from './job-settings';
import { setupNavigation } from './navigation';
import { setupScreenshot } from './screenshot';
import { setupSidebar } from '../sidebar/sidebar';

function createToolbar() {
  // Skip toolbar if ?notoolbar=1 is in the URL (used for iframe previews)
  if (new URLSearchParams(window.location.search).get('notoolbar') === '1') {
    return;
  }

  const adConfigs: AdConfig[] = window.__DEV_AD_CONFIGS__ || [];
  const currentAd: string = window.__DEV_CURRENT_AD__ || '';
  const currentVariant: string | null = window.__DEV_CURRENT_VARIANT__ || null;

  // Inject layout styles
  const layoutStyleEl = document.createElement('style');
  layoutStyleEl.textContent = layoutStyles;
  document.head.appendChild(layoutStyleEl);

  // Build layout structure
  const wrapper = document.createElement('div');
  wrapper.id = 'dev-layout-wrapper';
  const main = document.createElement('div');
  main.id = 'dev-layout-main';
  const adContent = document.createElement('div');
  adContent.id = 'dev-ad-content';

  // Create toolbar and place inside main
  const toolbar = createToolbarElement(adConfigs, currentAd, currentVariant);
  main.appendChild(toolbar);

  // Move all existing body children into the ad content area
  while (document.body.firstChild) {
    adContent.appendChild(document.body.firstChild);
  }
  main.appendChild(adContent);

  // Create sidebar
  const sidebar = createSidebarElement(adConfigs, currentAd, currentVariant);

  wrapper.appendChild(main);
  wrapper.appendChild(sidebar);
  document.body.appendChild(wrapper);

  // Wire up behaviors
  setupJobSettings();
  setupNavigation(adConfigs, currentAd, currentVariant);
  setupScreenshot(currentAd, currentVariant);
  setupSidebar(adConfigs, currentAd, currentVariant);
}

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createToolbar);
} else {
  createToolbar();
}
