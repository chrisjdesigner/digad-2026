import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync, existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';
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
        handlebarsContexts[`/${name}/${variant.name}.html`] = {
          ...config.context,
          ...variant.context,
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
              // Skip if this is a request for a sub-path (like /api/ad-config/sync-variable)
              // req.url contains the remaining path after the matched prefix
              if (req.url && req.url.startsWith('/sync-variable')) {
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
                  const { adSize, variableName, variableType, action, defaultValue, category } = JSON.parse(body);
                  
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
                    const content = yaml.load(readFileSync(configPath, 'utf-8')) || {};
                    
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
                    }
                    
                    // Write back
                    const yamlContent = yaml.dump(content, { 
                      lineWidth: -1,
                      quotingType: '"',
                      forceQuotes: false,
                    });
                    writeFileSync(configPath, yamlContent, 'utf-8');
                  }
                  
                  console.log(chalk.greenBright(`Variable ${action}ed across ${configFiles.length} configs: ${variableName}`));
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ success: true, filesUpdated: configFiles.length }));
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
                  const jobSettingsPath = resolve(rootDirectory, 'JOB-SETTINGS.yaml');
                  if (existsSync(jobSettingsPath)) {
                    const jobSettings = yaml.load(readFileSync(jobSettingsPath, 'utf-8'));
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({
                      jobNumber: jobSettings.jobNumber || '000000',
                      jobName: jobSettings.jobName || 'job-name',
                    }));
                  } else {
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ jobNumber: '000000', jobName: 'job-name' }));
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
                    const { jobNumber, jobName } = JSON.parse(body);
                    const jobSettingsPath = resolve(rootDirectory, 'JOB-SETTINGS.yaml');
                    const content = `jobNumber: "${jobNumber}"\njobName: "${jobName}"\n`;
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
                  
                  // Read job settings from _job-settings.yaml
                  const jobSettings = yaml.load(readFileSync(resolve(rootDirectory, 'JOB-SETTINGS.yaml'), 'utf-8'));
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
          partialDirectory: [
            resolve(baseDirectory, './templates'),
            ...handleBarsTemplateDirectories.map((directory) => resolve(rootDirectory, directory)),
          ],
        }),
        ...spritesheets.map((spritesheet) => Spritesmith(spritesheet)),
      ],
    };
  });
};
