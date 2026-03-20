import fs from 'fs';
import { resolve } from 'path';
import { spawnSync } from 'child_process';
import archiver from 'archiver';
import yaml from 'js-yaml';
import chalk from 'chalk';
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

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function colorizeSize(sizeBytes, text) {
  const yellowThreshold = 150 * 1024;
  const redThreshold = 250 * 1024;

  if (sizeBytes >= redThreshold) return chalk.redBright.bold(text);
  if (sizeBytes >= yellowThreshold) return chalk.yellowBright.bold(text);
  return chalk.greenBright(text);
}

function printSection(title) {
  const line = '═'.repeat(78);
  console.log(`\n${chalk.cyanBright(line)}`);
  console.log(chalk.cyanBright.bold(`  ${title}`));
  console.log(chalk.cyanBright(line));
}

function printSubsection(title) {
  const line = '─'.repeat(78);
  console.log(`\n${chalk.gray(line)}`);
  console.log(chalk.whiteBright.bold(`  ${title}`));
  console.log(chalk.gray(line));
}

function runCommandQuiet(label, command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd,
    env: options.env,
    stdio: 'pipe',
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    const rule = '═'.repeat(78);
    console.log(`\n${chalk.redBright(rule)}`);
    console.log(chalk.redBright.bold(`  ${label} FAILED`));
    console.log(chalk.redBright(rule));

    if (result.stdout?.trim()) {
      console.log(chalk.whiteBright('\n[stdout]'));
      console.log(result.stdout.trimEnd());
    }

    if (result.stderr?.trim()) {
      console.log(chalk.whiteBright('\n[stderr]'));
      console.log(result.stderr.trimEnd());
    }

    process.exit(result.status || 1);
  }

  return result;
}

function collectDirectoryAssetStats(dirPath) {
  const files = [];

  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    entries.forEach((entry) => {
      const nextPath = `${currentPath}/${entry.name}`;
      if (entry.isDirectory()) {
        walk(nextPath);
        return;
      }

      const size = fs.statSync(nextPath).size;
      files.push({ name: entry.name, size });
    });
  }

  if (!fs.existsSync(dirPath)) {
    return { fileCount: 0, totalBytes: 0, largestFiles: [] };
  }

  walk(dirPath);

  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
  const largestFiles = [...files]
    .sort((a, b) => b.size - a.size)
    .slice(0, 3);

  return {
    fileCount: files.length,
    totalBytes,
    largestFiles,
  };
}

/**
 * Extracts image filename (without extension) from a URL or path string
 * Examples: "./src/img/photo.jpg" -> "photo", "url(./sprite.png)" -> "sprite"
 */
function extractImageFileName(imageUrl) {
  // Remove url() wrapper and quotes if present
  let cleaned = imageUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
  // Get just the filename without path or extension
  return cleaned.split('/').pop().split('.').shift();
}

/**
 * Scans HTML content for image references (url(), src=, data-src, etc.)
 * Returns array of unique image filenames referenced in the content
 */
