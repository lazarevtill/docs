import React from 'react'

interface CodeProps extends React.HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode
}

export function Code({ children, className, ...props }: CodeProps) {
  return (
    <pre className={`bg-gray-900 text-gray-100 ${className}`} {...props}>
      {children}
    </pre>
  )
}

