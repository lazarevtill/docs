import Link from 'next/link'

interface BreadcrumbsProps {
  path: string
}

export default function Breadcrumbs({ path }: BreadcrumbsProps) {
  const parts = path.split('/').filter(Boolean)
  const breadcrumbs = parts.map((part, index) => {
    const href = `/docs/${parts.slice(0, index + 1).join('/')}`
    return { href, label: part }
  })

  return (
    <nav 
      aria-label="Breadcrumb" 
      className="text-sm mb-4 overflow-x-auto whitespace-nowrap -mx-2 px-2 py-1"
    >
      <ol className="flex items-center space-x-2">
        <li className="flex items-center">
          <Link href="/" className="text-blue-500 hover:underline">
            Docs
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center">
            <span className="mx-2 text-gray-500">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-gray-500" aria-current="page">
                {decodeURIComponent(crumb.label).replace(/-/g, ' ')}
              </span>
            ) : (
              <Link href={crumb.href} className="text-blue-500 hover:underline">
                {decodeURIComponent(crumb.label).replace(/-/g, ' ')}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

