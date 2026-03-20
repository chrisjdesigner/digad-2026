# AdForge 1.0.0

## Commands

_All commands should be run at the root-level of this project, not within an individual ad size_

- `lib/scripts/install.sh` - Install and fix permissions.
- `pnpm i` - Install dependencies.
- `pnpm run dev` - Run during development on a specified port.
- `pnpm run ts-lint` - Run TypeScript checks in watch mode.
- `pnpm run preview` - Compiles all ad sizes/variants into a `preview` directory. This is used for demo purposes, such as on the Stage server.
- `pnpm run package` - Packages and zips all ad/sizes variants into a `build` directory.

## Workflow:

### Creating the project

1. Clone this template to your job number
2. On the Dev server, go to your new job number folder
3. Run `lib/scripts/install.sh`, type in your password if asked. Your project is ready!

### Developing

During development, a unique URL will be assigned to you for viewing changes. Once you stop your `pnpm run dev` task, this URL won't work!

1. Run `pnpm run dev`
2. The terminal will display a prominent **All Ads** URL — open it to see all of your ad sizes and variants in one view
3. As you make changes, the browser will automatically reload

#### Dev Toolbar

In dev mode, a toolbar appears at the top of each ad with:
- **Size dropdown** - Switch between ad sizes (e.g., 300x250, 728x90)
- **Version dropdown** - Switch between variants (Base, v2, v3, etc.)
- **Screenshot button** - Capture the current ad as a JPG and save to the `statics/` folder

Screenshots are named using the format `{jobNumber}-{jobName}-{adSize}-{version}-static.jpg` (e.g., `123456-client-campaign-300x250-v1-static.jpg`). Base versions are named `v1`.

**Note:** Configure job settings in `job-settings.yaml` at the project root (Or use the interface). This information will be appended to file names on export and when taking screenshots:
```yaml
jobNumber: "123456"
jobName: "client-campaign"
```

### Previewing

When you're ready to show other people your work, you're ready to "preview" it and get it up on Stage.

1. Run `pnpm run preview`
2. This will compile all your assets and place them in the `preview` folder. Build output is kept quiet — only errors are shown. Each ad size prints a completion line with its file count and total size
3. When finished you'll see: **"You're good to go. Ads are ready in staging."**
4. Commit/Push, and view on Stage

### Packaging

When you're done with your ads, it's time to package them

1. Run `pnpm run package`
2. This will generate zip files and place statics for each of your ad sizes/variants in the `build` directory

Build output is kept quiet — only errors are shown. Each ad size prints a completion line with its file count and total size. When all builds are done, a summary shows:
- A **platform size limits** reference table (CM360 / Google Ads)
- The **actual ZIP file sizes**, color-coded: green = within limits, yellow = approaching 150 KB, red = over 250 KB
- A final message: **"All set. Your ads are packaged and ready to go."**

Zip files are named using the format `{jobNumber}-{jobName}-{adSize}-{version}-html.zip` (e.g., `123456-client-campaign-300x250-v1-html.zip`), matching the screenshot naming convention.

**Note:** If you've captured screenshots using the dev toolbar, they will be copied to the `build` directory as separate JPG files (not inside the zips).

## Creating a New Ad Size (This can be done in the interface)

1. Copy an existing ad size folder
   - The new folder must be named `[WIDTH]x[HEIGHT]` or `[WIDTH]x[HEIGHT]-[OPTIONAL-SUFFIX]` (e.g., `300x250`, `300x250-rework`)
2. That's it — the dev, preview, and package scripts automatically detect any folder matching that naming pattern

## Configuring an Ad (This can be done in the interface)

1. Ad dimensions are inferred from the folder name of the ad and passed as variables to CSS and the template
2. Define your ad configuration inside YAML config files within each ad size folder

### Config File Structure (This can be done in the interface)

Config files can be placed:
- In a `versions/` subfolder: `300x250/versions/ad.config.yaml`

Each ad size can have:
- `ad.config.yaml` - Base configuration for the main ad
- `[variant].config.yaml` - Separate config per variant (e.g., `v2.config.yaml`, `v3.config.yaml`)

**Variants are automatic!** Just create a config file like `v2.config.yaml` and the system will automatically create the variant. No separate HTML files needed - they're generated from `index.html`.

> **Note:** JSON files (`.json`) are also supported for backwards compatibility, but YAML is recommended for better readability and comment support.

### CSS Variables from Config (These can be set in the interface)

