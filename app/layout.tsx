import './globals.css'
import { Inter } from 'next/font/google'
import Sidebar from '../components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Documentation Site',
  description: 'Generated from MD/MDX files',
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params?: { slug?: string[] }
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <div className="flex h-full">
          <Sidebar />
          <div className="flex-1 overflow-hidden border-l">
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}

