import type { ConfigData, SpriteInfo, ImageInfo } from './types';

export async function fetchJobSettings(): Promise<{ jobNumber: string; jobName: string }> {
  const res = await fetch('/api/job-settings');
  return res.json();
}

export async function saveJobSettings(jobNumber: string, jobName: string): Promise<void> {
  await fetch('/api/job-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jobNumber, jobName }),
  });
}

export async function fetchConfig(currentAd: string, currentVariant: string | null): Promise<ConfigData> {
  const version = currentVariant || 'base';
  const response = await fetch(`/api/ad-config?adSize=${encodeURIComponent(currentAd)}&version=${encodeURIComponent(version)}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return {
    templateVariables: data.templateVariables || {},
    cssVariables: {
      colors: data.cssVariables?.colors || {},
      images: data.cssVariables?.images || {},
      typography: data.cssVariables?.typography || {},
      other: data.cssVariables?.other || {},
    },
  };
}

export async function postConfig(currentAd: string, currentVariant: string | null, configData: ConfigData): Promise<void> {
  const version = currentVariant || 'base';
  await fetch(`/api/ad-config?adSize=${encodeURIComponent(currentAd)}&version=${encodeURIComponent(version)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(configData),
  });
}

export async function syncVariable(
  adSize: string,
  variableName: string,
  variableType: 'template' | 'css',
  action: 'add' | 'remove',
  defaultValue?: string,
  category?: string,
): Promise<void> {
  const response = await fetch('/api/ad-config/sync-variable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      adSize,
      variableName,
      variableType,
      action,
      defaultValue,
      category: variableType === 'css' ? category : undefined,
    }),
  });

  const result = await response.json();
  if (!result.success) {
    throw new Error(result.error || `Failed to ${action} variable`);
  }
}

export async function fetchSprites(currentAd: string): Promise<SpriteInfo[]> {
  const response = await fetch(`/api/sprites?adSize=${encodeURIComponent(currentAd)}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.sprites || [];
}

export async function fetchImages(currentAd: string): Promise<ImageInfo[]> {
  const res = await fetch(`/api/images?adSize=${encodeURIComponent(currentAd)}`);
  const data = await res.json();
  return data.images || [];
}
