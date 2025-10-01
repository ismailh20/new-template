"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface EditingContextType {
  isEditing: boolean
  setIsEditing: (value: boolean) => void
  elements: Record<string, string>
  updateElement: (id: string, value: string) => void
}

const EditingContext = createContext<EditingContextType | undefined>(undefined)

export function EditingProvider({ children }: { children: ReactNode }) {
  const [isEditing, setIsEditing] = useState(false)
  const [elements, setElements] = useState<Record<string, string>>({})

  const updateElement = (id: string, value: string) => {
    setElements((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  return (
    <EditingContext.Provider
      value={{
        isEditing,
        setIsEditing,
        elements,
        updateElement,
      }}
    >
      {children}
    </EditingContext.Provider>
  )
}

export function useEditing() {
  const context = useContext(EditingContext)
  if (context === undefined) {
    throw new Error("useEditing must be used within an EditingProvider")
  }
  return context
}
