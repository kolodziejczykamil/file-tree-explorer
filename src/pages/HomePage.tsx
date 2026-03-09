import { useState } from 'react'
import type { SyntheticEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFtxTree } from '../tree/TreeContext'
import { useFtxUi } from '../ui/UiContext'
import type { FolderNode } from '../tree/types'

type RawNode = {
  name: string
  type: 'file' | 'folder'
  size?: number
  children?: RawNode[]
}

const EXAMPLES: { id: string; label: string; json: string }[] = [
  {
    id: 'basic',
    label: 'Prosty projekt (z treści zadania)',
    json: JSON.stringify(
      {
        name: 'root',
        type: 'folder',
        children: [
          {
            name: 'src',
            type: 'folder',
            children: [
              { name: 'index.ts', type: 'file', size: 1024 },
              {
                name: 'components',
                type: 'folder',
                children: [{ name: 'Button.tsx', type: 'file', size: 512 }],
              },
            ],
          },
          { name: 'package.json', type: 'file', size: 300 },
        ],
      },
      null,
      2,
    ),
  },
  {
    id: 'backend',
    label: 'API + config',
    json: JSON.stringify(
      {
        name: 'root',
        type: 'folder',
        children: [
          {
            name: 'api',
            type: 'folder',
            children: [
              { name: 'server.ts', type: 'file', size: 4096 },
              { name: 'routes.ts', type: 'file', size: 2048 },
            ],
          },
          {
            name: 'config',
            type: 'folder',
            children: [
              { name: 'dev.json', type: 'file', size: 1024 },
              { name: 'prod.json', type: 'file', size: 1024 },
            ],
          },
          { name: 'package.json', type: 'file', size: 2000 },
          { name: 'README.md', type: 'file', size: 800 },
        ],
      },
      null,
      2,
    ),
  },
  {
    id: 'mono',
    label: 'Monorepo (apps + packages)',
    json: JSON.stringify(
      {
        name: 'root',
        type: 'folder',
        children: [
          {
            name: 'apps',
            type: 'folder',
            children: [
              {
                name: 'web',
                type: 'folder',
                children: [
                  { name: 'index.tsx', type: 'file', size: 5000 },
                  { name: 'App.tsx', type: 'file', size: 3200 },
                ],
              },
              {
                name: 'admin',
                type: 'folder',
                children: [
                  { name: 'index.tsx', type: 'file', size: 4800 },
                  { name: 'Users.tsx', type: 'file', size: 2600 },
                ],
              },
            ],
          },
          {
            name: 'packages',
            type: 'folder',
            children: [
              { name: 'ui', type: 'folder', children: [] },
              { name: 'config', type: 'folder', children: [] },
            ],
          },
          { name: 'turbo.json', type: 'file', size: 1024 },
        ],
      },
      null,
      2,
    ),
  },
]

