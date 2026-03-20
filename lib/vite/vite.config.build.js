import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  readdirSync,
  existsSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from 'fs';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import { viteSingleFile } from 'vite-plugin-singlefile';
import viteImagemin from 'vite-plugin-imagemin';
import yaml from 'js-yaml';

import { parseAdInfoFromDirectory } from '../ad/utils.js';
import { loadAdConfigs } from '../ad/config.js';
import {
  halfWithSuffix,
  relativeSpritesheetPath,
  convertAbsoluteSpritesheetPathToRelative,
  wrapTemplateVariablesForHandlebars,
} from '../handlebars/utils';

const HANDLEBARS_RESERVED_KEYS = ['css-variables', 'sprites', 'context', 'variants', 'devMode', 'previewMode', 'delayedHover', 'width', 'height', 'job', 'name'];

/**
 * Read delayedHover setting from job-settings.yaml
 */
function getDelayedHoverFromJobSettings(rootDirectory) {
  try {
    const jobSettingsPath = resolve(rootDirectory, 'job-settings.yaml');
    if (!existsSync(jobSettingsPath)) return false;
    const jobSettings = yaml.load(readFileSync(jobSettingsPath, 'utf-8')) || {};
    return !!(jobSettings.delayedHover ?? jobSettings.requireMainTimelineCompleteForHover);
  } catch {
    return false;
  }
}

/**
 * Ensures variant HTML files exist for the build process.
 * If a variant config exists but no HTML file, creates one based on index.html.
 */
function ensureVariantHtmlFiles(baseDirectory, variants) {
  if (!variants) return {};

  const indexPath = resolve(baseDirectory, './index.html');
  if (!existsSync(indexPath)) return {};

  const indexContent = readFileSync(indexPath, 'utf-8');
  const generatedFiles = [];

  const variantPaths = variants.reduce((acc, variant) => {
    const variantHtmlPath = resolve(baseDirectory, `./${variant.name}.html`);

    // If file doesn't exist, create it from index.html
    if (!existsSync(variantHtmlPath)) {
      writeFileSync(variantHtmlPath, indexContent);
      generatedFiles.push(variantHtmlPath);
    }

    acc[variant.name] = variantHtmlPath;
    return acc;
  }, {});

  return { variantPaths, generatedFiles };
}

export const defineAdConfig = (baseDirectory) => {
  const adInfo = parseAdInfoFromDirectory(baseDirectory);
  const isPreviewMode = process.env.npm_lifecycle_event?.startsWith('preview:') ?? false;
  const isPackageBuildMode = process.env.npm_lifecycle_event?.startsWith('build:') ?? false;

  // Find the "root" of the project (where package.json is located).
  const rootDirectory = dirname(
    resolve(fileURLToPath(import.meta.url), '../../'),
  );

  // Find directories within the `baseDirectory` folder that match the folder name NUMBERxNUMBER-OPTIONALTEXT.
  const handleBarsTemplateDirectories = readdirSync(rootDirectory, { withFileTypes: true })
    .filter((directory) => directory.isDirectory())
    .map((directory) => directory.name)
    .filter((name) => {
      const regex = /^\d*x\d*(-?(\w)+)*$/;
      return regex.test(name);
    });

  // Extract ad config from ad.config.json in the ad folder.
  const adConfigs = loadAdConfigs(rootDirectory);
  const adConfig = adConfigs[adInfo.name];

  // Read delayedHover from global job-settings
  const delayedHover = getDelayedHoverFromJobSettings(rootDirectory);

  // Merge adConfig.context with adInfo and inject delayedHover.
  adConfig.context = {
    ...adInfo,
    ...adConfig.context,
    delayedHover,
  };

  // Ensure variant HTML files exist (creates them from index.html if needed)
  const { variantPaths, generatedFiles } = ensureVariantHtmlFiles(
    baseDirectory,
    adConfig.variants,
  );
  const variants = variantPaths || {};

  // Variant contexts.
  const variantContexts = adConfig.variants?.reduce((acc, variant) => {
    acc[`/${variant.name}.html`] = {
      ...adInfo,
      ...variant.context,
      delayedHover,
    };
    return acc;
  }, {});

  /** @type {import('vite').UserConfig} */
  return defineConfig(({ command, mode }) => {
    return {
      base: '',
      root: resolve(baseDirectory, './'),
      resolve: {
        tsconfigPaths: true,
      },
      build: {
        minify: true,
        reportCompressedSize: !(isPackageBuildMode || isPreviewMode),
        emptyOutDir: true,
        rollupOptions: {
          input: {
            index: resolve(baseDirectory, './index.html'),
            ...variants,
          },
          output: {
            dir: resolve(baseDirectory, `../${isPackageBuildMode ? 'build-src' : 'preview'}/${adConfig.context.name}`),
            assetFileNames: '[name][extname]',
            chunkFileNames: '[name]-[hash].js',
            entryFileNames: '[name]-[hash].js',
          },
        },
      },
      plugins: [
        handlebars({
          context(pagePath) {
            if (pagePath === '/index.html') {
              return wrapTemplateVariablesForHandlebars({
                ...adConfig.context,
                  devMode: isPreviewMode,
                  previewMode: isPreviewMode,
              }, HANDLEBARS_RESERVED_KEYS);
            } else if (variantContexts[pagePath]) {
              return wrapTemplateVariablesForHandlebars({
                ...variantContexts[pagePath],
                  devMode: isPreviewMode,
                  previewMode: isPreviewMode,
              }, HANDLEBARS_RESERVED_KEYS);
            }

            return {
              devMode: isPreviewMode,
                previewMode: isPreviewMode,
            };
          },

          partialDirectory: [
            resolve(baseDirectory, '../templates'),
            resolve(rootDirectory, './lib/handlebars/partials'),
            ...handleBarsTemplateDirectories.map((directory) => resolve(rootDirectory, directory)),
          ],
        }),
        ...(isPackageBuildMode ? [] : [
          viteImagemin({
            pngquant: {
              quality: [0.4, 1.0],
              speed: 3,
            },
          }),
        ]),
        viteSingleFile({
          useRecommendedBuildConfig: false,
        }),
        {
          name: 'cleanup-generated-variant-html',
          apply: 'build',
          enforce: 'post',
          closeBundle() {
            // Clean up any auto-generated variant HTML files
            if (generatedFiles && generatedFiles.length > 0) {
              for (const file of generatedFiles) {
                try {
                  unlinkSync(file);
                } catch (e) {
                  // Ignore cleanup errors
                }
              }
            }
          },
        },
      ],
    };
  });
};
