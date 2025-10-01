"use client"

import { Button } from "@/components/ui/button"
import { Edit3, Eye } from "lucide-react"
import { useEditing } from "./editing-context"

export function EditModeToggle() {
  const { isEditing, setIsEditing } = useEditing()

  return (
    <div className="fixed top-4 right-4 z-50">
      <Button
        onClick={() => setIsEditing(!isEditing)}
        variant={isEditing ? "default" : "outline"}
        size="sm"
        className="gap-2"
      >
        {isEditing ? (
          <>
            <Eye className="w-4 h-4" />
            Preview
          </>
        ) : (
          <>
            <Edit3 className="w-4 h-4" />
            Edit Mode
          </>
        )}
      </Button>
    </div>
  )
}
