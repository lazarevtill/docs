import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

const docsDirectory = path.join(process.cwd(), 'docs')

export async function GET() {
  try {
    const tree = await getDocsTree()
    return NextResponse.json(tree)
  } catch (error) {
    console.error('Error generating docs tree:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

async function getDocsTree() {
  const files = await getAllFiles(docsDirectory)
  const tree = {}

  for (const file of files) {
    const relativePath = path.relative(docsDirectory, file)
    const parts = relativePath.split(path.sep)
    let current = tree

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1
      const isFile = isLast && /\.(md|mdx)$/i.test(part)
      
      // Clean up the name and handle "About" files
      let key = isFile ? part.replace(/\.(md|mdx)$/i, '') : part
      
      // Create nested structure
      if (!current[key]) {
        current[key] = isLast ? null : {}
      }
      
      if (!isLast) {
        current = current[key]
      }
    }
  }

  return tree
}

async function getAllFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        return getAllFiles(fullPath)
      } else if (entry.isFile() && /\.(md|mdx)$/i.test(entry.name)) {
        return [fullPath]
      }
      return []
    })
  )

  return files.flat()
}

