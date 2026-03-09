import { useState, Fragment, type JSX } from 'react'
import { Link } from 'react-router-dom'
import type { FolderNode, TreeNode } from '../tree/types'
import { useFtxUi } from '../ui/UiContext'

interface TreeViewProps {
  root: FolderNode
}

export function TreeView({ root }: TreeViewProps) {
  const { theme } = useFtxUi()
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => ({
    [root.name]: true,
  }))

  const toggle = (path: string) => {
    setExpanded((prev) => ({ ...prev, [path]: !prev[path] }))
  }

  const renderNode = (node: TreeNode, parentPath: string[]): JSX.Element => {
    const currentPath = [...parentPath, node.name]
    const pathKey = currentPath.join('/')
    const isFolder = node.type === 'folder'
    const isExpanded = expanded[pathKey]

    return (
      <li key={pathKey}>
        <div
          className={[
            'flex items-center gap-1.5 rounded-md px-1 py-0.5',
            theme === 'dark' ? 'hover:bg-slate-900' : 'hover:bg-slate-100',
          ].join(' ')}
        >
          {isFolder ? (
            <button
              type="button"
              className={[
                'inline-flex h-4 w-4 items-center justify-center rounded border text-[0.6rem]',
                theme === 'dark'
                  ? 'border-slate-500/70 bg-slate-900'
                  : 'border-slate-400 bg-slate-100',
              ].join(' ')}
              onClick={() => toggle(pathKey)}
              aria-label={isExpanded ? 'Zwiń folder' : 'Rozwiń folder'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          ) : (
            <span className="inline-flex h-4 w-4 rounded border border-transparent" />
          )}

          <div className="inline-flex items-center gap-1">
            <span
              className={[
                'inline-flex items-center justify-center rounded-full border px-1.5 text-[0.65rem] font-medium',
                node.type === 'file'
                  ? 'border-blue-400/80 text-blue-500'
                  : 'border-emerald-400/80 text-emerald-500',
              ].join(' ')}
            >
              {node.type}
            </span>
            {node.type === 'file' ? (
              <Link
                to={`/tree/${currentPath.slice(1).join('/')}`}
                className="text-sm font-normal hover:text-blue-600"
              >
                {node.name}
              </Link>
            ) : (
              <Link
                to={`/tree/${currentPath.slice(1).join('/')}`}
                className="text-sm font-medium hover:text-blue-600"
              >
                {node.name}/
              </Link>
            )}
          </div>
        </div>

        {isFolder && isExpanded && node.children.length > 0 && (
          <ul
            className={[
              'ml-5 border-l border-dashed pl-3 text-sm',
              theme === 'dark' ? 'border-slate-600/80' : 'border-slate-300',
            ].join(' ')}
          >
            {node.children.map((child) => (
              <Fragment key={[...currentPath, child.name].join('/')}>
                {renderNode(child, currentPath)}
              </Fragment>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <div
      className={[
        'max-h-[540px] overflow-auto rounded-xl border p-3 text-sm',
        theme === 'dark' ? 'border-slate-700 bg-slate-900/90' : 'border-slate-200 bg-slate-50',
      ].join(' ')}
    >
      <div className="mb-1 font-semibold">{root.name}/</div>
      <ul className="list-none space-y-0.5 pl-0">
        {root.children.map((child) => renderNode(child, [root.name]))}
      </ul>
    </div>
  )
}

