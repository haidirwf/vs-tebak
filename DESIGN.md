# Design System & Typography Guidelines: VS-Tebak

Guidelines for font loading, Tailwind CSS configuration, global CSS rules, and UI font usage rules in **VS-Tebak**.

---

## 1. Google Fonts Loading (`index.html`)

Fonts are loaded globally via `index.html`:

- **Inter** (Weights: 400, 500, 600, 700, 800): Used as the primary sans-serif & serif font for general UI.
- **JetBrains Mono** (Weights: 400, 500): Used as the monospace font for technical labels, code, badges, and numeric metrics/IDs.

```html
<!-- Google Fonts Import (/index.html) -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
```

---

## 2. Tailwind CSS Configuration (`tailwind.config.js`)

Font family aliases are mapped in `tailwind.config.js`:

```javascript
// tailwind.config.js
export default {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        serif: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
}
```

---

## 3. Global Base CSS Styling (`src/index.css`)

Base font rendering and font smoothing are configured in `src/index.css`:

- **Default Body**: Applied with `font-family: Inter` and `-webkit-font-smoothing: antialiased` for crisp text rendering.
- **Headings (`h1`, `h2`, `h3`, `.font-display`)**: Mapped consistently to Inter.

```css
/* src/index.css */
@layer base {
  body {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, .font-display {
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
}
```

---

## 4. UI Font Usage Principles

- **Sans-Serif (`font-sans`)**: Used for nearly all primary UI elements, headings, body text, buttons, and navigation.
- **Serif (`font-serif`)**: Mapped to Inter for visual consistency.
- **Monospace (`font-mono`)**: Dedicated to technical/eyebrow labels, code snippets, URL prefixes (e.g., `tautan.site/`), and status IDs/numbers.
