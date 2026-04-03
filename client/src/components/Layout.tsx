import Sidebar from './Sidebar'
import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  maxWidth?: string
}

export default function Layout({ children, maxWidth = 'max-w-6xl' }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#edf2f4]">
      <Sidebar />
      <div className="ml-0 md:ml-72 p-6 lg:p-10">
        <div className={`${maxWidth} mx-auto`}>
          {children}
        </div>
      </div>
    </div>
  )
}
