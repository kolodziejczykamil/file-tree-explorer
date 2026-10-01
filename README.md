## FileTree Explorer

A React and TypeScript app that visualizes a directory structure provided as JSON. You paste or upload a JSON file, and the app shows the tree, a search panel and details of files and folders.

**Live demo:** https://file-tree-explorer-omega.vercel.app

### Stack

- **Vite + React 18+ + TypeScript (strict)**: bundling and typing.
- **React Router v6**: views `/`, `/tree`, `/tree/*` (splat route for nested paths).
- **Tailwind CSS v4**: styling (PostCSS: `@tailwindcss/postcss`).
- **Prettier**: code formatting (`.prettierrc`, `npm run format` script).

### Getting started

```bash
npm install
npm run dev
```

The app runs at e.g. `http://localhost:5173`.

---

### Architecture

#### Routing and views

| Path           | View              | Description |
|----------------|-------------------|-------------|
| `/`            | `HomePage`        | Paste or upload JSON, sample structures (cards with a JSON preview), PL/EN and dark/light toggles. |
| `/tree`        | `TreePage`        | File tree and search panel. Redirects to `/` when no tree is loaded. |
| `/tree/*`      | `NodeDetailsPage` | Node details (file or folder). Path taken from the URL: `params['*']` (React Router v6 splat), e.g. `src/components/Button.tsx`. |

The header has only a **Home** link; the tree becomes available after loading JSON on the home page.

#### Global state and persistence

- **TreeProvider** (`tree/TreeContext.tsx`): `root`, `setRoot`, `searchTerm`, `setSearchTerm`, `formatSize`, `findNodeByPath`, `computeFolderSize`, `computeFolderFileCount`. The tree and the search query are saved in `localStorage` (`filetree-explorer:tree`, `filetree-explorer:searchTerm`), so they survive a refresh.
- **UiProvider** (`ui/UiContext.tsx`): `theme` (dark/light), `lang` (pl/en), `toggleTheme`, `toggleLang`, `t(key)` for translations. Theme and language choices are also kept in `localStorage`.

#### Home page (HomePage)

- JSON textarea and file upload; validation (`normalizeRoot`, `validateNode`): the root must be a folder and files must have a `size`.
- **Sample structures** section: cards with a title and a preview of the first lines of JSON; clicking a card loads that sample and navigates to `/tree`.
- All copy and styles depend on `theme` and `lang` (i18n).

#### Tree and search

- **TreeView**: expanding and collapsing folders, links to `/tree/<path-without-root>` (e.g. `/tree/src/components/Button.tsx`). Styles depend on `theme`.
- **SearchPanel**: case-insensitive search by name across the whole tree, results with the full path; links to `/tree/<full-path>`. Copy and backgrounds adapt to dark/light.

#### Node details (NodeDetailsPage)

- The path comes from the URL: `params['*']` (React Router v6 splat), split into segments and passed to `findNodeByPath(segments)`.
- **findNodeByPath** (`TreeContext`): removes empty segments, optionally skips the first segment if it equals the root name, walks down the tree and returns `{ node, fullPath }`.
- **File**: name, size (B / KB / MB / GB via `formatSize`), type, full path.
- **Folder**: name, number of direct children, **total size of files in the subtree** (recursive sum), **number of files in the subtree**, full path and a list of children with links. Folder size is computed by a local `summarizeFolder(folder)` function (iterative DFS over files) rather than the context, to avoid recalculation issues.

#### Styling and themes

- **Tailwind**: `index.css` with `@import 'tailwindcss'`; utility classes in components. `data-theme="dark"|"light"` on `document.documentElement` (set in `UiProvider`).
- All cards, buttons, inputs, the tree, search and node details have class variants for `theme === 'dark'` and `theme === 'light'`, so text and backgrounds stay readable in both modes.

#### Configuration files

- `tailwind.config.ts`, `postcss.config.cjs` (Tailwind + autoprefixer).
- `.prettierrc`, `.prettierignore`, `format` script in `package.json`.
- `vercel.json`: build and output directory for Vercel.

---

### What I would do with more time

- JSON validation (e.g. with Zod) with readable errors.
- Icons for file and folder types, expand animations, highlighting the current node in the tree.
- Search filters (files or folders only, size).
- Unit tests (validation, `findNodeByPath`, `formatSize`, `summarizeFolder`) and e2e tests (Playwright/Cypress).
- Memoization and lazy loading for very large trees.

### Known limitations

- Node names should be unique within a folder (duplicates make paths ambiguous).
- No limit on JSON size; very large trees can slow down the browser.
- Persistence only in `localStorage` of the same browser.
