import React, { useMemo, useEffect } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: string
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder, 
  className,
  height = '120px'
}: RichTextEditorProps) {
  const modules = useMemo(() => ({
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['clean']
    ],
  }), [])

  const formats = [
    'bold', 'italic', 'underline',
    'list', 'bullet'
  ]

  useEffect(() => {
    // Inject custom CSS for the editor styling
    const style = document.createElement('style')
    style.textContent = `
      .ql-editor {
        min-height: ${height};
        font-family: inherit;
        font-size: 0.875rem;
        line-height: 1.25rem;
      }
      .ql-toolbar {
        border-top: 1px solid hsl(var(--border));
        border-left: 1px solid hsl(var(--border));
        border-right: 1px solid hsl(var(--border));
        border-radius: 0.375rem 0.375rem 0 0;
      }
      .ql-container {
        border-bottom: 1px solid hsl(var(--border));
        border-left: 1px solid hsl(var(--border));
        border-right: 1px solid hsl(var(--border));
        border-radius: 0 0 0.375rem 0.375rem;
      }
      .ql-editor.ql-blank::before {
        color: hsl(var(--muted-foreground));
        font-style: normal;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [height])

  return (
    <div className={cn("rich-text-editor", className)}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ minHeight: height }}
      />
    </div>
  )
}