export function HomePage() {
  const { setRoot } = useFtxTree()
  const { t, theme } = useFtxUi()
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    try {
      const parsed = JSON.parse(text) as unknown
      const root = normalizeRoot(parsed)
      setRoot(root)
      navigate('/tree')
    } catch (err) {
      setError((err as Error).message || 'Nieprawidłowy JSON')
    }
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    try {
      const content = await file.text()
      setText(content)
      const parsed = JSON.parse(content) as unknown
      const root = normalizeRoot(parsed)
      setRoot(root)
      setError(null)
      navigate('/tree')
    } catch (err) {
      setError((err as Error).message || 'Nieprawidłowy plik JSON')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div
      className={[
        'w-full max-w-4xl rounded-2xl border p-6 shadow-xl transition-colors',
        theme === 'dark'
          ? 'border-slate-700/70 bg-slate-900/80 shadow-slate-950/60'
          : 'border-slate-200 bg-white shadow-slate-200/80',
      ].join(' ')}
    >
      <div className="mb-6 space-y-2">
        <h1 className="text-xl font-semibold">{t('home.title')}</h1>
        <p className="text-sm text-slate-400">{t('home.subtitle')}</p>
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-1 block text-sm font-medium"
            htmlFor="json-input"
          >
            {t('home.jsonLabel')}
          </label>
          <textarea
            id="json-input"
            className={[
              'mt-1 w-full min-h-[10rem] max-h-[26rem] resize-y rounded-xl border px-3 py-2 text-xs font-mono shadow-sm outline-none ring-0 transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
              theme === 'dark'
                ? 'border-slate-700/80 bg-slate-950/70 text-slate-100'
                : 'border-slate-300 bg-white text-slate-900',
            ].join(' ')}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='{"name": "root", "type": "folder", "children": [...]}'
          />
          <p className="mt-1 text-xs text-slate-400">
            {t('home.formatHint')}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full border border-transparent bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-blue-600/40 transition hover:-translate-y-px hover:shadow-xl hover:shadow-blue-600/50"
          >
            {t('home.loadFromText')}
          </button>

          <div className="flex flex-1 items-center justify-between gap-2">
            <label
              className={[
                'inline-flex cursor-pointer items-center justify-center rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition',
                theme === 'dark'
                  ? 'border-slate-600 bg-slate-900/90 text-slate-100 hover:bg-slate-800'
                  : 'border-slate-300 bg-slate-100 text-slate-800 hover:bg-slate-200',
              ].join(' ')}
            >
              {t('home.uploadJsonFile')}
              <input
                type="file"
                accept="application/json"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </label>
            <span className="flex-1 text-xs text-slate-400">
              {t('home.uploadHint')}
            </span>
          </div>
        </div>

        {error && <div className="text-xs font-medium text-red-400">{error}</div>}

        <div className="mt-3 flex flex-col gap-2 border-t border-slate-800 pt-4">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {t('home.examplesTitle')}
          </span>
          <div className="grid gap-3 md:grid-cols-3">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.id}
                type="button"
                onClick={() => {
                  setText(ex.json)
                  try {
                    const parsed = JSON.parse(ex.json) as unknown
                    const root = normalizeRoot(parsed)
                    setRoot(root)
                    setError(null)
                    navigate('/tree')
                  } catch (err) {
                    setError((err as Error).message || 'Nieprawidłowy przykład JSON')
                  }
                }}
                className={[
                  'flex flex-col items-stretch rounded-xl border p-3 text-left text-xs shadow-sm transition hover:border-blue-500',
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-900/80 text-slate-100 hover:bg-slate-900'
                    : 'border-slate-200 bg-white text-slate-900 hover:bg-slate-50',
                ].join(' ')}
              >
                <div className="mb-2 text-[0.7rem] font-semibold uppercase tracking-wide text-slate-300">
                  {ex.label}
                </div>
                <pre className="max-h-32 overflow-auto rounded bg-slate-950/80 px-2 py-1 font-mono text-[0.65rem] text-slate-200">
                  {ex.json.split('\n').slice(0, 10).join('\n')}
                  {ex.json.split('\n').length > 10 ? '\n…' : ''}
                </pre>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  )
}

function normalizeRoot(input: unknown): FolderNode {
  const node = validateNode(input)
  if (node.type !== 'folder') {
    throw new Error('Root musi być folderem (type="folder").')
  }
  if (!node.children) {
    node.children = []
  }
  return node as FolderNode
}

function validateNode(input: unknown, path: string = 'root'): RawNode {
  if (!input || typeof input !== 'object') {
    throw new Error(`Nieprawidłowy węzeł w ${path} – oczekiwano obiektu.`)
  }
  const node = input as Partial<RawNode>
  if (typeof node.name !== 'string') {
    throw new Error(`Brak lub nieprawidłowe "name" w ${path}.`)
  }
  if (node.type !== 'file' && node.type !== 'folder') {
    throw new Error(`Nieprawidłowe "type" w ${path} – oczekiwano "file" lub "folder".`)
  }

  if (node.type === 'file') {
    if (typeof node.size !== 'number') {
      throw new Error(`Plik "${path}" musi mieć numeryczne pole "size".`)
    }
    return {
      name: node.name,
      type: 'file',
      size: node.size,
    }
  }

  const children: RawNode[] = Array.isArray(node.children)
    ? node.children.map((child, index) => validateNode(child, `${path}/${index}`))
    : []

  return {
    name: node.name,
    type: 'folder',
    children,
  }
}

