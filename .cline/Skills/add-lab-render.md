# Add Lab Render

## Purpose

This skill handles adding a new render/image to the Playful Ground Lab page safely and consistently.

The goal is to make adding a render require minimal manual work while preserving the existing Lab architecture, thumbnail optimization, lightbox behavior, animations, and performance.

---

## Project Context

This project is a React/Vite website recreating Playful Ground.

Relevant files:

* `src/pages/LabPage.jsx`
* `public/`
* `public/thumbs/`
* `scripts/generate-thumbs.mjs`
* `package.json`

The Lab projects are currently defined in a `projects` array inside:

`src/pages/LabPage.jsx`

Each project generally follows this structure:

```js
{
  id: 48,
  title: 'My New Render',
  image: '/MyNewRender.png'
}
```

The Lab uses:

* Original images in `public/` for the full-resolution lightbox.
* WebP thumbnails in `public/thumbs/` for the Lab cards.
* `thumbUrl(project.image)` to derive the thumbnail path.
* Framer Motion for card animations.
* Lazy loading and async image decoding for thumbnails.

The thumbnail generator is already automated.

Run it with:

```bash
npm run thumbnails
```

The generator:

* Reads the images referenced by the Lab `projects` array.
* Automatically detects new project images.
* Creates 512×512 WebP thumbnails.
* Uses centered cropping.
* Uses WebP quality 78.
* Preserves alpha where necessary.
* Stores thumbnails in `public/thumbs/`.
* Skips thumbnails that are already up to date.
* Never modifies the original render.

---

# When To Use This Skill

Use this skill when the user asks to:

* Add a render to the Lab.
* Add an image/project to the Lab.
* Put a new render on the Lab page.
* Add a new project using an image in `public/`.
* Add a render and generate its thumbnail.
* Similar requests involving adding a new Lab image.

Examples:

> Add `MyRender.png` to the Lab.

> Add this render to the Lab with the title "Cyberpunk City".

> Put `NewRender.png` into the Lab.

---

# Required Workflow

## 1. Identify the render

Determine which image the user wants to add.

Normally the image should already exist somewhere in `public/`.

Look for the exact filename supplied by the user.

Do not guess a filename.

If the user has not specified which render to add and multiple possible images exist, ask which one they want.

---

## 2. Inspect the existing implementation

Before modifying anything, inspect:

* `src/pages/LabPage.jsx`
* `scripts/generate-thumbs.mjs`
* `package.json`

Do not assume the current implementation is unchanged.

Confirm:

* How the `projects` array is structured.
* The latest project ID.
* How thumbnails are referenced.
* How the lightbox references the original image.
* That `npm run thumbnails` exists.
* That the thumbnail generator is still compatible.

Do not redesign or refactor the system.

---

## 3. Verify the original image

Confirm that the requested image exists in `public/`.

For example:

```text
public/MyRender.png
```

If it does not exist:

* Do not create a fake entry.
* Do not invent an image.
* Tell the user that the source image could not be found.
* Ask them to place the image in `public/` or provide the correct filename.

Never overwrite an existing image unless the user explicitly asks to replace it.

---

## 4. Determine the project title

Use the title supplied by the user.

If the user does not provide a title, use the image filename without its extension as the title.

Example:

```text
MyRender.png
```

becomes:

```js
title: 'MyRender'
```

Do not invent elaborate titles.

---

## 5. Determine the next project ID

Inspect the existing `projects` array.

Use the next available numeric ID.

For example, if the highest current ID is:

```js
id: 47
```

use:

```js
id: 48
```

Do not renumber existing projects.

Do not modify existing project IDs.

If IDs are no longer sequential, find a genuinely unused ID rather than blindly using `highest + 1`.

---

## 6. Add the project entry

Add the new project to the existing `projects` array.

Use the existing formatting/style.

Example:

```js
{
  id: 48,
  title: 'My New Render',
  image: '/MyNewRender.png'
}
```

If existing entries have additional fields, inspect them and preserve the established structure.

Do not change unrelated projects.

Do not reorganize the entire array.

Do not refactor `LabPage.jsx`.

---

# 7. Generate the thumbnail

After adding the project entry, run:

```bash
npm run thumbnails
```

The thumbnail generator should automatically discover the new image from the `projects` array.

Verify that the corresponding thumbnail exists:

```text
public/thumbs/MyNewRender.webp
```

Do not manually create the WebP if the generator can create it.

Do not edit the generated WebP manually.

---

# 8. Verify thumbnail behavior

Confirm that:

* The original image remains in `public/`.
* The thumbnail exists in `public/thumbs/`.
* The thumbnail uses the expected `.webp` extension.
* The Lab code will resolve the thumbnail through the existing `thumbUrl()` system.
* The lightbox continues to use the original full-resolution image.

