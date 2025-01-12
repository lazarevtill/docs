import Link from 'next/link'
import { getDocsTree } from '@/lib/docs'

function renderTree(tree: any, basePath: string = '') {
  return (
    <ul className="pl-4">
      {Object.entries(tree).map(([key, value]) => (
        <li key={key} className="my-2">
          {value === null ? (
            <Link href={`/docs/${basePath}${key}`} className="text-blue-500 hover:underline">
              {key}
            </Link>
          ) : (
            <>
              <span className="font-bold">{key}</span>
              {renderTree(value, `${basePath}${key}/`)}
            </>
          )}
        </li>
      ))}
    </ul>
  )
}

export default function DocsIndexPage() {
  const tree = getDocsTree()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Documentation</h1>
      {Object.keys(tree).length > 0 ? (
        <>
          <p className="mb-4">Welcome to the documentation. Please select a topic to get started:</p>
          {renderTree(tree)}
        </>
      ) : (
        <p className="mb-4">No documentation found. Please add some .md or .mdx files to the 'docs' directory.</p>
      )}
    </div>
  )
}

