import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useFtxTree } from '../tree/TreeContext'
import { useFtxUi } from '../ui/UiContext'
import type { FolderNode, FileNode, TreeNode } from '../tree/types'

export function NodeDetailsPage() {
  const params = useParams()
  const { root, findNodeByPath, formatSize } = useFtxTree()
  const { theme, t } = useFtxUi()

  const rawPath = (params['*'] ?? '').replace(/\/$/, '')
  const segments = rawPath ? rawPath.split('/').filter(Boolean) : []
  const { node, fullPath } = findNodeByPath(segments)
  const isDark = theme === 'dark'

  if (!root) {
    return (
      <FtxNodeDetailsShell
        isDark={isDark}
        title={t('details.missingRoot.title')}
        subtitle={t('details.missingRoot.subtitle')}
      >
        <p className="text-sm text-slate-400">
          {t('details.missingRoot.body')}{' '}
          <Link to="/" className="font-medium text-blue-400 hover:text-blue-300">
            {t('nav.home')}
          </Link>
        </p>
      </FtxNodeDetailsShell>
    )
  }

  if (!node) {
    return (
      <FtxNodeDetailsShell isDark={isDark} title="Węzeł nie znaleziony">
        <div className="mb-4">
          <p className="text-sm text-slate-400">
            {t('details.notFound.body.prefix')}{' '}
            <code>{rawPath}</code> {t('details.notFound.body.suffix')}
          </p>
        </div>
        <FtxBackToTreeButton isDark={isDark} />
      </FtxNodeDetailsShell>
    )
  }

  if (node.type === 'file') {
    return (
      <FtxFileDetailsPanel
        isDark={isDark}
        fileNode={node as FileNode}
        fullPath={fullPath}
        formatSize={formatSize}
        t={t}
      />
    )
  }

  return (
    <FtxFolderDetailsPanel
      isDark={isDark}
      folderNode={node as FolderNode}
      fullPath={fullPath}
      formatSize={formatSize}
      t={t}
    />
  )
}

type FtxNodeDetailsShellProps = {
  isDark: boolean
  title: string
  subtitle?: string
  rightSlot?: ReactNode
  children: ReactNode
}

function FtxNodeDetailsShell({
  isDark,
  title,
  subtitle,
  rightSlot,
  children,
}: FtxNodeDetailsShellProps) {
  return (
    <div
      className={[
        'w-full rounded-2xl border p-6 shadow-xl transition-colors',
        isDark
          ? 'border-slate-700/70 bg-slate-900/80 shadow-slate-950/60'
          : 'border-slate-200 bg-white shadow-slate-200/80',
      ].join(' ')}
    >
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
        {rightSlot}
      </div>
      {children}
    </div>
  )
}

type FtxFileDetailsPanelProps = {
  isDark: boolean
  fileNode: FileNode
  fullPath: string
  formatSize: (size: number) => string
  t: (key: string) => string
}

function FtxFileDetailsPanel({
  isDark,
  fileNode,
  fullPath,
  formatSize,
  t,
}: FtxFileDetailsPanelProps) {
  const textMain = isDark ? 'text-slate-100' : 'text-slate-900'
  const textPath = isDark ? 'text-slate-200' : 'text-slate-700'

  return (
    <FtxNodeDetailsShell
      isDark={isDark}
      title={t('details.file.title')}
      subtitle={fileNode.name}
      rightSlot={<FtxBackToTreeButton isDark={isDark} />}
    >
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs text-slate-400">{t('details.label.name')}</div>
          <div className={['font-medium', textMain].join(' ')}>{fileNode.name}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t('details.label.size')}</div>
          <div className={['font-medium', textMain].join(' ')}>{formatSize(fileNode.size)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t('details.label.type')}</div>
          <div className={['font-medium', textMain].join(' ')}>{t('details.value.file')}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t('details.label.fullPath')}</div>
          <div className={['font-mono text-xs', textPath].join(' ')}>{fullPath}</div>
        </div>
      </div>
    </FtxNodeDetailsShell>
  )
}

type FtxFolderDetailsPanelProps = {
  isDark: boolean
  folderNode: FolderNode
  fullPath: string
  formatSize: (size: number) => string
  t: (key: string) => string
}

function FtxFolderDetailsPanel({
  isDark,
  folderNode,
  fullPath,
  formatSize,
  t,
}: FtxFolderDetailsPanelProps) {
  const childCount = folderNode.children.length
  const { totalSize, fileCount } = summarizeFolder(folderNode)
  const textMain = isDark ? 'text-slate-100' : 'text-slate-900'
  const textPath = isDark ? 'text-slate-200' : 'text-slate-700'

  return (
    <FtxNodeDetailsShell
      isDark={isDark}
      title={t('details.folder.title')}
      subtitle={`${folderNode.name}/`}
      rightSlot={<FtxBackToTreeButton isDark={isDark} />}
    >
      <div className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <div className="text-xs text-slate-400">{t('details.label.name')}</div>
          <div className={['font-medium', textMain].join(' ')}>{folderNode.name}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t('details.label.directChildren')}</div>
          <div className={['font-medium', textMain].join(' ')}>{childCount}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t('details.label.subtreeSize')}</div>
          <div className={['font-medium', textMain].join(' ')}>
            {formatSize(totalSize)} ({totalSize} B)
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t('details.label.subtreeFiles')}</div>
          <div className={['font-medium', textMain].join(' ')}>{fileCount}</div>
        </div>
        <div>
          <div className="text-xs text-slate-400">{t('details.label.fullPath')}</div>
          <div className={['font-mono text-xs', textPath].join(' ')}>{fullPath}</div>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-700 pt-3 text-sm">
        <div className="text-xs text-slate-400">{t('details.label.children')}</div>
        {childCount === 0 && (
          <div className="pt-1 text-sm text-slate-400">{t('details.label.folderEmpty')}</div>
        )}
        {childCount > 0 && (
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {folderNode.children.map((child) => {
              const childPath = [fullPath.split('/').slice(1).join('/'), child.name]
                .filter(Boolean)
                .join('/')

              return (
                <li key={childPath}>
                  <Link to={`/tree/${childPath}`}>
                    <span
                      className={[
                        'mr-1 inline-flex items-center justify-center rounded-full border px-1.5 text-[0.65rem] font-medium',
                        child.type === 'file'
                          ? 'border-blue-400/80 text-blue-300'
                          : 'border-emerald-400/80 text-emerald-300',
                      ].join(' ')}
                    >
                      {child.type}
                    </span>
                    {child.name}
                    {child.type === 'folder' ? '/' : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </FtxNodeDetailsShell>
  )
}

type FtxBackToTreeButtonProps = {
  isDark: boolean
}

function FtxBackToTreeButton({ isDark }: FtxBackToTreeButtonProps) {
  return (
    <Link
      to="/tree"
      className={[
        'inline-flex items-center justify-center rounded-full border px-3 py-1 text-sm font-medium shadow-sm transition',
        isDark
          ? 'border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800'
          : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200',
      ].join(' ')}
    >
      Powrót do drzewa
    </Link>
  )
}

function summarizeFolder(folder: FolderNode): { totalSize: number; fileCount: number } {
  let totalSize = 0
  let fileCount = 0
  const stack: TreeNode[] = [...folder.children]

  while (stack.length > 0) {
    const node = stack.pop()!
    if (node.type === 'file') {
      totalSize += node.size
      fileCount += 1
    } else {
      stack.push(...node.children)
    }
  }

  return { totalSize, fileCount }
}