The original image must remain untouched.

The intended architecture is:

```text
public/
  MyNewRender.png

public/thumbs/
  MyNewRender.webp
```

The Lab card uses:

```text
/thumbs/MyNewRender.webp
```

The lightbox uses:

```text
/MyNewRender.png
```

Do not change this architecture.

---

# 9. Run the build

Run the project's existing build command.

Normally:

```bash
npm run build
```

If the project uses a different established build command, inspect `package.json` and use that instead.

If the build fails:

* Investigate the failure.
* Fix only problems caused by this change.
* Do not perform unrelated refactors.
* Run the build again.

---

# 10. Final verification

Before finishing, verify:

### Source

* [ ] Original render exists.
* [ ] Original render was not modified.
* [ ] Correct project entry was added.
* [ ] Correct project ID was used.
* [ ] Correct title was used.
* [ ] Correct image path was used.

### Thumbnail

* [ ] `npm run thumbnails` completed successfully.
* [ ] New WebP thumbnail exists.
* [ ] Existing thumbnails were not unnecessarily regenerated.
* [ ] Original image remains intact.

### Application

* [ ] Build passes.
* [ ] No unrelated files were changed.
* [ ] Existing Lab behavior remains intact.
* [ ] Lightbox still points to the original image.

---

# Important Safety Rules

## Never modify original renders

Never resize, compress, convert, overwrite, or otherwise modify the original image in `public/`.

The original is intentionally kept for the full-resolution lightbox.

---

## Never manually replace the thumbnail system

Do not add individual hardcoded thumbnail paths such as:

```js
image: '/thumbs/MyRender.webp'
```

The project data should continue to reference the original:

```js
image: '/MyRender.png'
```

The existing `thumbUrl()` system should handle the thumbnail automatically.

---

## Never change unrelated projects

Do not:

* Rename existing projects.
* Change existing IDs.
* Change existing titles.
* Change existing image paths.
* Regenerate unrelated thumbnails unnecessarily.
* Reformat the entire `projects` array.
* Refactor LabPage.jsx.

Only make the smallest changes required.

---

## Never change the visual system

Adding a render should not change:

* Card styling.
* Card dimensions.
* Grid/carousel behavior.
* Framer Motion animations.
* Hover effects.
* Lightbox behavior.
* WebGL background.
* Page layout.
* Navigation.

This skill is for adding content, not redesigning the Lab.

---

## Never install unnecessary dependencies

Do not install additional packages.

The existing thumbnail generator uses the project's existing tooling.

If `sharp` or another required dependency is unexpectedly missing, inspect `package.json` first and report the issue rather than blindly installing packages.

---

# Handling Existing Images

If the user explicitly wants to replace an existing render:

1. Confirm the requested replacement image.
2. Preserve the existing project entry if possible.
3. Replace the original only if the user explicitly requested replacement.
4. Run:

```bash
npm run thumbnails
```

5. Verify that the thumbnail was regenerated because the source changed.
6. Run the build.

Never replace an image merely because the filenames are similar.

---

# Handling Duplicate Images

If the requested image is already referenced by a Lab project:

Do not automatically create a duplicate project.

Tell the user that the image is already present and identify the existing project.

Only create another project if the user explicitly wants the same image displayed as a separate project.

---

# Handling Removed Projects

If the user asks to remove a project:

Do not automatically delete its thumbnail unless explicitly requested.

The current thumbnail system intentionally avoids destructive cleanup.

Only remove an orphaned thumbnail when the user explicitly asks for cleanup.

---

# Preferred Command Sequence

For a normal new render, the expected workflow is:

```text
1. Inspect LabPage.jsx
2. Inspect thumbnail generator/package.json
3. Verify source image
4. Add project entry
5. Run npm run thumbnails
6. Verify new thumbnail
7. Run npm run build
8. Report results
```

---

# Final Response Format

After successfully completing the task, give a concise report containing:

```text
Added: <title>
Source: public/<filename>
Thumbnail: public/thumbs/<filename>.webp
Project ID: <id>

Thumbnail generation: successful
Build: successful

Files changed:
- src/pages/LabPage.jsx
- public/thumbs/<filename>.webp
```

Only list files that were actually changed.

If the build fails, clearly state:

```text
Build: FAILED
```

and provide the relevant error.

Do not claim success unless the commands actually succeeded.

---

# Principle

The core principle of this skill is:

**Adding a Lab render should be a small, predictable content change — never an architectural change.**

Preserve the existing system, automate the repetitive thumbnail work, protect the original render, and verify the build before finishing.
