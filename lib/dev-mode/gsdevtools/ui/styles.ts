/**
 * GSDevTools Styling
 * Theme overrides for GSAP DevTools integration with dark/light mode support.
 */

export const gsDevToolsStyles = `
  /* Contain GSDevTools bar within the main area, not spanning the sidebar */
  .gs-dev-tools {
    width: calc(100% - max(var(--sidebar-width, 370px), 370px)) !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
  }

  #dev-layout-wrapper.no-sidebar .gs-dev-tools {
    width: 100% !important;
  }

  /* Unify GSDevTools tone with app theme (cooler, dimmer text) */
  .gs-dev-tools {
    color: var(--gsdt-text-primary) !important;
  }

  .gs-dev-tools .gs-bottom {
    background: var(--gsdt-bg-primary) !important;
    border-top: 1px solid var(--gsdt-border) !important;
  }

  .gs-dev-tools .gs-top {
    background: var(--gsdt-bg-secondary) !important;
  }

  .gs-dev-tools .timeline-track {
    background: var(--gsdt-bg-track) !important;
    border-top: 1px solid var(--gsdt-border) !important;
  }

  .gs-dev-tools label,
  .gs-dev-tools .time-scale,
  .gs-dev-tools .time-container {
    color: var(--gsdt-text-primary) !important;
  }

  .gs-dev-tools label span,
  .gs-dev-tools .time-scale span {
    color: var(--gsdt-text-secondary) !important;
  }

  /* Match timeline dropdown treatment to toolbar select menus */
  .gs-dev-tools .select-animation {
    appearance: none;
    -webkit-appearance: none;
    background: var(--dev-bg-secondary) !important;
    border: 1px solid var(--dev-border) !important;
    border-radius: 9999px;
    transition: all 0.2s;
    font-weight: 700;
    color: var(--dev-text-muted) !important;
    padding: 6px 15px !important;
    font-size: 13px;
    cursor: pointer;
  }

  .gs-dev-tools .select-animation:hover {
    color: var(--dev-text-secondary) !important;
    border-color: var(--dev-border-hover) !important;
    background: var(--dev-bg-hover) !important;
  }

  .gs-dev-tools .select-animation:focus-within {
    border-color: var(--dev-accent) !important;
  }

  /* Override GSDevTools injected green accents */
  .gs-dev-tools .progress-bar,
  .gs-dev-tools .playhead {
    background: var(--gsdt-accent-play) !important;
  }

  .gs-dev-tools .in-point-shape,
  .gs-dev-tools .ease-path,
  .gs-dev-tools .logo path {
    fill: var(--gsdt-accent-play) !important;
    stroke: var(--gsdt-accent-play) !important;
  }

  /* Catch inline SVG style values GSDevTools writes directly */
  .gs-dev-tools [style*="#00ff52"],
  .gs-dev-tools [style*="#0ae448"],
  .gs-dev-tools [style*="#abff84"] {
    fill: var(--gsdt-accent-play) !important;
    stroke: var(--gsdt-accent-play) !important;
  }

  /* Override GSDevTools injected orange accents */
  .gs-dev-tools .out-point-shape,
  .gs-dev-tools [style*="#ff8709"] {
    fill: var(--gsdt-accent-marker) !important;
    stroke: var(--gsdt-accent-marker) !important;
  }

  .gs-dev-tools .gs-btn-white {
    fill: var(--gsdt-icon-primary) !important;
    stroke: none !important;
  }

  .gs-dev-tools .select-animation-container {
    background: transparent !important;
    border-color: var(--gsdt-bg-track) !important;
    padding-left: 10px !important;
    display: flex;
    align-items: center;
    height: 100%;
  }

  .gs-dev-tools .select-animation {
    color: var(--dev-text-muted) !important;
    font-size: 10px !important;
    display: inline-flex;
    align-items: center;
    line-height: 1;
    min-height: 16px;
  }

  .gs-dev-tools .select-arrow {
    width: 7px !important;
    height: 7px !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform: none !important;
    margin: 0 0 0 6px;
  }
  .gs-dev-tools .select-arrow-shape {
    stroke: var(--gsdt-icon-primary) !important;
  }

  .gs-dev-tools .loop-path {
    fill: var(--gsdt-icon-primary) !important;
  }

  .gs-dev-tools .ease-path {
    stroke: var(--gsdt-icon-primary) !important;
  }

  .gs-dev-tools .ease-border {
    fill: var(--gsdt-icon-subtle) !important;
  }

  .gs-dev-tools .grab {
    stroke: var(--gsdt-icon-muted) !important;
  }

  .gs-dev-tools .rewind-path {
    opacity: .5 !important;
  }

  .gs-dev-tools .in-point-shape {
    stroke: var(--gsdt-icon-muted) !important;
  }

  .gs-dev-tools .out-point-shape {
    stroke: var(--gsdt-icon-muted) !important;
  }

  .gs-dev-tools.minimal .gs-top,
  .gs-dev-tools.minimal .gs-bottom {
    background: var(--gsdt-bg-primary) !important;
  }
`;
