import type { TreeState, FolderNode, TreeNode } from './types'

const TREE_STORAGE_KEY = 'filetree-explorer:tree'
const SEARCH_TERM_KEY = 'filetree-explorer:searchTerm'

export function saveTreeState(state: TreeState) {
  try {
    if (!state.root) {
      localStorage.removeItem(TREE_STORAGE_KEY)
      return
    }

    const data = JSON.stringify(state.root)
    localStorage.setItem(TREE_STORAGE_KEY, data)
  } catch {
    // ignore
  }
}

export function loadTreeState(): TreeState {
  try {
    const raw = localStorage.getItem(TREE_STORAGE_KEY)
    if (!raw) return { root: null }
    const parsed = JSON.parse(raw) as FolderNode
    if (!isValidFolderNode(parsed)) {
      return { root: null }
    }
    return { root: parsed }
  } catch {
    return { root: null }
  }
}

function isValidFolderNode(node: unknown): node is FolderNode {
  if (!node || typeof node !== 'object') return false
  const n = node as Partial<FolderNode>
  if (n.type !== 'folder' || typeof n.name !== 'string' || !Array.isArray(n.children)) return false
  return n.children.every(isValidTreeNode)
}

function isValidTreeNode(node: unknown): node is TreeNode {
  if (!node || typeof node !== 'object') return false
  const n = node as Partial<TreeNode> & { type?: string }
  if (n.type === 'file') {
    return typeof n.name === 'string' && typeof (n as any).size === 'number'
  }
  if (n.type === 'folder') {
    return typeof n.name === 'string' && Array.isArray((n as any).children)
  }
  return false
}

export function saveSearchTerm(term: string) {
  try {
    if (!term) {
      localStorage.removeItem(SEARCH_TERM_KEY)
      return
    }
    localStorage.setItem(SEARCH_TERM_KEY, term)
  } catch {
    // ignore
  }
}

export function loadSearchTerm(): string {
  try {
    return localStorage.getItem(SEARCH_TERM_KEY) ?? ''
  } catch {
    return ''
  }
}

