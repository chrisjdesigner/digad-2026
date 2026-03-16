# Image Packaging Guide

This document explains how the build system discovers and packages all images used in your ads.

## How Images Are Discovered

The packaging system uses multiple strategies to ensure **all images are included**, even if they're referenced in different ways:

### 1. **Config-Based Images (Primary Method)**

Images should be declared in the ad config YAML under `css-variables.images`:

```yaml
# 300x250/versions/ad.config.yaml
headline: We Make Awesome
cta: Learn More
css-variables:
  colors:
    white: "#fff"
  images:
    photo-url: url(./src/img/photo-v1.jpg)
    secondary-image: url(./src/img/photo-v2.jpg)
```

The package script extracts these image URLs and ensures they're copied to the build output.

### 2. **Sprite Sheets**

Sprites are defined separately in the config:

```yaml
sprites:
  - name: sprite
```

All sprites are automatically included in the package.

### 3. **Hardcoded Image References (Auto-Discovery)**

Any images referenced directly in HTML or CSS are automatically discovered by scanning the generated HTML file:

- **CSS `url()` references**: `background-image: url(./sprite.png)`
- **`src=` attributes**: `<img src="./photo.jpg">`  
- **Inline styles**: `style="background: url(./img.jpg)"`

All discovered images are automatically added to the package.

### 4. **Alternative: Top-Level Images Key**

For explicit control, you can also list images at the top level of your config:

```yaml
# 300x250/versions/ad.config.yaml
headline: We Make Awesome
images:
  photo-url: url(./src/img/photo-v1.jpg)
  logo-url: ./src/img/logo.png
```

## File Format Support

The following image formats are supported and will be packaged:
- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.svg`
- `.webp`

## What Gets Excluded

The following URLs/images are **NOT** packaged (as expected):

- **Absolute URLs**: `https://example.com/image.jpg`
- **Data URIs**: `data:image/png;base64,...`
- **Development assets**: SVGs in `lib/dev-mode/` (dev toolbar only)

## Verification

When you run `npm run package`, the script will:

1. ✅ Copy all sprites and version files
2. ✅ Extract images from config (both `css-variables.images` and top-level `images`)
3. ✅ Scan the generated HTML for any additional image references
4. ✅ Automatically include all discovered images in the zip package
5. ✅ Report any included static screenshots

Example output:
```
✓ built in 889ms
../preview/300x250/sprite.png     5.69 kB
../preview/300x250/photo-v1.jpg  40.58 kB
../preview/300x250/photo-v2.jpg  44.17 kB
```

## Best Practices

1. **Always declare images in config** under `css-variables.images` if they're used as CSS variables
2. **Keep images in `src/img/`** folder within your ad size directory
3. **Use relative paths** starting with `./` for local images
4. **Don't rely solely on hardcoding** - declare in config for clarity and maintainability
5. **Test locally** with `npm run dev` to verify images load correctly before packaging

## Troubleshooting

### Image not in final package

1. Check that the image file exists in `src/img/`
2. Ensure it's referenced either in config or HTML
3. Verify the path format: `./src/img/filename.ext` or `url(./src/img/filename.ext)`
4. Run `npm run package` again to regenerate

### Unintended images included

The auto-discovery might include images referenced in CSS or HTML. Use config references when you want explicit control.

### File format issue

Check that image extensions are lowercase and match one of the supported formats.
