import React, { useMemo, useEffect, useRef } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: string
  key?: string | number
}

export function RichTextEditor({ 
  value, 
  onChange, 
  placeholder, 
  className,
  height = '120px',
  key
}: RichTextEditorProps) {
  const quillRef = useRef<ReactQuill>(null)
  
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

  // Force update ReactQuill when value changes externally
  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor()
      const currentContent = quill.root.innerHTML
      const normalizedValue = value || ''
      const isEmpty = !currentContent || currentContent === '<p><br></p>' || currentContent.trim() === '<p></p>'
      
      console.log('RichTextEditor: Checking content update', {
        currentContent: currentContent.substring(0, 50),
        newValue: normalizedValue.substring(0, 50),
        isEmpty,
        shouldUpdate: isEmpty || (normalizedValue && currentContent !== normalizedValue)
      })
      
      // Update if editor is empty and we have a value, or if values don't match
      if ((isEmpty && normalizedValue) || (normalizedValue && currentContent !== normalizedValue)) {
        console.log('RichTextEditor: Setting content to', normalizedValue.substring(0, 100))
        quill.root.innerHTML = normalizedValue
      }
    }
  }, [value])

  useEffect(() => {
    // Only inject styles once
    const existingStyle = document.getElementById('quill-custom-styles')
    if (!existingStyle) {
      const style = document.createElement('style')
      style.id = 'quill-custom-styles'
      style.textContent = `
        .ql-editor {
          min-height: 80px;
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
    }
  }, [])

  return (
    <div className={cn("rich-text-editor", className)}>
      <ReactQuill
        ref={quillRef}
        key={key}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
        style={{ minHeight: height }}
      />
    </div>
  )
}