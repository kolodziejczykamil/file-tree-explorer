import { Navigate } from 'react-router-dom'
import { useFtxTree } from '../tree/TreeContext'
import { TreeView } from '../components/TreeView'
import { SearchPanel } from '../components/SearchPanel'
import { useFtxUi } from '../ui/UiContext'

export function TreePage() {
  const { root } = useFtxTree()
  const { theme, t } = useFtxUi()

  if (!root) {
    return <Navigate to="/" replace />
  }

  return (
    <div
      className={[
        'w-full rounded-2xl border p-6 shadow-xl transition-colors',
        theme === 'dark'
          ? 'border-slate-700/70 bg-slate-900/80 shadow-slate-950/60'
          : 'border-slate-200 bg-white shadow-slate-200/80',
      ].join(' ')}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{t('tree.title')}</h1>
          <p className="text-sm text-slate-400">{t('tree.subtitle')}</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <TreeView root={root} />
        <div
          className={[
            'rounded-xl border p-3 transition-colors',
            theme === 'dark' ? 'border-slate-700 bg-slate-900/90' : 'border-slate-200 bg-white',
          ].join(' ')}
        >
          <SearchPanel />
        </div>
      </div>
    </div>
  )
}

