import { FolderIcon, FileIcon } from 'lucide-react'

interface FolderStructureProps {
  structure: {
    [key: string]: any
  }
  basePath: string
}

export function FolderStructure({ structure, basePath }: FolderStructureProps) {
  return (
    <ul className="space-y-2">
      {Object.entries(structure).map(([key, value]) => (
        value === null ? (
          <FileIcon key={key} className="h-4 w-4 mt-1 shrink-0" />
        ) : (
          <div key={key} className="flex items-start gap-2">
            <FolderIcon className="h-4 w-4 mt-1 shrink-0" />
            <FolderStructure structure={value} basePath={`${basePath}${key}/`} />
          </div>
        )
      ))}
    </ul>
  )
}

