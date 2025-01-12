import React from 'react'
import Link from 'next/link'
import { FolderIcon, FileIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Update the type definition to handle recursive structure
type TreeStructure = {
  [key: string]: TreeStructure | null
}

interface FolderStructureProps {
  structure: TreeStructure;
  basePath: string;
  currentPath: string;
}

export function FolderStructure({ structure, basePath, currentPath }: FolderStructureProps) {
  return (
    <ul className="space-y-2" role="tree">
      {Object.entries(structure).map(([key, value]) => {
        const fullPath = `${basePath}${key}`
        const isActive = currentPath === fullPath
        const isDirectory = value !== null

        return (
          <li 
            key={key} 
            role="treeitem" 
            aria-expanded={isDirectory}
            aria-selected={isActive}
          >
            <div className={cn(
              "flex items-center py-1 px-2 rounded-md",
              isActive && "bg-primary text-primary-foreground",
              !isActive && "hover:bg-muted"
            )}>
              {isDirectory ? (
                <FolderIcon className="h-4 w-4 mr-2 shrink-0" />
              ) : (
                <FileIcon className="h-4 w-4 mr-2 shrink-0" />
              )}
              {isDirectory ? (
                <span className="font-medium">{key}</span>
              ) : (
                <Link 
                  href={`/docs/${fullPath}`}
                  className={cn(
                    "flex-grow",
                    isActive ? "text-primary-foreground" : "text-foreground hover:underline"
                  )}
                >
                  {key}
                </Link>
              )}
            </div>
            {isDirectory && (
              <div className="pl-4">
                <FolderStructure 
                  structure={value} 
                  basePath={`${fullPath}/`} 
                  currentPath={currentPath}
                />
              </div>
            )}
          </li>
        )
      })}
    </ul>
  )
}