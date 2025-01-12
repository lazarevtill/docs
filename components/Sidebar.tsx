"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Home, Search, ChevronRight, Menu } from 'lucide-react'
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type TreeNode = {
  [key: string]: TreeNode | null
}

interface TreeItemProps {
  name: string
  node: TreeNode | null
  basePath: string
  level: number
  currentPath: string
}

function TreeItem({ name, node, basePath, level, currentPath }: TreeItemProps) {
  const [isOpen, setIsOpen] = useState(true)
  const isActive = `/docs/${basePath}${name}` === currentPath
  const displayName = name.split(/[\\/]/).pop() || name
  const isDirectory = node !== null
  
  return (
    <li className="relative" role="treeitem" aria-selected={isActive} aria-expanded={isDirectory && isOpen}>
      <div
        className={cn(
          "flex items-center py-1",
          level > 0 && "ml-4",
          isActive && "font-medium text-primary",
          isDirectory ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {isDirectory && (
          <ChevronRight 
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isOpen && "rotate-90"
            )}
          />
        )}
        {!isDirectory ? (
          <Link
            href={`/docs/${basePath}${name}`}
            className={cn(
              "block w-full hover:text-foreground/80 transition-colors rounded px-2 py-1",
              isActive && "text-primary bg-muted"
            )}
          >
            {displayName}
          </Link>
        ) : (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "flex w-full items-center text-sm font-medium hover:text-foreground/80 transition-colors",
              isActive && "text-primary"
            )}
          >
            {displayName}
          </button>
        )}
      </div>
      {isDirectory && isOpen && (
        <ul className="mt-1 border-l border-muted pl-4">
          {Object.entries(node)
            .sort(([aKey, aValue], [bKey, bValue]) => {
              const aIsDir = aValue !== null
              const bIsDir = bValue !== null
              if (aIsDir === bIsDir) {
                return aKey.localeCompare(bKey)
              }
              return aIsDir ? -1 : 1
            })
            .map(([key, value]) => (
              <TreeItem
                key={key}
                name={key}
                node={value}
                basePath={`${basePath}${name}/`}
                level={level + 1}
                currentPath={currentPath}
              />
            ))}
        </ul>
      )}
    </li>
  )
}

export default function Sidebar() {
  const [tree, setTree] = useState<TreeNode>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    async function fetchTree() {
      try {
        const response = await fetch('/api/docs-tree')
        if (!response.ok) {
          throw new Error('Failed to fetch doc tree')
        }
        const fetchedTree = await response.json()
        setTree(fetchedTree)
      } catch (error) {
        console.error('Error fetching doc tree:', error)
        setTree({})
      }
    }
    fetchTree()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(true)
      } else {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isMobileMenuOpen && window.innerWidth < 1024) {
        const sidebar = document.getElementById('mobile-sidebar')
        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsMobileMenuOpen(false)
        }
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isMobileMenuOpen])

  const filterTree = useCallback((treeData: TreeNode, query: string): TreeNode => {
    if (!query) return treeData
    const filtered: TreeNode = {}
    Object.entries(treeData).forEach(([key, value]) => {
      const displayName = key.split(/[\\/]/).pop() || key
      if (displayName.toLowerCase().includes(query.toLowerCase())) {
        filtered[key] = value
      } else if (value !== null) {
        const subFiltered = filterTree(value, query)
        if (Object.keys(subFiltered).length > 0) {
          filtered[key] = subFiltered
        }
      }
    })
    return filtered
  }, [])

  const filteredTree = useMemo(() => 
    filterTree(tree, searchQuery), 
    [tree, searchQuery, filterTree]
  )

  return (
    <>
      <div className="relative lg:static">
        <div className="fixed bottom-0 left-0 w-full p-4 bg-background border-t lg:hidden z-50">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
            <span>{isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}</span>
          </Button>
        </div>
        <div
          id="mobile-sidebar"
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-64 max-w-[16rem] transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
            "border-r bg-background shadow-lg lg:shadow-none",
            "pb-16 lg:pb-0",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="relative z-40 h-full flex flex-col border-r bg-background">
            <div className="p-4 border-b">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-lg font-semibold"
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Link>
            </div>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1 scroll-area-elegant">
              <nav className="p-4">
                <ul className="space-y-1">
                  {Object.entries(filteredTree)
                    .sort(([aKey, aValue], [bKey, bValue]) => {
                      const aIsDir = aValue !== null
                      const bIsDir = bValue !== null
                      if (aIsDir === bIsDir) {
                        return aKey.localeCompare(bKey)
                      }
                      return aIsDir ? -1 : 1
                    })
                    .map(([key, value]) => (
                      <TreeItem
                        key={key}
                        name={key}
                        node={value}
                        basePath=""
                        level={0}
                        currentPath={pathname}
                      />
                    ))}
                </ul>
              </nav>
            </ScrollArea>
          </div>
        </div>
        <div
          className={cn(
            "fixed inset-0 z-30 bg-black/50 transition-opacity duration-300 ease-in-out lg:hidden",
            isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      </div>
    </>
  )
}