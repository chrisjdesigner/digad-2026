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

                    server.config.logger.info(
                      chalk.bold.bgCyanBright.whiteBright('Ad URLs:'),
                    );
                    server.config.logger.info(
                      chalk.bold.bgCyanBright.whiteBright('vvvvvvvv'),
                    );
                    server.config.logger.info('        ');

                    for (const [name, config] of Object.entries(adConfigs)) {
                      server.config.logger.info(
                        chalk.greenBright(
                          `${name}: ${visibleHost}${name}/index.html`,
                        ),
                      );
                      if (config.variants) {
                        config.variants.forEach((variant) => {
                          server.config.logger.info(
                            chalk.greenBright(
                              `${name}-${variant.name}: ${visibleHost}${name}/${variant.name}.html`,
                            ),
                          );
                        });
                      }
                    }

                    server.config.logger.info('        ');
                    server.config.logger.info(
                      chalk.bold.bgCyanBright.whiteBright('^^^^^^^^'),
                    );
                    server.config.logger.info(
                      chalk.bold.bgCyanBright.whiteBright('Ad URLs:'),
                    );
                  }, 100);
                });
              }
              return _listen.apply(this, arguments);
            };
          },
        },
        ViteRestart({
          restart: ['**/*.hbs', '**/*.html', '**/*.config.yaml', '**/*.config.yml', '**/*.config.json'],
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