Any values under `css-variables` in your config are automatically injected as CSS custom properties. Variables are organized into categories (`colors`, `images`, `typography`, `other`) for readability — the categories themselves are not part of the variable name:

```yaml
css-variables:
  colors:
    brand-color: "#ff6600"
  typography:
    headline-font-size: 24px
  images:
    photo-url: url(./src/img/photo.jpg)
  other: {}
```

These become available in your CSS/SCSS as:
```css
.headline {
  color: var(--brand-color);
  font-size: var(--headline-font-size);
  background-image: var(--photo-url);
}
```

### Example: Base Config (`300x250/versions/ad.config.yaml`)

```yaml
headline-1: Attention Grabbing Headline Here.
subhead-1: Supportive subhead goes here.
cta: Learn More
css-variables:
  colors:
    border-color: grey
    white: "#ffffff"
    black: "#000000"
  images:
    image-1-url: url(./src/img/bg.jpg)
  typography:
    headline-1-font-size: 24px
    headline-1-line-height: 100%
    subhead-1-font-size: 14px
    subhead-1-line-height: 100%
    cta-font-size: 14px
  other: {}
sprites:
  - name: sprite
```

### Example: Variant Config (`300x250/versions/v2.config.yaml`)

```yaml
headline-1: Version 2 Headline
subhead-1: Different subhead for this version.
cta: Learn More
css-variables:
  colors:
    border-color: grey
    white: "#ffffff"
    black: "#000000"
  images:
    image-1-url: url(./src/img/bg-v2.jpg)
  typography:
    headline-1-font-size: 22px
    headline-1-line-height: 100%
    subhead-1-font-size: 14px
    subhead-1-line-height: 100%
    cta-font-size: 14px
  other: {}
```

**Benefits of YAML configs:**
- Real comments with `#` - explain anything inline
- No quotes needed for most strings
- No commas or braces to worry about
- Each variant is its own file - easier to manage and compare
- Configs can be organized in a `versions/` subfolder

### Ad Configuration Options

- `css-variables`: Object of CSS custom properties injected into the ad
- `sprites`: Array of sprite configurations (only in `ad.config.yaml`)
- `externalCss`: Array of external stylesheet URLs
- `images`: Object of image paths
- All other keys are passed as template variables

## Templating

[Handlebars](https://handlebarsjs.com/guide/) is the templating language used for these ads

## Template directories

Templates should follow the naming convention `NAME.template.html`. While the `.template` portion is _technically_ optional, it is recommended so templates are distinguishable from normal HTML files.

Each ad size folder contains its own complete template file (e.g., `300x250.template.html`). Templates are self-contained with all HTML structure, styles, and markup in one file for easy editing.

## Spritesheets

Within the ad configuration for each ad size, multiple spritesheets can be configured for generation during the dev and build scripts

### Basic Example

The following configuration:

```yaml
sprites:
  - name: sprite
```

Will generate the following in the associated ad size _(NOTE: The `src/img/sprite` directory is your input of PNG assets)_:

```
├── src
│   ├── img
│   │   ├── sprite <- INPUT
│   │   │   ├── **/*.png
│   │   ├── sprite.png <- OUTPUT
│   ├── sass
│   │   ├── _sprite.scss <- OUTPUT
```

### Multi-sprite Example

```yaml
sprites:
  - name: my-cool-sprite
    options:
      padding: 50
  - name: another-sprite
```

Will generate the following:

```
├── src
│   ├── img
│   │   ├── my-cool-sprite <- INPUT
│   │   │   ├── **/*.png
│   │   ├── my-cool-sprite.png <- OUTPUT
│   │   │
│   │   ├── another-sprite <- INPUT
│   │   │   ├── **/*.png
│   │   ├── another-sprite.png <- OUTPUT
│   ├── sass
│   │   ├── _my-cool-sprite.scss <- OUTPUT
│   │   ├── _another-sprite.scss <- OUTPUT
```

## Project Structure

```
├── 300x250/                    # Ad size folder
│   ├── 300x250.template.html   # Handlebars template
│   ├── index.html              # Entry point (imports template)
│   ├── versions/               # Config files (optional subfolder)
│   │   ├── ad.config.yaml      # Base config
│   │   └── v2.config.yaml      # Variant config
│   ├── statics/                # Screenshots (generated, gitignored)
│   │   ├── index.jpg
│   │   └── v2.jpg
│   └── src/
│       ├── ts/
│       ├── img/
│       └── sass/
├── lib/                        # Shared library code
├── preview/                    # Built preview files
└── build/                      # Packaged zip files
```
