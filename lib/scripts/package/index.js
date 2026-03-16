import fs from 'fs';
import { resolve } from 'path';
import archiver from 'archiver';
import yaml from 'js-yaml';
import { loadAdConfigs } from '../../ad/config.js';

// Helper function to zip a folder
function zipFolder(srcPath, destPath) {
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(destPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));

    archive.pipe(output);
    archive.directory(srcPath, false);
    archive.finalize();
  });
}

// Load ad configs from individual ad folders.
const rootDirectory = resolve('./');
const adConfigJson = loadAdConfigs(rootDirectory);

// Read job settings from job-settings.yaml
const jobSettings = yaml.load(fs.readFileSync(resolve(rootDirectory, 'job-settings.yaml'), 'utf-8'));
const jobNumber = jobSettings.jobNumber || '000000';
const jobName = jobSettings.jobName || 'job-name';

if (fs.existsSync('build')) {
  console.log('removing build directory...');
  fs.rmSync('build', { recursive: true, force: true });
} else {
  console.log('build directory does not exist');
}

console.log('creating build directory...');
fs.mkdirSync('build');

// Iterate through each directory in the preview directory. If multiple HTML files exist, duplicate the entire directory.
fs.readdirSync('preview', { withFileTypes: true }).filter(d => d.isDirectory()).forEach((entry) => {
  const dir = entry.name;
  // Skip .gitkeep folder.
  if (dir === '.gitkeep') return;

  // If the directory has multiple html files, copy the entire directory to the "build" directory and append the html file name to the new folder name.
  const htmlFileVariants = fs
    .readdirSync(`preview/${dir}`)
    .filter((file) => file.endsWith('.html'))
    .map((file) => file.replace('.html', ''));

  const hasMultipleVersions = htmlFileVariants.length > 1;

  // Iterate each htmlFileVariants, copy each directory to the "build" directory and append the html file name to the new folder name.
  htmlFileVariants.forEach((htmlFile) => {
    const adSize = dir;
    const version = htmlFile === 'index' ? 'v1' : htmlFile;
    const versionSuffix = hasMultipleVersions ? `-${version}` : '';

    const newDirName = `${adSize}${versionSuffix}-html`;
    const newDirPath = `build/${newDirName}`;

    // Create new directory.
    fs.mkdirSync(newDirPath);

    const adSizeConfig = adConfigJson[adSize];
    if (!adSizeConfig) {
      console.log(`Skipping ${adSize}: no ad config found`);
      fs.rmSync(newDirPath, { recursive: true, force: true });
      return;
    }
    const adVariantConfig = adSizeConfig.variants?.find(
      (variant) => variant.name === htmlFile,
    );

    const validImageNames = [];

    // If there are sprites, add them to the valid images.
    if (adSizeConfig.sprites) {
      adSizeConfig.sprites.forEach((sprite) => {
        validImageNames.push(sprite.name);
      });
    }

    // If the ad size or variant has images, add the variant images to the valid images.
    const adConfig = adVariantConfig || adSizeConfig;
    if (adConfig && adConfig.context.images) {
      for (const [name, image] of Object.entries(adConfig.context.images)) {
        // If it's an absolute URL, skip.
        if (image.startsWith('http')) continue;

        // Extract only the file name without the extension or path.
        const fileName = image.split('/').pop().split('.').shift();

        // Add the file name to the valid images.
        validImageNames.push(fileName);
      }
    }

    // Copy all files from preview/{dir} to build/{newDirName}.
    fs.readdirSync(`preview/${dir}`).forEach((file) => {
      // Only copy HTML file related to the current htmlFileVariant.
      if (file.endsWith('.html') && !file.startsWith(htmlFile)) return;

      // Rename HTML file to index.html.
      if (file.endsWith('.html')) {
        fs.copyFileSync(`preview/${dir}/${file}`, `${newDirPath}/index.html`);
        return;
      }

      // If file isn't an image (check with regex for extension), copy it to the new directory.
      if (!file.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
        fs.copyFileSync(`preview/${dir}/${file}`, `${newDirPath}/${file}`);
      } else {
        // Check if the file name is in `validImageNames`.
        const fileName = file.split('.').shift();
        const validFile = validImageNames.some((name) => fileName === name);

        if (validFile) {
          fs.copyFileSync(`preview/${dir}/${file}`, `${newDirPath}/${file}`);
        }
      }
    });

    // Copy static screenshot if it exists in the statics folder to build root
    const staticsDir = `${adSize}/statics`;
    const staticVersion = hasMultipleVersions ? version : 'v1';
    const staticFileName = `${jobNumber}-${jobName}-${adSize}-${staticVersion}-static.jpg`;
    const staticFilePath = `${staticsDir}/${staticFileName}`;
    
    if (fs.existsSync(staticFilePath)) {
      fs.copyFileSync(staticFilePath, `build/${staticFileName}`);
      console.log(`Added static: ${staticFileName}`);
    }

    // Zip-up each directory within the build directory.
    const zipVersionSuffix = hasMultipleVersions ? `-${version}` : '';
    const zipFileName = `${jobNumber}-${jobName}-${adSize}${zipVersionSuffix}-html.zip`;
    zipFolder(newDirPath, `build/${zipFileName}`).then(() => {
      // Remove the new non-zip directory.
      fs.rmSync(newDirPath, { recursive: true, force: true });
    });
  });
});
