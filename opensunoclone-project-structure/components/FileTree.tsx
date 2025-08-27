
import React, { useState } from 'react';
import type { TreeNode } from '../types';
import { FolderIcon, FileIcon, PythonIcon, MarkdownIcon, ShellIcon, GitIcon } from './Icons';

interface FileTreeProps {
  node: TreeNode;
  isRoot?: boolean;
}

const getIcon = (node: TreeNode) => {
  if (node.type === 'folder') {
    return <FolderIcon />;
  }
  switch (node.fileType) {
    case 'python':
      return <PythonIcon />;
    case 'markdown':
      return <MarkdownIcon />;
    case 'shell':
        return <ShellIcon />;
    case 'git':
        return <GitIcon />;
    default:
      return <FileIcon />;
  }
};


export const FileTree: React.FC<FileTreeProps> = ({ node, isRoot = true }) => {
  const [isOpen, setIsOpen] = useState(isRoot);

  const isFolder = node.type === 'folder';
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  };
  
  // Sort children: folders first, then files, alphabetically
  const sortedChildren = hasChildren ? [...node.children!].sort((a, b) => {
    if (a.type === 'folder' && b.type !== 'folder') return -1;
    if (a.type !== 'folder' && b.type === 'folder') return 1;
    return a.name.localeCompare(b.name);
  }) : [];

  return (
    <div className={isRoot ? '' : 'pl-6'}>
      <div
        className={`flex items-center space-x-2 py-1 rounded ${isFolder ? 'cursor-pointer hover:bg-slate-700/50' : ''}`}
        onClick={handleToggle}
      >
        <span className="w-6 h-6 flex-shrink-0">
          {isFolder && hasChildren && (
             <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-90' : 'rotate-0'}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          )}
        </span>
        <span className="w-6 h-6 flex-shrink-0 text-cyan-400">{getIcon(node)}</span>
        <span className="font-mono text-sm text-slate-300">{node.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {sortedChildren.map((child, index) => (
            <FileTree key={index} node={child} isRoot={false} />
          ))}
        </div>
      )}
    </div>
  );
};
