/**
 * Dev Mode Toolbar
 * Provides navigation between ad sizes and versions during development.
 * This code is only loaded in dev mode and never included in builds.
 */

import type { AdConfig } from './models/types';
import { layoutStyles } from './ui/styles';
import { gsDevToolsStyles } from '../gsdevtools/ui/styles';
import { themeStyles } from '../theme';
import { createToolbarElement } from './ui/toolbar-html';
import { createSidebarElement } from '../sidebar/ui/sidebar-html';
import { setupJobSettings } from './features/job-settings';
import { setupNavigation } from './features/navigation';
import { setupScreenshot } from './features/screenshot';
import { setupSidebar } from '../sidebar/sidebar';
import { fetchJobSettings } from './api/config-api';

function releasePendingLayout() {
  document.documentElement.classList.remove('dev-layout-pending');
}

function setDocumentTitle(jobNumber: string, jobName: string, currentAd: string) {
  const num = jobNumber || '000000';
  const name = jobName || 'job-name';
  const parts = [num, name];
  parts.push(currentAd && currentAd !== 'all' ? currentAd : 'All Ads');
  document.title = parts.join(' - ');
}

function createToolbar() {
  // Skip toolbar if ?notoolbar=1 is in the URL (used for iframe previews)
  if (new URLSearchParams(window.location.search).get('notoolbar') === '1') {
    releasePendingLayout();
    return;
  }

  const adConfigs: AdConfig[] = window.__DEV_AD_CONFIGS__ || [];
  const currentAd: string = window.__DEV_CURRENT_AD__ || '';
  const currentVariant: string | null = window.__DEV_CURRENT_VARIANT__ || null;

  // Inject layout styles
  const layoutStyleEl = document.createElement('style');
  layoutStyleEl.textContent = themeStyles + layoutStyles + gsDevToolsStyles;
  document.head.appendChild(layoutStyleEl);

  const isAllView = currentAd === 'all' || currentVariant === 'all';

  // Build layout structure
  const wrapper = document.createElement('div');
  wrapper.id = 'dev-layout-wrapper';
  if (isAllView) {
    wrapper.classList.add('is-all-view');
  }
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

  wrapper.appendChild(main);

  // Create sidebar
  const sidebar = createSidebarElement(adConfigs, currentAd, currentVariant);
  wrapper.appendChild(sidebar);

  document.body.appendChild(wrapper);

  // Wire up behaviors
  setupJobSettings(currentAd);
  setupNavigation(adConfigs, currentAd, currentVariant);
  setupScreenshot(currentAd, currentVariant);
  setupSidebar(adConfigs, currentAd, currentVariant);

  window.addEventListener('dev:job-settings-changed', (event: Event) => {
    const detail = (event as CustomEvent<{ jobNumber: string; jobName: string }>).detail;
    if (!detail) return;
    setDocumentTitle(detail.jobNumber, detail.jobName, currentAd);
  });

  // Set page title to job info + current ad size
  fetchJobSettings()
    .then(({ jobNumber, jobName }) => {
      setDocumentTitle(jobNumber, jobName, currentAd);
    })
    .catch(() => {});

  releasePendingLayout();
}

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createToolbar);
} else {
  createToolbar();
}
