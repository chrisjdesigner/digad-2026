export interface AdConfig {
  name: string;
  variants?: string[];
}

export interface ConfigData {
  templateVariables: Record<string, string>;
  cssVariables: {
    colors: Record<string, string>;
    images: Record<string, string>;
    typography: Record<string, string>;
    other: Record<string, string>;
  };
}

export interface SpriteInfo {
  name: string;
  file: string;
}

export interface ImageInfo {
  filename: string;
  cssValue: string;
}

declare global {
  interface Window {
    __DEV_AD_CONFIGS__: AdConfig[];
    __DEV_CURRENT_AD__: string;
    __DEV_CURRENT_VARIANT__: string | null;
  }
}
