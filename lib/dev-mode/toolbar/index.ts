/**
 * Dev Mode Toolbar
 * Provides navigation between ad sizes and versions during development.
 * This code is only loaded in dev mode and never included in builds.
 */

import type { AdConfig } from './models/types';
import { layoutStyles } from './ui/styles';
import { gsDevToolsStyles } from '../gsdevtools/ui/styles';
import { getThemeStyles } from '../theme';
import { createToolbarElement } from './ui/toolbar-html';
import { replayIcon } from './ui/icons';
import { createSidebarElement } from '../sidebar/ui/sidebar-html';
import { setupJobSettings } from './features/job-settings';
import { setupNavigation } from './features/navigation';
import { setupScreenshot } from './features/screenshot';
import { setupSidebar } from '../sidebar/sidebar';
import { fetchJobSettings } from './api/config-api';

function appendReplayToken(href: string) {
  const nextUrl = new URL(href, window.location.href);
  nextUrl.searchParams.set('_replay', Date.now().toString());
  return nextUrl.toString();
}

function bindPreviewLoader(adShell: HTMLDivElement) {
  const revealPreview = () => {
    if (adShell.dataset.previewReady === '1') {
      return;
    }

    adShell.dataset.previewReady = '1';
    window.setTimeout(() => {
      adShell.classList.add('is-ready');
    }, 140);
  };

  if (document.readyState === 'complete') {
    requestAnimationFrame(revealPreview);
    return;
  }

  window.addEventListener('load', () => {
    requestAnimationFrame(revealPreview);
  }, { once: true });
}

function createPreviewReplayStage() {
  const stage = document.createElement('div');
  stage.className = 'dev-preview-stage';

  const adShell = document.createElement('div');
  adShell.className = 'dev-preview-ad-shell';

  const loader = document.createElement('div');
  loader.className = 'dev-preview-loading';
  loader.innerHTML = '<div class="spinner"></div>';

  const actions = document.createElement('div');
  actions.className = 'dev-preview-actions';

  const replayButton = document.createElement('button');
  replayButton.type = 'button';
  replayButton.className = 'dev-preview-replay-btn';
  replayButton.setAttribute('aria-label', 'Replay ad');
  replayButton.setAttribute('title', 'Replay ad');
  replayButton.innerHTML = replayIcon;
  replayButton.addEventListener('click', () => {
    window.location.href = appendReplayToken(window.location.href);
  });

  actions.appendChild(replayButton);
  stage.appendChild(actions);
  adShell.appendChild(loader);
  stage.appendChild(adShell);

  bindPreviewLoader(adShell);

  return { stage, adShell };
}

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

  const isPreviewMode = window.__DEV_PREVIEW_MODE__ === true;
  const adConfigs: AdConfig[] = window.__DEV_AD_CONFIGS__ || [];
  const currentAd: string = window.__DEV_CURRENT_AD__ || '';
  const currentVariant: string | null = window.__DEV_CURRENT_VARIANT__ || null;

  // Inject layout styles
  const layoutStyleEl = document.createElement('style');
  layoutStyleEl.textContent = getThemeStyles() + layoutStyles + gsDevToolsStyles;
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
  const toolbar = createToolbarElement(adConfigs, currentAd, currentVariant, {
    previewMode: isPreviewMode,
  });
  main.appendChild(toolbar);

  let previewAdShell: HTMLDivElement | null = null;
  if (isPreviewMode && !isAllView) {
    const { stage, adShell } = createPreviewReplayStage();
    previewAdShell = adShell;
    adContent.appendChild(stage);
  }

  // Move all existing body children into the ad content area
  while (document.body.firstChild) {
    const nextChild = document.body.firstChild;
    if (previewAdShell) {
      previewAdShell.appendChild(nextChild);
      continue;
    }

    adContent.appendChild(nextChild);
  }
  main.appendChild(adContent);

  wrapper.appendChild(main);

  if (!isPreviewMode) {
    const sidebar = createSidebarElement(adConfigs, currentAd, currentVariant);
    wrapper.appendChild(sidebar);
  }

  document.body.appendChild(wrapper);

  // Wire up behaviors
  setupNavigation(adConfigs, currentAd, currentVariant);
  if (!isPreviewMode) {
    setupJobSettings(currentAd);
    setupScreenshot(currentAd, currentVariant);
    setupSidebar(adConfigs, currentAd, currentVariant);
  }

  if (!isPreviewMode) {
    window.addEventListener('dev:job-settings-changed', (event: Event) => {
      const detail = (event as CustomEvent<{ jobNumber: string; jobName: string }>).detail;
      if (!detail) return;
      setDocumentTitle(detail.jobNumber, detail.jobName, currentAd);
    });

    fetchJobSettings()
      .then(({ jobNumber, jobName }) => {
        setDocumentTitle(jobNumber, jobName, currentAd);
      })
      .catch(() => {});
  }

  releasePendingLayout();
}

// Initialize toolbar when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createToolbar);
} else {
  createToolbar();
}
