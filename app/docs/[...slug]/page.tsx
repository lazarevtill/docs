import { promises as fs } from 'fs'
import path from 'path'
import { MDXRemote } from 'next-mdx-remote/rsc'
import matter from 'gray-matter'
import Breadcrumbs from '@/components/Breadcrumbs'
import { Note } from '@/components/Note'
import { FolderIcon, FileIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface MDXComponentProps {
  [key: string]: unknown;
  children?: React.ReactNode;
}

const components: Record<string, React.ComponentType<MDXComponentProps>> = {
  h1: (props) => (
    <h1 
      className="scroll-m-20 text-4xl font-bold tracking-tight lg:text-5xl mb-6" 
      {...props} 
    />
  ),
  h2: (props) => (
    <h2 
      className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0 mt-10 mb-4" 
      {...props} 
    />
  ),
  h3: (props) => (
    <h3 
      className="scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4" 
      {...props} 
    />
  ),
  p: (props) => (
    <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />
  ),
  ul: (props) => (
    <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />
  ),
  ol: (props) => (
    <ol className="my-6 ml-6 list-decimal [&>li]:mt-2" {...props} />
  ),
  li: (props) => <li className="leading-7" {...props} />,
  a: (props) => (
    <a className="font-medium underline underline-offset-4" {...props} />
  ),
  pre: (props) => (
    <pre className="mb-4 mt-6 overflow-x-auto rounded-lg border bg-gray-900 p-4">
      <code className="relative rounded text-gray-100" {...props} />
    </pre>
  ),
  code: (props) => (
    <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm" {...props} />
  ),
  Note: (props: MDXComponentProps) => (
    <Note>{props.children}</Note>
  ),
  table: (props) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className="w-full" {...props} />
    </div>
  ),
  th: (props) => (
    <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
  ),
  td: (props) => (
    <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />
  ),
  img: (props) => (
    <Image 
      className="rounded-md border"
      src={props.src as string}
      alt={props.alt as string || ''} 
      width={500}
      height={300}
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />
  ),
}

const docsDirectory = path.join(process.cwd(), 'docs')

interface FolderStructure {
  files: string[];
  folders: string[];
}

async function getFolderStructure(slug: string[]): Promise<FolderStructure> {
  const fullPath = path.join(docsDirectory, ...slug)
  const structure: FolderStructure = { files: [], folders: [] }

  try {
    const items = await fs.readdir(fullPath, { withFileTypes: true })
    
    for (const item of items) {
      if (item.name.startsWith('.')) continue
      
      if (item.isDirectory()) {
        structure.folders.push(item.name)
      } else if (item.isFile() && /\.(md|mdx)$/i.test(item.name)) {
        structure.files.push(item.name.replace(/\.(md|mdx)$/i, ''))
      }
    }

    structure.folders.sort()
    structure.files.sort()
  } catch {
    console.error(`Error reading directory: ${fullPath}`)
  }

  return structure
}

interface DocContent {
  frontmatter: { [key: string]: unknown };
  content: string;
  structure: FolderStructure | null;
  isDirectory: boolean;
}

async function getDocContent(slug: string[]): Promise<DocContent> {
  const decodedSlug = slug.map(part => decodeURIComponent(part))
  const fullPath = path.join(docsDirectory, ...decodedSlug)
  
  const tryPaths = [
    fullPath,
    `${fullPath}.md`,
    `${fullPath}.mdx`,
    path.join(docsDirectory, ...decodedSlug.map(s => s.replace(/ /g, '-'))),
    path.join(docsDirectory, ...decodedSlug.map(s => s.replace(/ /g, '-'))) + '.md',
    path.join(docsDirectory, ...decodedSlug.map(s => s.replace(/ /g, '-'))) + '.mdx'
  ];

  let fileContent = null;

  for (const tryPath of tryPaths) {
    try {
      const stats = await fs.stat(tryPath);
      if (stats.isFile()) {
        fileContent = await fs.readFile(tryPath, 'utf8');
        break;
      } else if (stats.isDirectory()) {
        const structure = await getFolderStructure(decodedSlug);
        return {
          frontmatter: { title: decodedSlug[decodedSlug.length - 1] || 'Root' },
          content: 'This is a directory. Here are its contents:',
          structure,
          isDirectory: true
        };
      }
    } catch {
      continue;
    }
  }

  if (fileContent) {
    const { data, content: mdxContent } = matter(fileContent);
    return { 
      frontmatter: data, 
      content: mdxContent, 
      structure: null,
      isDirectory: false
    };
  }

  return {
    frontmatter: { title: 'Not Found' },
    content: 'The requested file or directory could not be found.',
    structure: null,
    isDirectory: false
  };
}

interface FolderStructureProps {
  structure: FolderStructure;
  params: { slug: string[] };
}

function FolderStructure({ structure, params }: FolderStructureProps) {
  if (!structure || (structure.files.length === 0 && structure.folders.length === 0)) return null;
  
  return (
    <div className="mt-8 p-4 border-t">
      <h3 className="text-lg font-semibold mb-4">Current Directory</h3>
      <ul className="space-y-2">
        {structure.folders.map((folder) => (
          <li key={folder} className="flex items-center text-sm">
            <FolderIcon className="h-4 w-4 mr-2 shrink-0" />
            <Link 
              href={`/docs/${params.slug.join('/')}/${folder}`}
              className="hover:text-primary transition-colors"
            >
              {folder}
            </Link>
          </li>
        ))}
        {structure.files.map((file) => (
          <li key={file} className="flex items-center text-sm">
            <FileIcon className="h-4 w-4 mr-2 shrink-0" />
            <Link 
              href={`/docs/${params.slug.join('/')}/${file}`}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {file}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default async function DocPage({ params }: { params: { slug: string[] } }) {
  const { frontmatter, content, structure, isDirectory } = await getDocContent(params.slug)

  return (
    <div className="min-h-screen w-full scroll-area-elegant">
      <div className="container max-w-4xl mx-auto py-4 px-6 lg:py-8 lg:px-8">
        <Breadcrumbs path={params.slug.join('/')} />
        <h1 className="text-4xl font-bold mb-6">{frontmatter.title as string}</h1>
        <article className="mx-auto w-full">
          <div className="prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none break-words">
            {!isDirectory ? (
              <MDXRemote 
                source={content} 
                components={components}
                options={{
                  parseFrontmatter: true,
                  mdxOptions: {
                    format: 'mdx'
                  }
                }}
              />
            ) : (
              <>
                <p className="text-muted-foreground mb-4">{content}</p>
                {structure && <FolderStructure structure={structure} params={params} />}
              </>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}