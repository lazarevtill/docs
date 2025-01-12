import path from 'path'
import matter from 'gray-matter'
import { promises as fs } from 'fs'

const docsDirectory = path.join(process.cwd(), 'docs')

export async function getAllDocSlugs() {
  try {
    return await getAllFilesAndDirs(docsDirectory)
  } catch (error) {
    console.error('Error reading docs directory:', error)
    return []
  }
}

export async function getDocBySlug(slug: string) {
  try {
    const realSlug = decodeURIComponent(slug)
      .replace(/\.mdx?$/, '')
      .replace(/%20/g, ' ')

    const pathParts = realSlug.split('/').map(part => 
      part.replace(/[^a-zA-Z0-9\s-]/g, '')
    )

    const fullPath = path.join(docsDirectory, ...pathParts)

    // Check if the path exists with or without the .md extension
    const possiblePaths = [
      fullPath,
      `${fullPath}.md`,
      `${fullPath}.mdx`,
      path.join(docsDirectory, `${realSlug}.md`),
      path.join(docsDirectory, `${realSlug}.mdx`)
    ]

    let stats
    let existingPath

    for (const p of possiblePaths) {
      try {
        stats = await fs.stat(p)
        existingPath = p
        break
      } catch (error) {
        // Continue to the next possible path
      }
    }

    if (!stats || !existingPath) {
      console.error(`Error reading file stats for ${fullPath}:`, { code: 'ENOENT', path: fullPath })
      return await findCloseMatch(pathParts)
    }

    if (stats.isDirectory()) {
      return await handleDirectory(existingPath, realSlug, pathParts)
    }

    return await handleFile(existingPath, realSlug, pathParts)

  } catch (error) {
    console.error(`Error reading doc file for slug ${slug}:`, error)
    return createNotFoundResponse(slug)
  }
}

async function handleDirectory(fullPath: string, realSlug: string, pathParts: string[]) {
  try {
    const files = await fs.readdir(fullPath)
    const subDirs = []
    const mdFiles = []
    
    for (const file of files) {
      const filePath = path.join(fullPath, file)
      const fileStat = await fs.stat(filePath)
      if (fileStat.isDirectory()) {
        subDirs.push(file)
      } else if (/\.(md|mdx)$/i.test(file)) {
        mdFiles.push(file)
      }
    }
    
    return {
      slug: realSlug,
      frontmatter: { title: pathParts[pathParts.length - 1] || 'Index' },
      content: '',
      isDirectory: true,
      subDirs,
      mdFiles
    }
  } catch (error) {
    console.error(`Error handling directory ${fullPath}:`, error)
    return createNotFoundResponse(realSlug)
  }
}

async function handleFile(fullPath: string, realSlug: string, pathParts: string[]) {
  try {
    const fileContents = await fs.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      slug: realSlug,
      frontmatter: {
        title: data.title || pathParts[pathParts.length - 1] || 'Untitled',
        ...data
      },
      content,
      isDirectory: false
    }

  } catch (error) {
    console.error(`Error handling file ${fullPath}:`, error)
    return createNotFoundResponse(realSlug)
  }
}

function createNotFoundResponse(slug: string) {
  return {
    slug,
    frontmatter: { title: 'Not Found' },
    content: 'The requested document was not found. Please check the URL and try again.',
    isDirectory: false
  }
}

async function getAllFilesAndDirs(dir: string, baseDir: string = ''): Promise<string[]> {
  try {
    const items = await fs.readdir(dir)
    let list: string[] = []

    for (const item of items) {
      const fullPath = path.join(dir, item)
      const relativePath = path.join(baseDir, item)
      
      try {
        const stats = await fs.stat(fullPath)
        if (stats.isDirectory()) {
          list.push(relativePath)
          list = list.concat(await getAllFilesAndDirs(fullPath, relativePath))
        } else if (/\.(md|mdx)$/i.test(item)) {
          list.push(relativePath.replace(/\.mdx?$/i, ''))
        }
      } catch (statError) {
        console.error(`Error reading stats for ${fullPath}:`, statError)
      }
    }

    return list
  } catch (error) {
    console.error('Error reading directory:', error)
    return []
  }
}

export async function getDocsTree() {
  const slugs = await getAllDocSlugs()
  const tree = {}

  slugs.forEach(slug => {
    const parts = slug.split('/')
    let current = tree

    parts.forEach((part, index) => {
      if (!current[part]) {
        current[part] = index === parts.length - 1 ? null : {}
      }
      current = current[part]
    })
  })

  return tree
}

async function findCloseMatch(pathParts: string[]): Promise<any> {
  const dirPath = path.join(docsDirectory, ...pathParts.slice(0, -1))
  const fileName = pathParts[pathParts.length - 1]

  try {
    const files = await fs.readdir(dirPath)
    const closeMatch = files.find(file => 
      file.toLowerCase().replace(/\.(md|mdx)$/, '') === fileName.toLowerCase()
    )

    if (closeMatch) {
      const matchPath = path.join(dirPath, closeMatch)
      const fileContents = await fs.readFile(matchPath, 'utf8')
      const { data, content } = matter(fileContents)

      return {
        slug: pathParts.join('/'),
        frontmatter: {
          title: data.title || fileName,
          ...data
        },
        content,
        isDirectory: false
      }
    }
  } catch (error) {
    console.error(`Error finding close match for ${fileName}:`, error)
  }

  return createNotFoundResponse(pathParts.join('/'))
}

