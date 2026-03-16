# Digad Template 1.0.0

Job Number: []

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
2. This will give you URLs for each of your ad sizes/variants
3. As you make changes, the URLs will automatically reload
4. Run pnpm run `pnpm run ts-lint` for automatic checks for if you make mistakes.

#### Dev Toolbar

In dev mode, a toolbar appears at the top of each ad with:
- **Size dropdown** - Switch between ad sizes (e.g., 300x250, 728x90)
- **Version dropdown** - Switch between variants (Base, v2, v3, etc.)
- **Screenshot button** - Capture the current ad as a JPG and save to the `statics/` folder

Screenshots are named using the format `{jobNumber}-{jobName}-{adSize}-{version}-static.jpg` (e.g., `123456-client-campaign-300x250-v1-static.jpg`). Base versions are named `v1`.

**Note:** Configure job settings in `job-settings.yaml` at the project root. This information will be appended to file names on export and when taking screenshots:
```yaml
jobNumber: "123456"
jobName: "client-campaign"
```

### Previewing

When you're ready to show other people your work, you're ready to "preview" it and get it up on Stage.

1. Run `pnpm run preview`
2. This will compile all your assets and place them in the `preview` folder. This will then give you URLs for each of your ad sizes/variants
3. Confirm the ads look good
4. Commit/Push, and view on Stage

### Packaging

When you're done with your ads, it's time to package them

1. Run the instructions from the above _Previewing_ section
2. Run `pnpm run package`
3. This will generate zip files for each of your ad sizes/variants in the `build` directory

Zip files are named using the format `{jobNumber}-{jobName}-{adSize}-{version}-html.zip` (e.g., `123456-client-campaign-300x250-v1-html.zip`), matching the screenshot naming convention.

**Note:** If you've captured screenshots using the dev toolbar, they will be copied to the `build` directory as separate JPG files (not inside the zips).

## Creating a New Ad Size

1. Copy existing ad size folder
   - This new folder should be named `[WIDTH]x[HEIGHT]-[OPTIONAL-SUFFIX]` (e.g., `300x250`, `300x250-rework`)
2. Modify `package.json` and add a new build task under `scripts`:
   - `"preview:[YOUR-FOLDER-NAME]": "tsc && vite build"`

## Configuring an Ad

1. Ad dimensions are inferred from the folder name of the ad and passed as variables to CSS and the template
2. Define your ad configuration inside YAML config files within each ad size folder

### Config File Structure

Config files can be placed in either location:
- Directly in the ad folder: `300x250/ad.config.yaml`
- In a `versions/` subfolder: `300x250/versions/ad.config.yaml` (recommended for cleaner organization)

Each ad size can have:
- `ad.config.yaml` - Base configuration for the main ad
- `[variant].config.yaml` - Separate config per variant (e.g., `v2.config.yaml`, `v3.config.yaml`)

**Variants are automatic!** Just create a config file like `v2.config.yaml` and the system will automatically create the variant. No separate HTML files needed - they're generated from `index.html`.

> **Note:** JSON files (`.json`) are also supported for backwards compatibility, but YAML is recommended for better readability and comment support.

### CSS Variables from Config

Any values under `css-variables` in your config are automatically injected as CSS custom properties:

```yaml
css-variables:
  primary-color: "#ff6600"
  headline-size: 24px
```

These become available in your CSS/SCSS as:
```css
.headline {
  color: var(--primary-color);
  font-size: var(--headline-size);
}
```

### Example: Base Config (`300x250/versions/ad.config.yaml`)

```yaml
# ================================
# Base Ad Configuration
# ================================
# Edit the values below for this ad size.
# This file uses YAML format - comments start with #

# ------ Copy / Headlines ------
headline: We Make Belief
cta: Learn More

# ------ CSS Variables ------
# These map directly to CSS custom properties
# The key becomes --key-name in CSS
css-variables:
  # Images (use relative paths from HTML file)
  photo-url: url(./src/img/photo-v1.jpg)
  
  # Typography
  general-headline-font-size: 37px
  
  # Colors
  white: "#ffffff"
  border-color: grey

# ------ Sprites ------
# Image sprite configuration (for combining multiple images)
sprites:
  - name: sprite
```

### Example: Variant Config (`300x250/versions/v2.config.yaml`)

```yaml
# ================================
# Version 2 Ad Configuration
# ================================
# Edit the values below for this ad size.
# This file uses YAML format - comments start with #

# ------ Copy / Headlines ------
headline: Version 2 Headline
cta: Learn More

# ------ CSS Variables ------
# These map directly to CSS custom properties
# The key becomes --key-name in CSS
css-variables:
  # Images (use relative paths from HTML file)
  photo-url: url(./src/img/photo-v2.jpg)
  
  # Typography
  general-headline-font-size: 10px
  
  # Colors
  white: "#ffffff"
  border-color: grey

# ------ Sprites ------
# Image sprite configuration (for combining multiple images)
sprites:
  - name: sprite
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

Templates can also be stored in the `templates` folder for sharing across multiple ad sizes if needed.

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
│       ├── main.ts
│       ├── img/
│       └── sass/
├── lib/                        # Shared library code
├── preview/                    # Built preview files
└── build/                      # Packaged zip files
```
