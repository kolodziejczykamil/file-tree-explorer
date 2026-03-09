## FileTree Explorer

Aplikacja React/TypeScript do wizualizacji struktury katalogów dostarczonej jako JSON. Użytkownik wkleja lub wgrywa plik JSON, a aplikacja pokazuje drzewo, wyszukiwanie oraz szczegóły plików i folderów.

### Stack

- **Vite + React 18+ + TypeScript (strict)** - bundler i typowanie.
- **React Router v6** - widoki: `/`, `/tree`, `/tree/*` (splat dla zagnieżdżonych ścieżek).
- **Tailwind CSS v4** - stylowanie (PostCSS: `@tailwindcss/postcss`).
- **Prettier** - formatowanie kodu (`.prettierrc`, skrypt `npm run format`).

### Uruchomienie

```bash
npm install
npm run dev
```

Aplikacja: np. `http://localhost:5173`.

---

### Architektura

#### Routing i widoki

| Ścieżka        | Widok            | Opis |
|----------------|------------------|------|
| `/`            | `HomePage`       | Wklejanie/wgrywanie JSON, przykładowe struktury (boksy z podglądem JSON), przyciski PL/EN i dark/light. |
| `/tree`        | `TreePage`       | Drzewo plików + panel wyszukiwania. Przy braku załadowanego drzewa → przekierowanie na `/`. |
| `/tree/*`      | `NodeDetailsPage`| Szczegóły węzła (plik lub folder). Ścieżka z URL: `params['*']` (splat RR v6), np. `src/components/Button.tsx`. |

W nagłówku jest tylko link **Home**; dostęp do drzewa następuje po załadowaniu JSON na stronie głównej.

#### Stan globalny i persistencja

- **TreeProvider** (`tree/TreeContext.tsx`): `root`, `setRoot`, `searchTerm`, `setSearchTerm`, `formatSize`, `findNodeByPath`, `computeFolderSize`, `computeFolderFileCount`. Drzewo i zapytanie wyszukiwania są zapisywane w `localStorage` (`filetree-explorer:tree`, `filetree-explorer:searchTerm`), więc przetrwają odświeżenie.
- **UiProvider** (`ui/UiContext.tsx`): `theme` (dark/light), `lang` (pl/en), `toggleTheme`, `toggleLang`, `t(key)` - tłumaczenia. Wybór motywu i języka też w `localStorage`.

#### Strona główna (HomePage)

- Textarea na JSON + wgranie pliku; walidacja (`normalizeRoot`, `validateNode`) - root musi być folderem, pliki muszą mieć `size`.
- Sekcja **Przykładowe struktury**: boksy z tytułem i podglądem fragmentu JSON (pierwsze linie); klik w boks ładuje dany przykład i przenosi na `/tree`.
- Wszystkie teksty i style zależne od `theme` i `lang` (i18n).

#### Drzewo i wyszukiwanie

- **TreeView**: rozwijanie/zwijanie folderów, linki do `/tree/<ścieżka-bez-roota>` (np. `/tree/src/components/Button.tsx`). Style zależne od `theme`.
- **SearchPanel**: wyszukiwanie po nazwie w całym drzewie (case-insensitive), wyniki z pełną ścieżką; linki do `/tree/<pełna-ścieżka>`. Teksty i tła dopasowane do dark/light.

#### Szczegóły węzła (NodeDetailsPage)

- Ścieżka z URL: `params['*']` (React Router v6 splat), dzielona na segmenty i przekazywana do `findNodeByPath(segments)`.
- **findNodeByPath** (`TreeContext`): czyści puste segmenty, opcjonalnie pomija pierwszy segment jeśli równy nazwie roota; schodzi po drzewie i zwraca `{ node, fullPath }`.
- **Plik**: nazwa, rozmiar (B / KB / MB / GB przez `formatSize`), typ, pełna ścieżka.
- **Folder**: nazwa, liczba bezpośrednich dzieci, **całkowity rozmiar plików w poddrzewie** (suma rekurencyjna), **liczba plików w poddrzewie**, pełna ścieżka, lista dzieci z linkami. Rozmiar folderu liczy lokalna funkcja `summarizeFolder(folder)` (iteracyjny DFS po plikach), nie kontekst - aby uniknąć problemów z przeliczaniem.

#### Stylowanie i motywy

- **Tailwind**: `index.css` z `@import 'tailwindcss'`; klasy utility w komponentach. `data-theme="dark"|"light"` na `document.documentElement` (ustawiane w `UiProvider`).
- Wszystkie karty, przyciski, inputy, drzewo, wyszukiwarka i szczegóły węzła mają warianty klas dla `theme === 'dark'` i `theme === 'light'`, żeby teksty i tła były czytelne w obu trybach.

#### Pliki konfiguracyjne

- `tailwind.config.ts`, `postcss.config.cjs` (Tailwind + autoprefixer).
- `.prettierrc`, `.prettierignore`, skrypt `format` w `package.json`.
- `vercel.json` - build i katalog wyjściowy pod Vercel.

---

### Co zrobiłbym przy większej ilości czasu

- Walidacja JSON (np. zod) z czytelnymi błędami.
- Ikony dla typów plików/folderów, animacje rozwijania, podświetlanie bieżącego węzła w drzewie.
- Filtry w wyszukiwarce (tylko pliki/foldery, rozmiar).
- Testy jednostkowe (walidacja, `findNodeByPath`, `formatSize`, `summarizeFolder`) i e2e (Playwright/Cypress).
- Memoizacja / lazy-loading dla bardzo dużych drzew.

### Znane ograniczenia

- Nazwy węzłów powinny być unikalne w ramach jednego folderu (duplikaty utrudniają jednoznaczną ścieżkę).
- Brak limitu rozmiaru JSON - bardzo duże drzewa mogą spowalniać przeglądarkę.
- Persistance tylko w `localStorage` tej samej przeglądarki.
