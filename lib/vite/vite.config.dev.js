import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync, mkdirSync, writeFileSync, readFileSync, unlinkSync, cpSync, rmSync } from 'fs';
import { open } from 'fs/promises';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import Spritesmith from 'vite-plugin-spritesmith';
import ViteRestart from 'vite-plugin-restart';
import { userInfo } from 'os';
import chalk from 'chalk';
import tsconfigPaths from 'vite-tsconfig-paths';
import yaml from 'js-yaml';

import {
  halfWithSuffix,
  relativeSpritesheetPath,
  convertAbsoluteSpritesheetPathToRelative,
} from '../handlebars/utils';
import { parseAdInfoFromDirectory } from '../ad/utils';
import { loadAdConfigs } from '../ad/config.js';
import { virtualVariantHtmlPlugin } from './virtual-variant-html.js';

export const defineAdConfigs = async (baseUrl) => {
  const baseDirectory = dirname(fileURLToPath(baseUrl));

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

  // Initialize stored ad configs from ad.config.json files in each ad folder.
  const adConfigs = loadAdConfigs(rootDirectory);
  for (const [name, config] of Object.entries(adConfigs)) {
    // Extract information about the ad size/directories.
    const adInfo = parseAdInfoFromDirectory(
      resolve(baseDirectory, `./${name}`),
    );

    // Append information to context.
    adConfigs[name].context = {
      ...adInfo,
      ...config.context,
    };
  }

  // Build a serializable list of ad configs for the dev toolbar
  const devAdConfigs = Object.entries(adConfigs).map(([name, config]) => ({
    name,
    variants: config.variants ? config.variants.map(v => v.name) : [],
  }));

  const handlebarsContexts = {};
  const partialDirectories = [
    resolve(baseDirectory, './templates'),
    resolve(rootDirectory, './lib/handlebars/partials'),
    ...handleBarsTemplateDirectories.map((directory) => resolve(rootDirectory, directory)),
  ];
  const spritesheets = [];
  for (const [name, config] of Object.entries(adConfigs)) {
    // Handlebars context/data.
    if (config.context) {
      handlebarsContexts[`/${name}/index.html`] = {
        ...config.context,
        __devAdConfigs: JSON.stringify(devAdConfigs),
        __devCurrentAd: name,
        __devCurrentVariant: '',
      };
    }

    // Variant contexts.
    if (config.variants) {
      config.variants.forEach((variant) => {
        // Deep-merge css-variables so variant overrides are per-key within each category
        const mergedContext = { ...config.context, ...variant.context };
        if (config.context?.['css-variables'] && variant.context?.['css-variables']) {
          const baseCss = config.context['css-variables'];
          const varCss = variant.context['css-variables'];
          mergedContext['css-variables'] = {};
          for (const cat of new Set([...Object.keys(baseCss), ...Object.keys(varCss)])) {
            mergedContext['css-variables'][cat] = {
              ...(baseCss[cat] || {}),
              ...(varCss[cat] || {}),
            };
          }
        }
        handlebarsContexts[`/${name}/${variant.name}.html`] = {
          ...mergedContext,
          __devAdConfigs: JSON.stringify(devAdConfigs),
          __devCurrentAd: name,
          __devCurrentVariant: variant.name,
        };
      });
    }

    if (config.context)
      if (config.sprites) {
        // Spritesheets.
        // Iterate and push spritesheets.
        spritesheets.push(
          ...config.sprites.map((sprite) => {
            return {
              watch: true,
              src: {
                cwd: resolve(baseDirectory, `./${name}/src/img/${sprite.name}`),
                glob: '*.png',
              },
              spritesmithOptions: sprite.options
                ? { padding: 20, ...sprite.options }
                : {
                  padding: 20,
                },
              target: {
                image: resolve(
                  baseDirectory,
                  `./${name}/src/img/${sprite.name}.png`,
                ),
                css: [
                  [
                    resolve(
                      baseDirectory,
                      `./${name}/src/sass/_${sprite.name}.scss`,
                    ),
                    {
                      format: 'handlebars_based_template',
                    },
                  ],
                ],
              },
              apiOptions: {
                spritesheet_info: {
                  name: sprite.name,
                },
                handlebarsHelpers: {
                  halfWithSuffix,
                  relativeSpritesheetPath,
                  convertAbsoluteSpritesheetPathToRelative,
                },
              },
              customTemplates: {
                handlebars_based_template: resolve(
                  baseDirectory,
                  './lib/handlebars/scss-sprites.template.handlebars',
                ),
              },
            };
          }),
        );
      }
  }

  // Default server config.
  let serverConfig = {
    strictPort: false,
    watch: {
      // Ignore YAML config file changes to prevent HMR/reload loops
      ignored: ['**/versions/*.config.yaml', '**/versions/*.config.yml', '**/*.config.yaml', '**/*.config.yml'],
    },
  };

  // Check if the global digads config file exists, and load it if so.
  const globalDigadConfigPath = resolve(
    '/usr/local/lib/swansonrussell/digads.json',
  );
  let visibleHost = null;

  try {
    const globalDigadConfigFile = await open(globalDigadConfigPath, 'r');

    // Read the file.
    const globalDigadConfig = JSON.parse(
      await globalDigadConfigFile.readFile('utf-8'),
    );
    if (globalDigadConfig.userPorts) {
      // Get the username of the current user.
      const username = userInfo().username;

      // Get configured hostname pattern.
      const hostname = globalDigadConfig.hostnamePattern.replace(
        '[username]',
        username,
      );

      // Find corresponding user in the config.
      const userConfig = globalDigadConfig.userPorts.find(
        (user) => user.username === username,
      );

      // Set variable info from the config for the corresponding user.
      visibleHost = `https://${hostname}/`;
      serverConfig = {
        ...serverConfig,
        strictPort: true,
        port: userConfig.port,
      };
    }

    await globalDigadConfigFile.close();
  } catch (error) {
    // Silently ignore - digads.json is optional for multi-user server setups
  }

  /** @type {import('vite').UserConfig} */
  return defineConfig(async ({ command, mode }) => {
    // Helper to find config file path
    const findConfigPath = (adSize, version) => {
      const versionsFolder = resolve(rootDirectory, adSize, 'versions');
      const adFolder = resolve(rootDirectory, adSize);
      
      // Determine which file to look for
      const configName = version === 'base' || version === 'v1' || !version 
        ? 'ad.config' 
        : `${version}.config`;
      
      // Check versions folder first, then ad folder
      const paths = [
        resolve(versionsFolder, `${configName}.yaml`),
        resolve(versionsFolder, `${configName}.yml`),
        resolve(adFolder, `${configName}.yaml`),
        resolve(adFolder, `${configName}.yml`),
      ];
      
      for (const p of paths) {
        if (existsSync(p)) return p;
      }
      return null;
    };

    return {
      server: serverConfig,
      plugins: [
        tsconfigPaths({
          root: './',
        }),
        {
          name: 'ad-config-api',
          apply: 'serve',
          configureServer(server) {
            // Helper to categorize CSS variables (for legacy flat format migration)
            const categorizeCssVar = (name, value) => {
              const nameLower = name.toLowerCase();
              const valueLower = value.toLowerCase();
              
              // Images: url() values or name hints
              if (valueLower.includes('url(') || 
                  nameLower.includes('url') || 
                  nameLower.includes('image') || 
                  nameLower.includes('img') || 
                  nameLower.includes('photo')) {
                return 'images';
              }
              
              // Typography: font/size/text related
              if (nameLower.includes('font') || 
                  nameLower.includes('size') || 
                  nameLower.includes('line-height') ||
                  nameLower.includes('weight') || 
                  nameLower.includes('family') || 
                  nameLower.includes('text') ||
                  nameLower.includes('letter') ||
                  nameLower.includes('spacing') ||
                  /^\d+(\.\d+)?(px|em|rem|pt|%)$/.test(valueLower)) {
                return 'typography';
              }
              
              // Colors: hex colors, rgb, rgba, hsl, color keywords, or name hints
              if (nameLower.includes('color') || 
                  nameLower.includes('bg') ||
                  nameLower.includes('background') ||
                  /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(valueLower) ||
                  /^(rgb|rgba|hsl|hsla)\(/.test(valueLower) ||
                  ['white', 'black', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'gray', 'grey', 'transparent'].includes(valueLower)) {
                return 'colors';
              }
              
              return 'other';
            };

            // GET /api/ad-config?adSize=300x250&version=v2
            server.middlewares.use('/api/ad-config', (req, res, next) => {
              // Skip sub-path routes handled by dedicated middleware.
              // req.url contains the remaining path after the matched prefix.
              if (req.url && (req.url.startsWith('/sync-variable') || req.url.startsWith('/hover-gate'))) {
                return next();
              }
              
              const urlParts = new URL(req.url || '', 'http://localhost/api/ad-config');
              const adSize = urlParts.searchParams.get('adSize');
              const version = urlParts.searchParams.get('version') || 'base';

              if (req.method === 'GET') {
                try {
                  const configPath = findConfigPath(adSize, version);
                  if (!configPath) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: 'Config not found' }));
                    return;
                  }

                  const configContent = yaml.load(readFileSync(configPath, 'utf-8')) || {};
                  
                  // Separate template variables from css-variables and reserved keys
                  const reservedKeys = ['css-variables', 'sprites', 'context', 'variants'];
                  const templateVars = {};
                  const rawCssVars = configContent['css-variables'] || {};
                  
                  // Check if CSS variables use subcategory structure
                  const subcategories = ['colors', 'images', 'typography', 'other'];
                  const hasSubcategories = subcategories.some(cat => rawCssVars[cat] && typeof rawCssVars[cat] === 'object');
                  
                  // Build categorized CSS variables
                  const cssVarsByCategory = { colors: {}, images: {}, typography: {}, other: {} };
                  
                  if (hasSubcategories) {
                    // New format: preserve categories
                    for (const cat of subcategories) {
                      if (rawCssVars[cat] && typeof rawCssVars[cat] === 'object') {
                        cssVarsByCategory[cat] = { ...rawCssVars[cat] };
                      }
                    }
                  } else {
                    // Legacy flat format: auto-categorize
                    for (const [name, value] of Object.entries(rawCssVars)) {
                      const category = categorizeCssVar(name, String(value));
                      cssVarsByCategory[category][name] = value;
                    }
                  }
                  
                  for (const [key, value] of Object.entries(configContent)) {
                    if (!reservedKeys.includes(key)) {
                      templateVars[key] = value;
                    }
                  }

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    templateVariables: templateVars,
                    cssVariables: cssVarsByCategory,
                    configPath,
                  }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error.message }));
                }
                return;
              }

              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    const { templateVariables, cssVariables } = JSON.parse(body);
                    const configPath = findConfigPath(adSize, version);
                    
                    if (!configPath) {
                      res.statusCode = 404;
                      res.end(JSON.stringify({ error: 'Config not found' }));
                      return;
                    }

                    // Load existing config to preserve comments structure
                    const existingContent = readFileSync(configPath, 'utf-8');
                    const existingConfig = yaml.load(existingContent) || {};
                    
                    // Build new config preserving sprites and other reserved keys
                    const newConfig = {
                      ...templateVariables,
                      'css-variables': cssVariables,
                    };
                    
                    // Preserve sprites if they exist
                    if (existingConfig.sprites) {
                      newConfig.sprites = existingConfig.sprites;
                    }

                    // Write back as YAML
                    const yamlContent = yaml.dump(newConfig, { 
                      lineWidth: -1,
                      quotingType: '"',
                      forceQuotes: false,
                    });
                    writeFileSync(configPath, yamlContent, 'utf-8');
                    
                    // Rebuild handlebars context so next page load picks up changes
                    const updatedConfig = yaml.load(readFileSync(configPath, 'utf-8')) || {};
                    const updatedContext = {};
                    const reservedKeysForContext = ['css-variables', 'sprites', 'context', 'variants'];
                    for (const [key, value] of Object.entries(updatedConfig)) {
                      if (!reservedKeysForContext.includes(key)) {
                        updatedContext[key] = value;
                      }
                    }
                    updatedContext['css-variables'] = updatedConfig['css-variables'] || {};
                    
                    // Determine the HTML path for this config
                    const isBase = version === 'base';
                    const htmlPath = isBase 
                      ? `/${adSize}/index.html`
                      : `/${adSize}/${version}.html`;
                    
                    if (handlebarsContexts[htmlPath]) {
                      // Merge with existing context (preserving adInfo, dev vars, etc.)
                      Object.assign(handlebarsContexts[htmlPath], updatedContext);
                    }
                    
                    console.log(chalk.greenBright(`Config updated: ${adSize}/${version}`));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                  } catch (error) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ success: false, error: error.message }));
                  }
                });
                return;
              }

              res.statusCode = 405;
              res.end('Method not allowed');
            });

            // POST /api/ad-config/sync-variable - Add or remove a variable across all versions
            server.middlewares.use('/api/ad-config/sync-variable', (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { adSize, variableName, variableType, action, defaultValue, category, variableOrder } = JSON.parse(body);
                  
                  // Find all config files for this ad size
                  const versionsFolder = resolve(rootDirectory, adSize, 'versions');
                  const adFolder = resolve(rootDirectory, adSize);
                  const configFiles = [];
                  
                  // Add base config
                  const baseConfigs = ['ad.config.yaml', 'ad.config.yml'];
                  for (const name of baseConfigs) {
                    const p = resolve(versionsFolder, name);
                    if (existsSync(p)) configFiles.push(p);
                    const p2 = resolve(adFolder, name);
                    if (existsSync(p2)) configFiles.push(p2);
                  }
                  
                  // Add version configs from versions folder
                  if (existsSync(versionsFolder)) {
                    const files = readdirSync(versionsFolder);
                    for (const file of files) {
                      if ((file.endsWith('.config.yaml') || file.endsWith('.config.yml')) && 
                          !file.startsWith('ad.config.')) {
                        configFiles.push(resolve(versionsFolder, file));
                      }
                    }
                  }
                  
                  // Process each config file
                  for (const configPath of configFiles) {
                    let content = yaml.load(readFileSync(configPath, 'utf-8')) || {};
                    
                    if (action === 'add') {
                      if (variableType === 'template') {
                        if (!(variableName in content)) {
                          content[variableName] = defaultValue || '';
                        }
                      } else if (variableType === 'css') {
                        // Ensure css-variables exists with subcategory structure
                        if (!content['css-variables']) {
                          content['css-variables'] = { colors: {}, images: {}, typography: {}, other: {} };
                        }
                        // Migrate legacy flat format to subcategory format
                        const cssVars = content['css-variables'];
                        const subcats = ['colors', 'images', 'typography', 'other'];
                        const hasSubcats = subcats.some(cat => cssVars[cat] && typeof cssVars[cat] === 'object');
                        if (!hasSubcats) {
                          // Migrate flat to subcategories
                          const migrated = { colors: {}, images: {}, typography: {}, other: {} };
                          for (const [name, value] of Object.entries(cssVars)) {
                            const cat = categorizeCssVar(name, String(value));
                            migrated[cat][name] = value;
                          }
                          content['css-variables'] = migrated;
                        }
                        // Ensure all subcategories exist
                        for (const cat of subcats) {
                          if (!content['css-variables'][cat]) {
                            content['css-variables'][cat] = {};
                          }
                        }
                        // Add to the specified category
                        const targetCategory = category || 'other';
                        if (!(variableName in content['css-variables'][targetCategory])) {
                          content['css-variables'][targetCategory][variableName] = defaultValue || '';
                        }
                      }
                    } else if (action === 'remove') {
                      if (variableType === 'template') {
                        delete content[variableName];
                      } else if (variableType === 'css') {
                        // Remove from all possible locations (flat and subcategories)
                        if (content['css-variables']) {
                          delete content['css-variables'][variableName]; // legacy flat
                          for (const cat of ['colors', 'images', 'typography', 'other']) {
                            if (content['css-variables'][cat]) {
                              delete content['css-variables'][cat][variableName];
                            }
                          }
                        }
                      }
                    } else if (action === 'reorder') {
                      const order = Array.isArray(variableOrder) ? variableOrder : [];

                      if (variableType === 'template') {
                        const reservedKeys = ['css-variables', 'sprites', 'context', 'variants'];
                        const templateEntries = Object.entries(content).filter(([k]) => !reservedKeys.includes(k));
                        const templateMap = Object.fromEntries(templateEntries);
                        const reorderedTemplate = {};

                        order.forEach((name) => {
                          if (Object.prototype.hasOwnProperty.call(templateMap, name)) {
                            reorderedTemplate[name] = templateMap[name];
                          }
                        });

                        Object.keys(templateMap).forEach((name) => {
                          if (!Object.prototype.hasOwnProperty.call(reorderedTemplate, name)) {
                            reorderedTemplate[name] = templateMap[name];
                          }
                        });

                        const rebuilt = {};
                        Object.keys(reorderedTemplate).forEach((name) => {
                          rebuilt[name] = reorderedTemplate[name];
                        });

                        Object.entries(content).forEach(([key, value]) => {
                          if (reservedKeys.includes(key)) {
                            rebuilt[key] = value;
                          }
                        });

                        content = rebuilt;
                      } else if (variableType === 'css') {
                        if (!content['css-variables']) {
                          content['css-variables'] = { colors: {}, images: {}, typography: {}, other: {} };
                        }

                        const cssVars = content['css-variables'];
                        const subcats = ['colors', 'images', 'typography', 'other'];
                        const hasSubcats = subcats.some(cat => cssVars[cat] && typeof cssVars[cat] === 'object');
                        if (!hasSubcats) {
                          const migrated = { colors: {}, images: {}, typography: {}, other: {} };
                          for (const [name, value] of Object.entries(cssVars)) {
                            const cat = categorizeCssVar(name, String(value));
                            migrated[cat][name] = value;
                          }
                          content['css-variables'] = migrated;
                        }

                        for (const cat of subcats) {
                          if (!content['css-variables'][cat]) {
                            content['css-variables'][cat] = {};
                          }
                        }

                        const targetCategory = category || 'other';
                        const currentCategoryVars = content['css-variables'][targetCategory] || {};
                        const reorderedCategory = {};

                        order.forEach((name) => {
                          if (Object.prototype.hasOwnProperty.call(currentCategoryVars, name)) {
                            reorderedCategory[name] = currentCategoryVars[name];
                          }
                        });

                        Object.keys(currentCategoryVars).forEach((name) => {
                          if (!Object.prototype.hasOwnProperty.call(reorderedCategory, name)) {
                            reorderedCategory[name] = currentCategoryVars[name];
                          }
                        });

                        content['css-variables'][targetCategory] = reorderedCategory;
                      }
                    }
                    
                    // Write back
                    const yamlContent = yaml.dump(content, { 
                      lineWidth: -1,
                      quotingType: '"',
                      forceQuotes: false,
                    });
                    writeFileSync(configPath, yamlContent, 'utf-8');
                  }
                  
                  const actionLabel = action === 'reorder' ? 'reordered' : `${action}ed`;
                  const targetLabel = action === 'reorder' ? (variableType === 'css' ? category || 'other' : 'template') : variableName;
                  console.log(chalk.greenBright(`Variable ${actionLabel} across ${configFiles.length} configs: ${targetLabel}`));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, filesUpdated: configFiles.length }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            });

            // POST /api/ad-config/hover-gate - Update hover-gate setting across all versions
            server.middlewares.use('/api/ad-config/hover-gate', (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const payload = JSON.parse(body);
                  const adSize = payload.adSize;
                  const delayedHover = payload.delayedHover ?? payload.requireMainTimelineCompleteForHover;

                  if (!adSize) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ success: false, error: 'adSize is required' }));
                    return;
                  }

                  const adConfig = adConfigs[adSize];
                  if (!adConfig) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ success: false, error: `Ad size "${adSize}" not found` }));
                    return;
                  }

                  const versions = ['base', ...(adConfig.variants ? adConfig.variants.map(v => v.name) : [])];
                  const touchedFiles = [];

                  for (const version of versions) {
                    const configPath = findConfigPath(adSize, version);
                    if (!configPath) continue;

                    const configContent = yaml.load(readFileSync(configPath, 'utf-8')) || {};
                    configContent.delayedHover = !!delayedHover;
                    delete configContent.requireMainTimelineCompleteForHover;

                    const yamlContent = yaml.dump(configContent, {
                      lineWidth: -1,
                      quotingType: '"',
                      forceQuotes: false,
                    });
                    writeFileSync(configPath, yamlContent, 'utf-8');
                    touchedFiles.push(configPath);

                    const htmlPath = version === 'base'
                      ? `/${adSize}/index.html`
                      : `/${adSize}/${version}.html`;

                    if (handlebarsContexts[htmlPath]) {
                      handlebarsContexts[htmlPath].delayedHover = !!delayedHover;
                      delete handlebarsContexts[htmlPath].requireMainTimelineCompleteForHover;
                    }
                  }

                  console.log(chalk.greenBright(`Updated hover-gate setting for ${adSize}: ${!!delayedHover}`));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, updatedFiles: touchedFiles.length }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            });
          },
        },
        {
          name: 'create-version-api',
          apply: 'serve',
          configureServer(server) {
            server.middlewares.use('/api/create-version', (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { adSize, newVersionName, sourceVersion } = JSON.parse(body);

                  if (!adSize || !newVersionName) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'adSize and newVersionName are required' }));
                    return;
                  }

                  // Validate version name (alphanumeric + hyphens only)
                  if (!/^[a-zA-Z0-9-]+$/.test(newVersionName)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Version name must contain only letters, numbers, and hyphens' }));
                    return;
                  }

                  // Ensure versions folder exists
                  const versionsFolder = resolve(rootDirectory, adSize, 'versions');
                  if (!existsSync(versionsFolder)) {
                    mkdirSync(versionsFolder, { recursive: true });
                  }

                  // Check that new version doesn't already exist
                  const newConfigPath = resolve(versionsFolder, `${newVersionName}.config.yaml`);
                  if (existsSync(newConfigPath)) {
                    res.statusCode = 409;
                    res.end(JSON.stringify({ error: `Version "${newVersionName}" already exists` }));
                    return;
                  }

                  // Find source config to duplicate
                  const source = sourceVersion || 'base';
                  const sourceConfigPath = findConfigPath(adSize, source);
                  if (!sourceConfigPath) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: `Source version "${source}" not found` }));
                    return;
                  }

                  // Read source config and write as new version
                  const sourceContent = readFileSync(sourceConfigPath, 'utf-8');
                  const sourceConfig = yaml.load(sourceContent) || {};

                  // Remove sprites and variants from variant configs (they belong to base only)
                  delete sourceConfig.sprites;
                  delete sourceConfig.variants;

                  const yamlContent = yaml.dump(sourceConfig, {
                    lineWidth: -1,
                    quotingType: '"',
                    forceQuotes: false,
                  });
                  writeFileSync(newConfigPath, yamlContent, 'utf-8');

                  // Reload ad configs and update the existing object in-place
                  // so all plugins sharing the adConfigs reference see the new version
                  const reloadedConfigs = loadAdConfigs(rootDirectory);
                  for (const key of Object.keys(adConfigs)) {
                    if (!reloadedConfigs[key]) delete adConfigs[key];
                  }
                  for (const [key, value] of Object.entries(reloadedConfigs)) {
                    // Re-apply adInfo enrichment (parseAdInfoFromDirectory)
                    const adInfo = parseAdInfoFromDirectory(
                      resolve(baseDirectory, `./${key}`),
                    );
                    value.context = { ...adInfo, ...value.context };
                    adConfigs[key] = value;
                  }

                  const updatedDevAdConfigs = Object.entries(adConfigs).map(([name, config]) => ({
                    name,
                    variants: config.variants ? config.variants.map(v => v.name) : [],
                  }));

                  // Update devAdConfigs reference used by handlebars contexts
                  const devAdConfigsJson = JSON.stringify(updatedDevAdConfigs);

                  // Update handlebars contexts for the new version
                  const adConfig = adConfigs[adSize];
                  if (adConfig) {
                    const newVariant = adConfig.variants?.find(v => v.name === newVersionName);
                    if (newVariant) {
                      // Deep-merge css-variables
                      const mergedContext = { ...adConfig.context, ...newVariant.context };
                      if (adConfig.context?.['css-variables'] && newVariant.context?.['css-variables']) {
                        const baseCss = adConfig.context['css-variables'];
                        const varCss = newVariant.context['css-variables'];
                        mergedContext['css-variables'] = {};
                        for (const cat of new Set([...Object.keys(baseCss), ...Object.keys(varCss)])) {
                          mergedContext['css-variables'][cat] = {
                            ...(baseCss[cat] || {}),
                            ...(varCss[cat] || {}),
                          };
                        }
                      }
                      handlebarsContexts[`/${adSize}/${newVersionName}.html`] = {
                        ...mergedContext,
                        __devAdConfigs: devAdConfigsJson,
                        __devCurrentAd: adSize,
                        __devCurrentVariant: newVersionName,
                      };
                    }

                    // Update __devAdConfigs in all existing handlebars contexts
                    for (const key of Object.keys(handlebarsContexts)) {
                      handlebarsContexts[key].__devAdConfigs = devAdConfigsJson;
                    }
                  }

                  console.log(chalk.greenBright(`Created new version: ${adSize}/${newVersionName} (from ${source})`));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    versionName: newVersionName,
                    variants: updatedDevAdConfigs.find(a => a.name === adSize)?.variants || [],
                  }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            });
          },
        },
        {
          name: 'delete-version-api',
          apply: 'serve',
          configureServer(server) {
            server.middlewares.use('/api/delete-version', (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { adSize, versionName } = JSON.parse(body);

                  if (!adSize || !versionName) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'adSize and versionName are required' }));
                    return;
                  }

                  // Cannot delete the base version
                  if (versionName === 'base' || versionName === '') {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Cannot delete the base version' }));
                    return;
                  }

                  // Find and delete the config file
                  const configPath = findConfigPath(adSize, versionName);
                  if (!configPath) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: `Version "${versionName}" not found` }));
                    return;
                  }

                  unlinkSync(configPath);

                  // Reload ad configs in-place
                  const reloadedConfigs = loadAdConfigs(rootDirectory);
                  for (const key of Object.keys(adConfigs)) {
                    if (!reloadedConfigs[key]) delete adConfigs[key];
                  }
                  for (const [key, value] of Object.entries(reloadedConfigs)) {
                    const adInfo = parseAdInfoFromDirectory(
                      resolve(baseDirectory, `./${key}`),
                    );
                    value.context = { ...adInfo, ...value.context };
                    adConfigs[key] = value;
                  }

                  // Remove handlebars context for the deleted version
                  delete handlebarsContexts[`/${adSize}/${versionName}.html`];

                  // Update __devAdConfigs in all existing handlebars contexts
                  const updatedDevAdConfigs = Object.entries(adConfigs).map(([name, config]) => ({
                    name,
                    variants: config.variants ? config.variants.map(v => v.name) : [],
                  }));
                  const devAdConfigsJson = JSON.stringify(updatedDevAdConfigs);
                  for (const key of Object.keys(handlebarsContexts)) {
                    handlebarsContexts[key].__devAdConfigs = devAdConfigsJson;
                  }

                  console.log(chalk.greenBright(`Deleted version: ${adSize}/${versionName}`));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    variants: updatedDevAdConfigs.find(a => a.name === adSize)?.variants || [],
                  }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            });
          },
        },
        {
          name: 'create-size-api',
          apply: 'serve',
          configureServer(server) {
            server.middlewares.use('/api/create-size', (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { newSizeName, sourceSize } = JSON.parse(body);

                  if (!newSizeName || !sourceSize) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'newSizeName and sourceSize are required' }));
                    return;
                  }

                  // Validate size name format (NUMBERxNUMBER with optional suffix)
                  if (!/^\d+x\d+(-\w+)*$/.test(newSizeName)) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Size name must be in format WIDTHxHEIGHT (e.g. 728x90)' }));
                    return;
                  }

                  const sourcePath = resolve(rootDirectory, sourceSize);
                  const newPath = resolve(rootDirectory, newSizeName);

                  if (!existsSync(sourcePath)) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: `Source size "${sourceSize}" not found` }));
                    return;
                  }

                  if (existsSync(newPath)) {
                    res.statusCode = 409;
                    res.end(JSON.stringify({ error: `Size "${newSizeName}" already exists` }));
                    return;
                  }

                  // Copy the entire source folder
                  cpSync(sourcePath, newPath, { recursive: true });

                  // Remove variant configs from versions/ (keep only ad.config.yaml)
                  const versionsFolder = resolve(newPath, 'versions');
                  if (existsSync(versionsFolder)) {
                    readdirSync(versionsFolder).forEach(file => {
                      if (file !== 'ad.config.yaml' && file !== 'ad.config.yml') {
                        unlinkSync(resolve(versionsFolder, file));
                      }
                    });
                  }

                  // Clear statics folder (screenshots are size-specific)
                  const staticsFolder = resolve(newPath, 'statics');
                  if (existsSync(staticsFolder)) {
                    readdirSync(staticsFolder).forEach(file => {
                      if (file !== '.gitkeep' && file !== '.DS_Store') {
                        unlinkSync(resolve(staticsFolder, file));
                      }
                    });
                  }

                  // Update index.html to reference the new template name
                  const indexPath = resolve(newPath, 'index.html');
                  if (existsSync(indexPath)) {
                    const content = readFileSync(indexPath, 'utf-8');
                    const updated = content.replace(
                      new RegExp(sourceSize.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
                      newSizeName,
                    );
                    writeFileSync(indexPath, updated, 'utf-8');
                  }

                  // Rename the template HTML file
                  const oldTemplatePath = resolve(newPath, `${sourceSize}.template.html`);
                  const newTemplatePath = resolve(newPath, `${newSizeName}.template.html`);
                  if (existsSync(oldTemplatePath)) {
                    const templateContent = readFileSync(oldTemplatePath, 'utf-8');
                    writeFileSync(newTemplatePath, templateContent, 'utf-8');
                    unlinkSync(oldTemplatePath);
                  }

                  // Reload ad configs in-place
                  const reloadedConfigs = loadAdConfigs(rootDirectory);
                  for (const key of Object.keys(adConfigs)) {
                    if (!reloadedConfigs[key]) delete adConfigs[key];
                  }
                  for (const [key, value] of Object.entries(reloadedConfigs)) {
                    const adInfo = parseAdInfoFromDirectory(
                      resolve(baseDirectory, `./${key}`),
                    );
                    value.context = { ...adInfo, ...value.context };
                    adConfigs[key] = value;
                  }

                  // Rebuild handlebars contexts for all sizes
                  const updatedDevAdConfigs = Object.entries(adConfigs).map(([name, config]) => ({
                    name,
                    variants: config.variants ? config.variants.map(v => v.name) : [],
                  }));
                  const devAdConfigsJson = JSON.stringify(updatedDevAdConfigs);

                  // Clear and rebuild all handlebars contexts
                  for (const key of Object.keys(handlebarsContexts)) {
                    delete handlebarsContexts[key];
                  }
                  for (const [name, config] of Object.entries(adConfigs)) {
                    if (config.context) {
                      handlebarsContexts[`/${name}/index.html`] = {
                        ...config.context,
                        __devAdConfigs: devAdConfigsJson,
                        __devCurrentAd: name,
                        __devCurrentVariant: '',
                      };
                    }
                    if (config.variants) {
                      config.variants.forEach((variant) => {
                        const mergedContext = { ...config.context, ...variant.context };
                        if (config.context?.['css-variables'] && variant.context?.['css-variables']) {
                          const baseCss = config.context['css-variables'];
                          const varCss = variant.context['css-variables'];
                          mergedContext['css-variables'] = {};
                          for (const cat of new Set([...Object.keys(baseCss), ...Object.keys(varCss)])) {
                            mergedContext['css-variables'][cat] = {
                              ...(baseCss[cat] || {}),
                              ...(varCss[cat] || {}),
                            };
                          }
                        }
                        handlebarsContexts[`/${name}/${variant.name}.html`] = {
                          ...mergedContext,
                          __devAdConfigs: devAdConfigsJson,
                          __devCurrentAd: name,
                          __devCurrentVariant: variant.name,
                        };
                      });
                    }
                  }

                  // Register the new directory as a Handlebars partial directory
                  const newPartialDir = resolve(rootDirectory, newSizeName);
                  if (!partialDirectories.includes(newPartialDir)) {
                    partialDirectories.push(newPartialDir);
                  }

                  // Add preview script to package.json
                  const pkgPath = resolve(rootDirectory, 'package.json');
                  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
                  const scriptKey = `preview:${newSizeName}`;
                  if (!pkg.scripts[scriptKey]) {
                    pkg.scripts[scriptKey] = 'tsc && vite build';
                    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');
                  }

                  console.log(chalk.greenBright(`Created new ad size: ${newSizeName} (from ${sourceSize})`));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    sizeName: newSizeName,
                    adConfigs: updatedDevAdConfigs,
                  }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            });
          },
        },
        {
          name: 'delete-size-api',
          apply: 'serve',
          configureServer(server) {
            server.middlewares.use('/api/delete-size', (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { sizeName } = JSON.parse(body);

                  if (!sizeName) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'sizeName is required' }));
                    return;
                  }

                  // Must have at least 2 sizes to delete one
                  const sizeCount = Object.keys(adConfigs).length;
                  if (sizeCount <= 1) {
                    res.statusCode = 400;
                    res.end(JSON.stringify({ error: 'Cannot delete the last remaining ad size' }));
                    return;
                  }

                  const sizePath = resolve(rootDirectory, sizeName);
                  if (!existsSync(sizePath)) {
                    res.statusCode = 404;
                    res.end(JSON.stringify({ error: `Size "${sizeName}" not found` }));
                    return;
                  }

                  // Remove the entire size folder
                  rmSync(sizePath, { recursive: true, force: true });

                  // Remove from adConfigs in-place
                  delete adConfigs[sizeName];

                  // Remove handlebars contexts for this size
                  for (const key of Object.keys(handlebarsContexts)) {
                    if (key.startsWith(`/${sizeName}/`)) {
                      delete handlebarsContexts[key];
                    }
                  }

                  // Update __devAdConfigs in all remaining contexts
                  const updatedDevAdConfigs = Object.entries(adConfigs).map(([name, config]) => ({
                    name,
                    variants: config.variants ? config.variants.map(v => v.name) : [],
                  }));
                  const devAdConfigsJson = JSON.stringify(updatedDevAdConfigs);
                  for (const key of Object.keys(handlebarsContexts)) {
                    handlebarsContexts[key].__devAdConfigs = devAdConfigsJson;
                  }

                  // Remove preview script from package.json
                  const pkgPath = resolve(rootDirectory, 'package.json');
                  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
                  delete pkg.scripts[`preview:${sizeName}`];
                  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf-8');

                  console.log(chalk.greenBright(`Deleted ad size: ${sizeName}`));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({
                    success: true,
                    adConfigs: updatedDevAdConfigs,
                  }));
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            });
          },
        },
        {
          name: 'sprites-api',
          apply: 'serve',
          configureServer(server) {
            // GET /api/sprites?adSize=300x250
            server.middlewares.use('/api/sprites', (req, res) => {
              if (req.method !== 'GET') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              const urlParts = new URL(req.url, 'http://localhost');
              const adSize = urlParts.searchParams.get('adSize');

              if (!adSize) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'adSize parameter required' }));
                return;
              }

              try {
                const spriteDir = resolve(rootDirectory, adSize, 'src/img/sprite');
                let sprites = [];

                if (existsSync(spriteDir)) {
                  sprites = readdirSync(spriteDir)
                    .filter(file => {
                      // Filter out .gitkeep and non-image files
                      const ext = file.toLowerCase().split('.').pop();
                      return file !== '.gitkeep' && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
                    })
                    .map(file => {
                      // Return file name without extension as sprite name
                      const name = file.replace(/\.[^/.]+$/, '');
                      return { name, file };
                    });
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ sprites }));
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message }));
              }
            });
          },
        },
        {
          name: 'images-api',
          apply: 'serve',
          configureServer(server) {
            // GET /api/images?adSize=300x250 - List images in the img folder
            server.middlewares.use('/api/images', (req, res) => {
              if (req.method !== 'GET') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              const urlParts = new URL(req.url, 'http://localhost');
              const adSize = urlParts.searchParams.get('adSize');

              if (!adSize) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'adSize parameter required' }));
                return;
              }

              try {
                const imgDir = resolve(rootDirectory, adSize, 'src/img');
                let images = [];

                if (existsSync(imgDir)) {
                  const readImagesRecursively = (dir, prefix = '') => {
                    const items = readdirSync(dir, { withFileTypes: true });
                    for (const item of items) {
                      // Skip sprite folder, sprite.png, and hidden files
                      if (item.name === 'sprite' || item.name === 'sprite.png' || item.name.startsWith('.')) continue;
                      
                      const fullPath = resolve(dir, item.name);
                      const relativePath = prefix ? `${prefix}/${item.name}` : item.name;
                      
                      if (item.isDirectory()) {
                        readImagesRecursively(fullPath, relativePath);
                      } else {
                        const ext = item.name.toLowerCase().split('.').pop();
                        if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
                          images.push({
                            filename: item.name,
                            path: relativePath,
                            cssValue: `url(./src/img/${relativePath})`,
                          });
                        }
                      }
                    }
                  };
                  
                  readImagesRecursively(imgDir);
                }

                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ images }));
              } catch (error) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: error.message }));
              }
            });
          },
        },
        {
          name: 'job-settings-api',
          apply: 'serve',
          configureServer(server) {
            // GET job settings
            server.middlewares.use('/api/job-settings', (req, res) => {
              if (req.method === 'GET') {
                try {
                  const jobSettingsPath = resolve(rootDirectory, 'job-settings.yaml');
                  if (existsSync(jobSettingsPath)) {
                    const jobSettings = yaml.load(readFileSync(jobSettingsPath, 'utf-8'));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      jobNumber: jobSettings.jobNumber || '000000',
                      jobName: jobSettings.jobName || 'job-name',
                      delayedHover: !!(jobSettings.delayedHover ?? jobSettings.requireMainTimelineCompleteForHover),
                    }));
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ jobNumber: '000000', jobName: 'job-name', delayedHover: false }));
                  }
                } catch (error) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: error.message }));
                }
                return;
              }

              if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  try {
                    const payload = JSON.parse(body);
                    const jobNumber = payload.jobNumber;
                    const jobName = payload.jobName;
                    const delayedHover = payload.delayedHover ?? payload.requireMainTimelineCompleteForHover;
                    const jobSettingsPath = resolve(rootDirectory, 'job-settings.yaml');
                    const content = `jobNumber: "${jobNumber}"\njobName: "${jobName}"\ndelayedHover: ${!!delayedHover}\n`;
                    writeFileSync(jobSettingsPath, content, 'utf-8');
                    console.log(chalk.greenBright(`Job settings updated: ${jobNumber} / ${jobName}`));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ success: true }));
                  } catch (error) {
                    res.statusCode = 500;
                    res.end(JSON.stringify({ success: false, error: error.message }));
                  }
                });
                return;
              }

              res.statusCode = 405;
              res.end('Method not allowed');
            });
          },
        },
        {
          name: 'screenshot-save-api',
          apply: 'serve',
          configureServer(server) {
            server.middlewares.use('/api/save-screenshot', (req, res) => {
              if (req.method !== 'POST') {
                res.statusCode = 405;
                res.end('Method not allowed');
                return;
              }

              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              req.on('end', () => {
                try {
                  const { adSize, version, imageData } = JSON.parse(body);
                  
                  // Read job settings from job-settings.yaml
                  const jobSettings = yaml.load(readFileSync(resolve(rootDirectory, 'job-settings.yaml'), 'utf-8'));
                  const jobNumber = jobSettings.jobNumber || '000000';
                  const jobName = jobSettings.jobName || 'job-name';
                  
                  // Create statics directory if it doesn't exist
                  const staticsDir = resolve(rootDirectory, adSize, 'statics');
                  if (!existsSync(staticsDir)) {
                    mkdirSync(staticsDir, { recursive: true });
                  }

                  // Filename format: {jobNumber}-{jobName}-{adSize}-{version}-static.jpg
                  const filename = `${jobNumber}-${jobName}-${adSize}-${version}-static.jpg`;
                  const filepath = resolve(staticsDir, filename);

                  // Convert base64 to buffer and save
                  const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
                  const buffer = Buffer.from(base64Data, 'base64');
                  writeFileSync(filepath, buffer);

                  console.log(chalk.greenBright(`Screenshot saved: ${adSize}/statics/${filename}`));

                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, path: `${adSize}/statics/${filename}` }));
                } catch (error) {
                  console.error('Error saving screenshot:', error);
                  res.statusCode = 500;
                  res.end(JSON.stringify({ success: false, error: error.message }));
                }
              });
            });
          },
        },
        {
          name: 'test-thing',
          apply: 'serve',
          configureServer(server) {
            const _listen = server.listen;
            server.listen = function () {
              const isRestart = arguments[1] === true;
              if (!isRestart) {
                server.httpServer?.on('listening', () => {
                  setTimeout(() => {
                    console.clear();
                    server.config.logger.clearScreen();

                    if (!visibleHost) {
                      visibleHost = server.resolvedUrls.local;
                    }

                    server.config.logger.info('');
                    server.config.logger.info(
                      chalk.greenBright.bold(`All Ads: ${visibleHost}all.html`),
                    );
                    server.config.logger.info('');
                  }, 100);
                });
              }
              return _listen.apply(this, arguments);
            };
          },
        },
        ViteRestart({
          restart: ['**/*.hbs', '**/*.html'],
          glob: true,
        }),
        virtualVariantHtmlPlugin(adConfigs, rootDirectory),
        handlebars({
          context(pagePath) {
            if (handlebarsContexts[pagePath]) {
              // Merge the found context with vite mode.
              return {
                ...handlebarsContexts[pagePath],
                devMode: mode === 'development',
              };
            }

            return {
              devMode: mode === 'development',
            };
          },
          partialDirectory: partialDirectories,
        }),
        ...spritesheets.map((spritesheet) => Spritesmith(spritesheet)),
      ],
    };
  });
};
