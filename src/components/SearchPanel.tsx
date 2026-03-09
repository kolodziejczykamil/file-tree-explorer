import { type ChangeEvent, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useFtxTree } from '../tree/TreeContext'
import { useFtxUi } from '../ui/UiContext'
import type { TreeNode } from '../tree/types'

interface SearchResult {
  name: string
  fullPath: string
  isFolder: boolean
}

export function SearchPanel() {
  const { root, searchTerm, setSearchTerm } = useFtxTree()
  const { theme, t } = useFtxUi()

  const results = useMemo<SearchResult[]>(() => {
    if (!root || !searchTerm.trim()) return []
    const term = searchTerm.trim().toLowerCase()
    const acc: SearchResult[] = []

    const walk = (node: TreeNode, path: string[]) => {
      const currentPath = [...path, node.name]
      if (node.name.toLowerCase().includes(term)) {
        const fullPath = currentPath.slice(1).join('/')
        acc.push({
          name: node.name,
          fullPath,
          isFolder: node.type === 'folder',
        })
      }
      if (node.type === 'folder') {
        node.children.forEach((child) => walk(child, currentPath))
      }
    }

    walk(root, [])
    return acc
  }, [root, searchTerm])

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <label className="text-sm font-medium" htmlFor="search-input">
          {t('search.label')}
        </label>
        <span
          className={[
            'inline-flex items-center justify-center rounded-full px-2 py-[2px] text-[0.65rem] whitespace-nowrap',
            theme === 'dark' ? 'bg-slate-700 text-slate-100' : 'bg-slate-200 text-slate-800',
          ].join(' ')}
        >
          {results.length} {t('search.resultsLabel')}
        </span>
      </div>
      <input
        id="search-input"
        className={[
          'w-full rounded-full border px-3 py-1.5 text-xs outline-none ring-0 transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
          theme === 'dark'
            ? 'border-slate-600 bg-slate-900 text-slate-100'
            : 'border-slate-300 bg-white text-slate-900',
        ].join(' ')}
        type="search"
        value={searchTerm}
        onChange={handleChange}
        placeholder={t('search.placeholder')}
      />

      <div
        className={[
          'mt-2 max-h-64 overflow-auto rounded-xl border p-2 text-xs',
          theme === 'dark'
            ? 'border-slate-700 bg-slate-900/90'
            : 'border-slate-200 bg-white',
        ].join(' ')}
      >
        {!root && (
          <div className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            {t('search.empty.noTree')}
          </div>
        )}
        {root && !searchTerm.trim() && (
          <div className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            {t('search.empty.noQuery')}
          </div>
        )}
        {root && searchTerm.trim() && results.length === 0 && (
          <div className={theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}>
            {t('search.empty.noResults')}
          </div>
        )}
        {results.length > 0 && (
          <ul className="mt-1 flex flex-col gap-1">
            {results.map((r) => (
              <li
                key={r.fullPath}
                className={[
                  'rounded-md px-2 py-1',
                  theme === 'dark'
                    ? 'hover:bg-blue-900/40 hover:text-blue-100'
                    : 'hover:bg-blue-50 hover:text-blue-700',
                ].join(' ')}
              >
                <Link to={`/tree/${r.fullPath}`}>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center rounded-full border border-slate-500 px-1.5 text-[0.65rem] font-medium">
                      {r.isFolder ? t('common.folder') : t('common.file')}
                    </span>
                    <span className="text-xs font-semibold">{r.name}</span>
                  </div>
                  <div
                    className={[
                      'font-mono text-[0.67rem]',
                      theme === 'dark' ? 'text-slate-400' : 'text-slate-600',
                    ].join(' ')}
                  >
                    {r.fullPath}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

