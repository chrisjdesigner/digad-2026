import { readdirSync, readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

// Keys that are reserved for config structure (not content)
const RESERVED_KEYS = ['context', 'variants', 'sprites'];

/**
 * Finds the config file path, preferring YAML over JSON.
 * @param {string} basePath - Path without extension
 * @returns {string|null} - Full path to config file or null if not found
 */
function findConfigFile(basePath) {
  const yamlPath = `${basePath}.yaml`;
  const ymlPath = `${basePath}.yml`;
  const jsonPath = `${basePath}.json`;

  if (existsSync(yamlPath)) return yamlPath;
  if (existsSync(ymlPath)) return ymlPath;
  if (existsSync(jsonPath)) return jsonPath;
  return null;
}

/**
 * Parses a config file (YAML or JSON).
 * @param {string} filePath - Path to the config file
 * @returns {Object} - Parsed config object
 */
function parseConfigFile(filePath) {
  const content = readFileSync(filePath, 'utf-8');

  if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
    return yaml.load(content) || {};
  }

  return JSON.parse(content);
}

/**
 * Loads a single config file and normalizes it to the expected format.
 * Supports YAML (.yaml, .yml) and JSON (.json) formats.
 * Supports both the new flat format and legacy "context" format.
 *
 * New flat format (designer-friendly):
 * ```yaml
 * # Comments are supported!
 * headline: We Make Belief
 * cta: Learn More
 * sprites:
 *   - name: sprite
 * ```
 *
 * Legacy format:
 * ```json
 * {
 *   "context": { "headline": "...", "cta": "..." },
 *   "sprites": [...],
 *   "variants": [...]
 * }
 * ```
 *
 * @param {string} configPath - Path to the config file
 * @param {boolean} isVariant - Whether this is a variant config (no sprites)
 * @returns {Object|null} - Normalized config object or null if not found
 */
function loadConfigFile(configPath, isVariant = false) {
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const config = parseConfigFile(configPath);

    // Check if this is using the legacy "context" wrapper format
    if (config.context) {
      // Legacy format - return as-is
      return config;
    }

    // New flat format - separate content from reserved keys
    const context = {};
    const sprites = config.sprites || [];
    const variants = config.variants || [];

    for (const [key, value] of Object.entries(config)) {
      if (!RESERVED_KEYS.includes(key)) {
        context[key] = value;
      }
    }

    if (isVariant) {
      return { context };
    }

    return { context, sprites, variants };
  } catch (error) {
    console.warn(`Warning: Could not parse ${configPath}:`, error.message);
    return null;
  }
}

/**
 * Discovers all ad size directories and loads their config files.
 * Supports multiple config files per ad:
 *   - ad.config.yaml (or .yml, .json) - base config
 *   - [variant].config.yaml (or .yml, .json) - variant-specific configs
 *
 * @param {string} rootDirectory - The root project directory
 * @returns {Object} - Combined ad configs keyed by ad size name (e.g., "300x250")
 */
export function loadAdConfigs(rootDirectory) {
  // Find directories that match the ad size pattern: NUMBERxNUMBER or NUMBERxNUMBER-suffix
  const adSizeDirectories = readdirSync(rootDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => /^\d+x\d+(-\w+)*$/.test(name));

  const adConfigs = {};

  for (const adSize of adSizeDirectories) {
    const adFolder = resolve(rootDirectory, adSize);

    // Load base config (prefer YAML over JSON)
    const baseConfigPath = findConfigFile(resolve(adFolder, 'ad.config'));
    const baseConfig = baseConfigPath
      ? loadConfigFile(baseConfigPath)
      : { context: {} };

    // Find all variant config files (*.config.yaml, *.config.yml, *.config.json)
    const variantConfigFiles = readdirSync(adFolder)
      .filter((file) => {
        const isConfigFile =
          file.endsWith('.config.yaml') ||
          file.endsWith('.config.yml') ||
          file.endsWith('.config.json');
        const isNotBaseConfig =
          !file.startsWith('ad.config.');
        return isConfigFile && isNotBaseConfig;
      })
      .map((file) => ({
        name: file.replace(/\.config\.(yaml|yml|json)$/, ''),
        path: resolve(adFolder, file),
      }));

    // Build variants array from individual config files
    const variants = [];
    for (const variantFile of variantConfigFiles) {
      const variantConfig = loadConfigFile(variantFile.path, true);
      if (variantConfig) {
        variants.push({
          name: variantFile.name,
          context: variantConfig.context || {},
        });
      }
    }

    // Merge discovered variants with any defined in base config
    // (allows mixing approaches if needed)
    const existingVariants = baseConfig?.variants || [];
    const existingVariantNames = existingVariants.map((v) => v.name);

    // Add discovered variants that aren't already in base config
    for (const variant of variants) {
      if (!existingVariantNames.includes(variant.name)) {
        existingVariants.push(variant);
      }
    }

    adConfigs[adSize] = {
      context: baseConfig?.context || {},
      sprites: baseConfig?.sprites || [],
      variants: existingVariants.length > 0 ? existingVariants : undefined,
    };
  }

  return adConfigs;
}

/**
 * Gets the root directory of the project (where package.json is located).
 *
 * @param {string} importMetaUrl - Pass import.meta.url from the calling file
 * @returns {string} - Absolute path to the project root
 */
export function getRootDirectory(importMetaUrl) {
  return dirname(resolve(fileURLToPath(importMetaUrl), '../../'));
}
