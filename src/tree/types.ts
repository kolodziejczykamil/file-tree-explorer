export type NodeType = 'file' | 'folder'

export interface BaseNode {
  name: string
  type: NodeType
}

export interface FileNode extends BaseNode {
  type: 'file'
  size: number
}

export interface FolderNode extends BaseNode {
  type: 'folder'
  children: TreeNode[]
}

export type TreeNode = FileNode | FolderNode

export interface TreeState {
  root: FolderNode | null
}

