import { resolve } from 'path';
import { open } from 'fs/promises';
import { userInfo } from 'os';
import chalk from 'chalk';
import { parseAdInfoFromDirectory } from '../../ad/utils.js';
import { loadAdConfigs } from '../../ad/config.js';

// Initialize stored ad configs from ad.config.json files in each ad folder.
const baseDirectory = resolve('./');
const adConfigs = loadAdConfigs(baseDirectory);

for (const [name, config] of Object.entries(adConfigs)) {
  // Extract information about the ad size/directories.
  const adInfo = parseAdInfoFromDirectory(resolve(baseDirectory, `./${name}`));

  // Append information to context.
  adConfigs[name].context = {
    ...adInfo,
    ...config.context,
  };
}

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
  if (globalDigadConfig.previewBasePath) {
    // Set variable info from the config for the corresponding user.
    visibleHost = `https://${globalDigadConfig.previewBasePath}/`;
  }

  await globalDigadConfigFile.close();

  console.log(chalk.greenBright.bold('Preview URLs:'));

  // Log preview URLs.
  for (const [name, config] of Object.entries(adConfigs)) {
    console.log(
      chalk.greenBright(
        `${name}:\t\t${visibleHost}${config.context.client}/${config.context.job}/preview/${config.context.name}/index.html`,
      ),
    );
    if (config.variants) {
      config.variants.forEach((variant) => {
        console.log(
          chalk.greenBright(
            `${name}-${variant.name}:\t\t${visibleHost}${config.context.client}/${config.context.job}/preview/${config.context.name}/${variant.name}.html`,
          ),
        );
      });
    }
    console.log('\n');
  }
} catch (error) {
  console.error('Could not read global digads config file');
  console.error('Could not generate preview URLs');
}
