export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function toHexColor(value: string): string {
  const v = value.trim().toLowerCase();
  if (v.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i)) {
    return v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v;
  }
  const colorMap: Record<string, string> = {
    white: '#ffffff', black: '#000000', red: '#ff0000', blue: '#0000ff',
    green: '#008000', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
    gray: '#808080', grey: '#808080', transparent: '#ffffff'
  };
  return colorMap[v] || '#ffffff';
}

export function resizeInput(input: HTMLInputElement): void {
  const value = input.value || input.placeholder || '';
  const span = document.createElement('span');
  span.style.visibility = 'hidden';
  span.style.position = 'absolute';
  span.style.whiteSpace = 'pre';
  span.style.font = '700 12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  span.textContent = value;
  document.body.appendChild(span);
  input.style.width = `${Math.max(span.offsetWidth + 20, 50)}px`;
  document.body.removeChild(span);
}