function findImagesInHtml(htmlContent) {
  const imageReferences = new Set();
  
  // Find all url() references in CSS (both inline and style attributes)
  const urlRegex = /url\(['"]?([^)'"]+)['"]?\)/gi;
  let match;
  while ((match = urlRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    // Skip data URIs and absolute URLs
    if (!url.startsWith('data:') && !url.startsWith('http')) {
      imageReferences.add(extractImageFileName(match[0]));
    }
  }
  
  // Find src= references (img, script, etc.)
  const srcRegex = /\s(?:src|data-src)\s*=\s*['"]([^'"]+)['"]/gi;
  while ((match = srcRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    // Skip data URIs and absolute URLs
    if (!url.startsWith('data:') && !url.startsWith('http')) {
      imageReferences.add(extractImageFileName(url));
    }
  }
  
  // Find background-image: url() in style attributes
  const bgRegex = /background(?:-image)?\s*:\s*url\(['"]?([^)'"]+)['"]?\)/gi;
  while ((match = bgRegex.exec(htmlContent)) !== null) {
    const url = match[1];
    if (!url.startsWith('data:') && !url.startsWith('http')) {
      imageReferences.add(extractImageFileName(match[0]));
    }
  }
  
  return Array.from(imageReferences);
}

// Load ad configs from individual ad folders.
const rootDirectory = resolve('./');
const adConfigJson = loadAdConfigs(rootDirectory);

// Read job settings from job-settings.yaml
const jobSettings = yaml.load(fs.readFileSync(resolve(rootDirectory, 'job-settings.yaml'), 'utf-8'));
const jobNumber = jobSettings.jobNumber || '000000';
const jobName = jobSettings.jobName || 'job-name';

// Build each ad size cleanly without dev toolbar for packaging
const sizeDirRe = /^\d+x\d+(?:-[a-zA-Z0-9_-]+)?$/;
const adSizeDirs = fs.readdirSync(rootDirectory, { withFileTypes: true })
  .filter(e => e.isDirectory())
  .map(e => e.name)
  .filter(name => sizeDirRe.test(name))
  .filter(name => fs.existsSync(resolve(rootDirectory, name, 'index.html')));

if (adSizeDirs.length === 0) {
  console.error('No ad size directories with index.html were found.');
  process.exit(1);
}

printSection('PACKAGE BUILD PIPELINE');
console.log(chalk.gray(`Root: ${rootDirectory}`));
console.log(chalk.gray(`Sizes: ${adSizeDirs.join(', ')}`));

printSubsection('TypeScript Check');
console.log(chalk.gray('Running TypeScript compile...'));
runCommandQuiet('TypeScript compile', 'pnpm', ['exec', 'tsc'], {
  cwd: rootDirectory,
  env: process.env,
});
console.log(`${chalk.greenBright('✓')} ${chalk.greenBright('TypeScript check complete')}`);

printSubsection('Building Ad Sizes (No Dev Toolbar)');
if (fs.existsSync('build-src')) {
  fs.rmSync('build-src', { recursive: true, force: true });
}
for (const size of adSizeDirs) {
  const marker = `Building ${size}`;
  console.log(`\n${chalk.yellowBright('▶')} ${chalk.yellowBright.bold(marker)}`);
  runCommandQuiet(`Build ${size}`, 'pnpm', ['exec', 'vite', 'build'], {
    cwd: rootDirectory,
    env: { ...process.env, npm_lifecycle_event: `build:${size}` },
  });

  const stats = collectDirectoryAssetStats(`build-src/${size}`);
  const largestText = stats.largestFiles.length > 0
    ? stats.largestFiles.map((file) => `${file.name} ${formatBytes(file.size)}`).join(' | ')
    : 'none';

  console.log(
    `${chalk.greenBright('✓')} ${chalk.greenBright(`${size} build complete`)} ` +
    `${chalk.gray(`(${stats.fileCount} files, ${formatBytes(stats.totalBytes)})`)}`,
  );
  console.log(chalk.gray(`   Largest assets: ${largestText}`));
}

if (fs.existsSync('build')) {
  printSubsection('Preparing Build Output Directory');
  console.log(chalk.gray('Removing existing build directory...'));
  fs.rmSync('build', { recursive: true, force: true });
} else {
  printSubsection('Preparing Build Output Directory');
  console.log(chalk.gray('No existing build directory found.'));
}

console.log(chalk.gray('Creating build directory...'));
fs.mkdirSync('build');

const zipTasks = [];
const zipReports = [];

// Iterate through each directory in the build-src directory. If multiple HTML files exist, duplicate the entire directory.
fs.readdirSync('build-src', { withFileTypes: true }).filter(d => d.isDirectory()).forEach((entry) => {
  const dir = entry.name;
  // Skip .gitkeep folder.
  if (dir === '.gitkeep') return;

  // If the directory has multiple html files, copy the entire directory to the "build" directory and append the html file name to the new folder name.
  const htmlFileVariants = fs
    .readdirSync(`build-src/${dir}`)
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

    // Extract images from config (css-variables.images and top-level images)
    const adConfig = adVariantConfig || adSizeConfig;
    
    // Check for images in css-variables.images (the primary location)
    const cssVariables = adConfig?.context?.['css-variables'];
    if (cssVariables?.images) {
      for (const [name, imageUrl] of Object.entries(cssVariables.images)) {
        // imageUrl could be like "url(./src/img/photo-v1.jpg)" or "./src/img/photo-v1.jpg"
        if (typeof imageUrl === 'string' && !imageUrl.startsWith('http')) {
          const fileName = extractImageFileName(imageUrl);
          if (fileName) {
            validImageNames.push(fileName);
          }
        }
      }
    }
    
    // Also check for top-level images key (for explicit image listing)
    if (adConfig?.context?.images && typeof adConfig.context.images === 'object') {
      for (const [name, image] of Object.entries(adConfig.context.images)) {
        // If it's an absolute URL, skip.
        if (typeof image === 'string' && !image.startsWith('http')) {
          const fileName = extractImageFileName(image);
          if (fileName) {
            validImageNames.push(fileName);
          }
        }
      }
    }

    // Copy all files from build-src/{dir} to build/{newDirName}.
    let htmlContent = null; // Store HTML content to scan for image refs
    
    fs.readdirSync(`build-src/${dir}`).forEach((file) => {
      // Only copy HTML file related to the current htmlFileVariant.
      if (file.endsWith('.html') && !file.startsWith(htmlFile)) return;

      // Rename HTML file to index.html.
      if (file.endsWith('.html')) {
        const sourceHtmlPath = `build-src/${dir}/${file}`;
        const destHtmlPath = `${newDirPath}/index.html`;
        // Read and store HTML content to scan for image references
        htmlContent = fs.readFileSync(sourceHtmlPath, 'utf-8');

        // Update title to: jobNumber - jobName - adSize - version (matching dev/preview format)
        const versionLabel = hasMultipleVersions ? ` - ${version}` : '';
        const packageTitle = `${jobNumber} - ${jobName} - ${adSize}${versionLabel}`;
        htmlContent = htmlContent.replace(/<title>[\s\S]*?<\/title>/, `<title>${packageTitle}</title>`);

        // Write modified content to destination
        fs.writeFileSync(destHtmlPath, htmlContent, 'utf-8');
        
        // Find any image references in the HTML and add them to valid images
        const htmlImageRefs = findImagesInHtml(htmlContent);
        htmlImageRefs.forEach((imgName) => {
          if (imgName && !validImageNames.includes(imgName)) {
            validImageNames.push(imgName);
          }
        });
        
        return;
      }

      // If file isn't an image (check with regex for extension), copy it to the new directory.
      if (!file.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i)) {
        fs.copyFileSync(`build-src/${dir}/${file}`, `${newDirPath}/${file}`);
      } else {
        // Check if the file name is in `validImageNames`.
        const fileName = file.split('.').shift();
        const validFile = validImageNames.some((name) => fileName === name);

        if (validFile) {
          fs.copyFileSync(`build-src/${dir}/${file}`, `${newDirPath}/${file}`);
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
      console.log(chalk.gray(`Added static: ${staticFileName}`));
    }

    // Zip-up each directory within the build directory.
    const zipVersionSuffix = hasMultipleVersions ? `-${version}` : '';
    const zipFileName = `${jobNumber}-${jobName}-${adSize}${zipVersionSuffix}-html.zip`;
    const zipPath = `build/${zipFileName}`;
    const zipTask = zipFolder(newDirPath, zipPath).then(() => {
      const { size } = fs.statSync(zipPath);
      zipReports.push({ fileName: zipFileName, size });

      // Remove the new non-zip directory.
      fs.rmSync(newDirPath, { recursive: true, force: true });
    });

    zipTasks.push(zipTask);
  });
});

await Promise.all(zipTasks);

if (zipReports.length > 0) {
  const sortedReports = zipReports.sort((a, b) => a.fileName.localeCompare(b.fileName));
  const tableRule = '─'.repeat(78);
  console.log(`\n${chalk.cyanBright(tableRule)}`);
  console.log(chalk.cyanBright.bold('  PLATFORM SIZE LIMITS'));
  console.log(chalk.cyanBright(tableRule));
  console.log(chalk.whiteBright('  Platform              Initial Load     Polite Load     Total Max'));
  console.log(chalk.gray('  CM360                 150 KB           2.2 MB          ~2.35 MB'));
  console.log(chalk.gray('  Google Ads (GDN)      150 KB           ~2.2 MB         ~2.5 MB'));
  console.log(chalk.cyanBright(tableRule));

  const rule = '═'.repeat(78);
  console.log(`\n${chalk.greenBright(rule)}`);
  console.log(chalk.greenBright.bold('  FINAL ZIP SIZES (ACTUAL FILE SIZE)'));
  console.log(chalk.greenBright(rule));

  sortedReports.forEach(({ fileName, size }) => {
    const pretty = formatBytes(size).padStart(10, ' ');
    const coloredPretty = colorizeSize(size, pretty);
    console.log(`  ${chalk.whiteBright(fileName)}  ${coloredPretty}  ${chalk.gray(`(${size} bytes)`)}`);
  });

  console.log(chalk.greenBright(rule));
}

console.log(`\n${chalk.greenBright.bold('All set. Your ads are packaged and ready to go.')}\n`);
