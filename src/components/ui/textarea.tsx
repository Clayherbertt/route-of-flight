import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  preserveFormatting?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, preserveFormatting = false, onPaste, ...props }, ref) => {
    const handlePaste = React.useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      if (preserveFormatting) {
        e.preventDefault()
        const paste = e.clipboardData.getData('text')
        const target = e.target as HTMLTextAreaElement
        const start = target.selectionStart
        const end = target.selectionEnd
        const value = target.value
        
        // Preserve the formatting by keeping line breaks and spacing
        const newValue = value.substring(0, start) + paste + value.substring(end)
        
        // Update the value
        target.value = newValue
        
        // Set cursor position after the pasted content
        const newCursorPos = start + paste.length
        target.setSelectionRange(newCursorPos, newCursorPos)
        
        // Trigger onChange event
        const event = new Event('input', { bubbles: true })
        target.dispatchEvent(event)
      }
      
      onPaste?.(e)
    }, [preserveFormatting, onPaste])

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        onPaste={handlePaste}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
