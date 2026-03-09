import { Route, Routes, Link, NavLink } from 'react-router-dom'
import { HomePage } from './pages/HomePage.tsx'
import { TreePage } from './pages/TreePage.tsx'
import { NodeDetailsPage } from './pages/NodeDetailsPage.tsx'
import { FtxTreeProvider } from './tree/TreeContext.tsx'
import { FtxUiProvider, useFtxUi } from './ui/UiContext.tsx'

function AppShell() {
  const { theme, lang, toggleLang, toggleTheme } = useFtxUi()
  const isDark = theme === 'dark'

  return (
    <FtxTreeProvider>
      <div
        className={[
          'flex min-h-screen flex-col',
          isDark ? 'bg-slate-900/90 text-slate-100' : 'bg-slate-50 text-slate-900',
        ].join(' ')}
      >
        <header
          className={[
            'sticky top-0 z-10 border-b px-4 py-3 backdrop-blur',
            isDark
              ? 'border-slate-700/60 bg-slate-900/80'
              : 'border-slate-200/80 bg-slate-50/90',
          ].join(' ')}
        >
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
            <Link
              to="/"
              className="text-sm font-semibold uppercase tracking-[0.18em]"
            >
              FileTree Explorer
            </Link>
            <nav className="flex items-center gap-2 text-sm">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  [
                    'rounded-full px-3 py-1 transition-colors',
                    isActive
                      ? 'bg-blue-600/20 text-blue-600'
                      : isDark
                        ? 'text-slate-300 hover:bg-slate-800'
                        : 'text-slate-700 hover:bg-slate-200',
                  ].join(' ')
                }
              >
                Home
              </NavLink>
              <button
                type="button"
                onClick={toggleLang}
                className={[
                  'inline-flex h-7 items-center justify-center rounded-full border px-2 text-[0.7rem] font-semibold uppercase tracking-wide',
                  isDark
                    ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800'
                    : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100',
                ].join(' ')}
              >
                {lang === 'pl' ? 'PL' : 'EN'}
              </button>
              <button
                type="button"
                onClick={toggleTheme}
                className={[
                  'inline-flex h-7 items-center justify-center rounded-full border px-2 text-[0.7rem] font-semibold',
                  isDark
                    ? 'border-slate-600 bg-slate-900 text-slate-100 hover:bg-slate-800'
                    : 'border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100',
                ].join(' ')}
                aria-label="Toggle color mode"
              >
                {isDark ? '☾' : '☼'}
              </button>
            </nav>
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-5xl flex-1 px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tree" element={<TreePage />} />
            <Route path="/tree/*" element={<NodeDetailsPage />} />
          </Routes>
        </main>
      </div>
    </FtxTreeProvider>
  )
}

function App() {
  return (
    <FtxUiProvider>
      <AppShell />
    </FtxUiProvider>
  )
}

export default App
