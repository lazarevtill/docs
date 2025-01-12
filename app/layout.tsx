import './globals.css'
import './output.css'
import { Inter } from 'next/font/google'
import Sidebar from '../components/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Documentation Site',
  description: 'Generated from MD/MDX files',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased overflow-hidden`}>
        <div className="flex h-full flex-col lg:flex-row">
          <Sidebar />
          <div className="flex-1 overflow-auto scroll-area-elegant">
            <main className="relative">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}

