/**
 * Dev Mode Theme
 * CSS custom properties for dark and light themes.
 * Uses the SR brand color palette for grays, accent, and danger.
 */

export const themeStyles = `
  /* Dark theme (default) — SR palette, darkened ~60% */
  :root, [data-dev-theme="dark"] {
    --dev-bg-primary: #111213;
    --dev-bg-secondary: #181819;
    --dev-bg-tertiary: #1B1C1D;
    --dev-bg-hover: #222324;
    --dev-bg-section: #1B1C1D;
    --dev-bg-input: #181819;
    --dev-border: #222324;
    --dev-border-input: #2B2C2E;
    --dev-border-hover: #353738;
    --dev-text-primary: #F5F6F6;
    --dev-text-secondary: #CFD1D2;
    --dev-text-muted: #ADB0B3;
    --dev-text-dimmed: #84898C;
    --dev-text-faint: #696E71;
    --dev-shadow: rgba(0, 0, 0, 0.3);
    --dev-ad-content-bg: #1B1C1D;
    --dev-accent: #909090;
    --dev-accent-hover: #f0f0f0;
    --dev-danger: #e33e3e;
    --dev-resize-active: rgba(184, 184, 184, 1);
    --dev-spinner-track: #2B2C2E;
    --dev-overlay: rgba(0, 0, 0, 0.7);
  }

  /* Light theme — SR palette, softened */
  [data-dev-theme="light"] {
    --dev-bg-primary: #F5F6F6;
    --dev-bg-secondary: #FAFAFA;
    --dev-bg-tertiary: #F0F1F1;
    --dev-bg-hover: #EAEBEB;
    --dev-bg-section: #FAFAFA;
    --dev-bg-input: #FAFAFA;
    --dev-border: #E6E7E7;
    --dev-border-input: #E6E7E7;
    --dev-border-hover: #CFD1D2;
    --dev-text-primary: #2B2E2F;
    --dev-text-secondary: #434547;
    --dev-text-muted: #696E71;
    --dev-text-dimmed: #84898C;
    --dev-text-faint: #ADB0B3;
    --dev-shadow: rgba(0, 0, 0, 0.06);
    --dev-ad-content-bg: #EAEBEB;
    --dev-accent: #afafaf;
    --dev-accent-hover: #c5c5c4;
    --dev-danger: #B90000;
    --dev-resize-active: rgb(209, 209, 209);
    --dev-spinner-track: #DCDEDE;
    --dev-overlay: rgba(255, 255, 255, 0.7);
  }
`;
