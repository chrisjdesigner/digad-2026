import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
import { open } from 'fs/promises';
import { defineConfig } from 'vite';
import handlebars from 'vite-plugin-handlebars';
import Spritesmith from 'vite-plugin-spritesmith';
import ViteRestart from 'vite-plugin-restart';
import { userInfo } from 'os';
import chalk from 'chalk';
import tsconfigPaths from 'vite-tsconfig-paths';

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

  const handlebarsContexts = {};
  const spritesheets = [];
  for (const [name, config] of Object.entries(adConfigs)) {
    // Handlebars context/data.
    if (config.context) {
      handlebarsContexts[`/${name}/index.html`] = config.context;
    }

    // Variant contexts.
    if (config.variants) {
      config.variants.forEach((variant) => {
        handlebarsContexts[`/${name}/${variant.name}.html`] = {
          ...config.context,
          ...variant.context,
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
                ? { padding: 5, ...sprite.options }
                : {
                  padding: 5,
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
    console.log(error);
    console.log('No digads.json file found.');
    console.log('Using default Vite server config.');
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
