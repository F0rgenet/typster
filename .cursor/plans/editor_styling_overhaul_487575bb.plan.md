---
name: Editor styling overhaul
overview: Improve CodeMirror editor appearance with proper theming, container styling, theme-aware syntax highlighting, and better visual design to match the DaisyUI theme.
todos:
  - id: create-monokai-theme
    content: Create custom Monokai theme in editor.js using EditorView.theme API with classic Monokai colors
    status: pending
  - id: create-theme-config
    content: Add Monokai theme extension to editor configuration with proper styling
    status: pending
  - id: update-syntax-colors
    content: Replace hardcoded colors in typst_syntax.js with theme-aware colors
    status: pending
  - id: fix-container-styling
    content: Add proper height/width classes to editor container in index.html.heex
    status: pending
  - id: add-custom-css
    content: Add custom CSS for CodeMirror editor styling in app.css
    status: pending
---

# Editor Styling Overhaul

## Problem

The CodeMirror editor has multiple critical issues:

1. **Literal `\n` rendering bug** - Newlines are displayed as literal `\n` characters instead of actual line breaks
2. **No theme configuration** - Editor uses default styling that doesn't match DaisyUI theme
3. **Hardcoded syntax colors** - Colors don't adapt to light/dark mode
4. **Poor container styling** - Editor lacks proper height/width constraints and styling
5. **Minimal visual polish** - Editor looks plain and unstyled

## Solution

1. **Fix literal `\n` bug** - Ensure content is properly parsed when reading from data attributes (HTML data attributes preserve `\n` as literal characters)
2. **Create Monokai theme** - Implement custom Monokai color scheme using CodeMirror 6's `EditorView.theme` API with classic Monokai colors
3. **Create theme-aware editor configuration** - Add Monokai theme extension with proper editor styling
4. **Fix editor container styling** - Ensure proper height/width and overflow handling
5. **Update syntax highlighting** - Make colors theme-aware instead of hardcoded
6. **Add proper fonts and editor styling** - Configure monospace font, line height, and spacing

## Implementation Details

### Files to Modify

1. **[assets/package.json](assets/package.json)**

- No additional theme package needed - will create custom Monokai theme using CodeMirror 6's `EditorView.theme` API

2. **[assets/js/hooks.js](assets/js/hooks.js)**

- Fix content parsing to handle newlines properly when reading from `data-content` attribute
- Ensure `\n` characters are converted to actual newlines

3. **[assets/js/editor.js](assets/js/editor.js)**

- Create custom Monokai theme using `EditorView.theme` with classic Monokai colors:
- Background: #272822 (dark gray-green)
- Foreground: #f8f8f2 (light beige)
- Comments: #75715e (muted brown)
- Keywords: #f92672 (pink)
- Strings: #e6db74 (yellow)
- Numbers: #ae81ff (purple)
- Functions: #a6e22e (green)
- Add proper editor styling extensions (font, line height, padding)
- Configure editor to fill container properly

4. **[assets/js/typst_syntax.js](assets/js/typst_syntax.js)**

- Update syntax highlighting colors to match Monokai theme palette
- Use Monokai color scheme for consistent theming:
- Headings: #f92672 (pink) for h1, #a6e22e (green) for h2, #66d9ef (cyan) for h3
- Keywords: #f92672 (pink)
- Strings: #e6db74 (yellow)
- Comments: #75715e (muted brown)
- Functions: #a6e22e (green)
- Numbers: #ae81ff (purple)

5. **[lib/typster_web/live/editor_live/index.html.heex](lib/typster_web/live/editor_live/index.html.heex)**

- Add proper height/width classes to editor container
- Ensure container has proper overflow handling
- Consider using a different method to pass content (e.g., JSON encoding or hidden element)

6. **[assets/css/app.css](assets/css/app.css)**

- Add custom CSS for CodeMirror editor styling
- Ensure editor integrates well with DaisyUI theme

## Technical Approach

### Fixing the `\n` Bug

- HTML data attributes preserve newlines as literal `\n` characters
- When reading `dataset.content`, need to ensure proper string handling
- Option 1: Use `JSON.parse()` if content is JSON-encoded
- Option 2: Replace literal `\n` with actual newlines when reading from dataset
- Option 3: Use a hidden `<script type="application/json">` element for complex content

### Theming

- Use CodeMirror 6's `EditorView.theme` API to create custom Monokai theme
- Classic Monokai color palette for consistent, vibrant syntax highlighting
- Theme will include:
- Editor background and foreground colors
- Selection colors
- Cursor colors
- Line number styling
- Gutter colors
- Active line highlighting
