import React from 'react'

interface NoteProps {
  children: React.ReactNode
}

export function Note({ children }: NoteProps) {
  return (
    <div className="my-6 rounded-lg border bg-muted px-4 py-3">
      <div className="flex flex-col space-y-2">
        <p className="font-medium">Note</p>
        <div className="text-muted-foreground">
          {children}
        </div>
      </div>
    </div>
  )
}

