import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

type Language = 'pl' | 'en'
type Theme = 'dark' | 'light'

interface UiContextValue {
  lang: Language
  theme: Theme
  toggleLang: () => void
  toggleTheme: () => void
  t: (key: string) => string
}

const UiContext = createContext<UiContextValue | undefined>(undefined)

const LANG_STORAGE_KEY = 'filetree-explorer:lang'
const THEME_STORAGE_KEY = 'filetree-explorer:theme'

const translations: Record<Language, Record<string, string>> = {
  pl: {
    'nav.home': 'Home',
    'nav.theme.dark': 'Ciemny',
    'nav.theme.light': 'Jasny',
    'home.title': 'FileTree Explorer',
    'home.subtitle':
      'Wklej lub wgraj strukturę katalogów w formacie JSON albo skorzystaj z jednego z przygotowanych przykładów.',
    'home.jsonLabel': 'Struktura drzewa (JSON)',
    'home.loadFromText': 'Załaduj z tekstu',
    'home.uploadJsonFile': 'Wgraj plik JSON',
    'home.uploadHint': 'Plik nie jest nigdzie wysyłany – analiza lokalna w przeglądarce.',
    'home.examplesTitle': 'Przykładowe struktury',
    'home.formatHint':
      'Oczekiwany format jak w treści zadania – węzły typu file z polem size oraz folder z listą children.',

    'tree.title': 'Drzewo plików',
    'tree.subtitle': 'Nawigacja po strukturze katalogów i plików.',

    'details.missingRoot.title': 'Szczegóły węzła',
    'details.missingRoot.subtitle': 'Najpierw załaduj strukturę z ekranu głównego.',
    'details.missingRoot.body':
      'Brak załadowanego drzewa. Przejdź do zakładki Home, aby je wczytać.',

    'details.notFound.title': 'Węzeł nie znaleziony',
    'details.notFound.body.prefix': 'Ścieżka',
    'details.notFound.body.suffix': 'nie istnieje w aktualnym drzewie.',

    'details.file.title': 'Szczegóły pliku',
    'details.folder.title': 'Szczegóły folderu',

    'details.label.name': 'Nazwa',
    'details.label.size': 'Rozmiar',
    'details.label.type': 'Typ',
    'details.label.fullPath': 'Pełna ścieżka',
    'details.label.directChildren': 'Liczba bezpośrednich dzieci',
    'details.label.subtreeSize': 'Całkowity rozmiar (poddrzewo)',
    'details.label.subtreeFiles': 'Liczba plików w poddrzewie',
    'details.label.children': 'Dzieci',
    'details.label.folderEmpty': 'Folder jest pusty.',

    'details.value.file': 'Plik',
    'details.value.folder': 'Folder',
    'details.backToTree': 'Powrót do drzewa',

    'search.label': 'Wyszukiwanie po nazwie',
    'search.resultsLabel': 'wyników',
    'search.placeholder': 'np. Button.tsx',
    'search.empty.noTree': 'Najpierw załaduj strukturę drzewa.',
    'search.empty.noQuery': 'Podaj nazwę pliku lub folderu, aby wyszukać.',
    'search.empty.noResults': 'Brak wyników dla podanego zapytania.',

    'common.file': 'plik',
    'common.folder': 'folder',
  },
  en: {
    'nav.home': 'Home',
    'nav.theme.dark': 'Dark',
    'nav.theme.light': 'Light',
    'home.title': 'FileTree Explorer',
    'home.subtitle':
      'Paste or upload a folder structure as JSON, or start from one of the prepared examples.',
    'home.jsonLabel': 'Tree structure (JSON)',
    'home.loadFromText': 'Load from text',
    'home.uploadJsonFile': 'Upload JSON file',
    'home.uploadHint': 'File stays in the browser – analysed locally only.',
    'home.examplesTitle': 'Example structures',
    'home.formatHint':
      'Expected format as in the task description – file nodes with size and folder nodes with children.',

    'tree.title': 'File tree',
    'tree.subtitle': 'Navigate through folders and files.',

    'details.missingRoot.title': 'Node details',
    'details.missingRoot.subtitle': 'Load a tree structure on the home screen first.',
    'details.missingRoot.body':
      'There is no loaded tree. Go to the Home tab to load one.',

    'details.notFound.title': 'Node not found',
    'details.notFound.body.prefix': 'Path',
    'details.notFound.body.suffix': 'does not exist in the current tree.',

    'details.file.title': 'File details',
    'details.folder.title': 'Folder details',

    'details.label.name': 'Name',
    'details.label.size': 'Size',
    'details.label.type': 'Type',
    'details.label.fullPath': 'Full path',
    'details.label.directChildren': 'Number of direct children',
    'details.label.subtreeSize': 'Total size (subtree)',
    'details.label.subtreeFiles': 'Number of files in subtree',
    'details.label.children': 'Children',
    'details.label.folderEmpty': 'Folder is empty.',

    'details.value.file': 'File',
    'details.value.folder': 'Folder',
    'details.backToTree': 'Back to tree',

    'search.label': 'Search by name',
    'search.resultsLabel': 'results',
    'search.placeholder': 'e.g. Button.tsx',
    'search.empty.noTree': 'Load a tree structure first.',
    'search.empty.noQuery': 'Enter a file or folder name to search.',
    'search.empty.noResults': 'No results for this query.',

    'common.file': 'file',
    'common.folder': 'folder',
  },
}

export function FtxUiProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem(LANG_STORAGE_KEY)) || ''
    return stored === 'en' || stored === 'pl' ? stored : 'pl'
  })

  const [theme, setTheme] = useState<Theme>(() => {
    const stored =
      (typeof window !== 'undefined' && localStorage.getItem(THEME_STORAGE_KEY)) || ''
    if (stored === 'dark' || stored === 'light') return stored
    if (typeof window !== 'undefined') {
      return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'dark'
  })

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem(LANG_STORAGE_KEY, lang)
  }, [lang])

  const toggleLang = () => {
    setLang((prev) => (prev === 'pl' ? 'en' : 'pl'))
  }

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  const t = (key: string) => {
    const dict = translations[lang]
    return dict[key] ?? key
  }

  const value = useMemo<UiContextValue>(
    () => ({
      lang,
      theme,
      toggleLang,
      toggleTheme,
      t,
    }),
    [lang, theme],
  )

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>
}

export function useFtxUi() {
  const ctx = useContext(UiContext)
  if (!ctx) {
    throw new Error('useFtxUi must be used within FtxUiProvider')
  }
  return ctx
}

