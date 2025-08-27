
export interface TreeNode {
  name: string;
  type: 'file' | 'folder';
  fileType?: 'python' | 'markdown' | 'shell' | 'text' | 'git';
  children?: TreeNode[];
}
