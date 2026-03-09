import { createContext, useContext, useMemo, useState, type ReactNode, useEffect } from 'react'
import type { FolderNode, TreeNode } from './types'
import { loadTreeState, saveTreeState, loadSearchTerm, saveSearchTerm } from './storage'

interface TreeContextValue {
  root: FolderNode | null
  setRoot: (root: FolderNode | null) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  formatSize: (size: number) => string
  findNodeByPath: (path: string[]) => { node: TreeNode | null; fullPath: string }
  computeFolderSize: (folder: FolderNode) => number
  computeFolderFileCount: (folder: FolderNode) => number
}

const TreeContext = createContext<TreeContextValue | undefined>(undefined)

export function FtxTreeProvider({ children }: { children: ReactNode }) {
  const [root, setRootState] = useState<FolderNode | null>(() => loadTreeState().root)
  const [searchTerm, setSearchTermState] = useState<string>(() => loadSearchTerm())

  useEffect(() => {
    saveTreeState({ root })
  }, [root])

  useEffect(() => {
    saveSearchTerm(searchTerm)
  }, [searchTerm])

  const setRoot = (next: FolderNode | null) => {
    setRootState(next)
  }

  const setSearchTerm = (term: string) => {
    setSearchTermState(term)
  }

  const formatSize = (size: number) => {
    if (size < 1024) return `${size} B`
    const kb = size / 1024
    if (kb < 1024) return `${kb.toFixed(1)} KB`
    const mb = kb / 1024
    if (mb < 1024) return `${mb.toFixed(2)} MB`
    const gb = mb / 1024
    return `${gb.toFixed(2)} GB`
  }

  const findNodeByPath = (segmentsRaw: string[]) => {
    if (!root) return { node: null, fullPath: '' }

    
    const segments = segmentsRaw.filter((s) => s.length > 0)
    if (segments[0] === root.name) {
      segments.shift()
    }

    if (segments.length === 0) {
      return { node: root, fullPath: root.name }
    }
    let current: TreeNode = root
    const resolved: string[] = [root.name]
    for (const seg of segments) {
      if (current.type !== 'folder') {
        return { node: null, fullPath: resolved.join('/') }
      }
      const next: TreeNode | undefined = current.children.find((child) => child.name === seg)
      if (!next) return { node: null, fullPath: resolved.join('/') }
      current = next
      resolved.push(seg)
    }
    return { node: current, fullPath: resolved.join('/') }
  }

  const computeFolderSize = (folder: FolderNode): number => {
    let total = 0
    const stack: TreeNode[] = [...folder.children]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (node.type === 'file') {
        total += node.size
      } else {
        stack.push(...node.children)
      }
    }
    return total
  }

  const computeFolderFileCount = (folder: FolderNode): number => {
    let count = 0
    const stack: TreeNode[] = [...folder.children]
    while (stack.length > 0) {
      const node = stack.pop()!
      if (node.type === 'file') {
        count += 1
      } else {
        stack.push(...node.children)
      }
    }
    return count
  }

  const value = useMemo<TreeContextValue>(
    () => ({
      root,
      setRoot,
      searchTerm,
      setSearchTerm,
      formatSize,
      findNodeByPath,
      computeFolderSize,
      computeFolderFileCount,
    }),
    [root, searchTerm],
  )

  return <TreeContext.Provider value={value}>{children}</TreeContext.Provider>
}

export function useFtxTree() {
  const ctx = useContext(TreeContext)
  if (!ctx) {
    throw new Error('useFtxTree must be used within FtxTreeProvider')
  }
  return ctx
}

