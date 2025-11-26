import { useRef, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eraser } from 'lucide-react'

interface SignatureCanvasProps {
  value?: string // Base64 image data
  onChange?: (value: string) => void
  firstName?: string
  lastName?: string
}

export function SignatureCanvas({ value, onChange, firstName = '', lastName = '' }: SignatureCanvasProps) {
  const drawCanvasRef = useRef<HTMLCanvasElement>(null)
  const generateCanvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [activeTab, setActiveTab] = useState<'draw' | 'generate'>('draw')
  const [generatedName, setGeneratedName] = useState(`${firstName} ${lastName}`.trim())

  // Initialize draw canvas
  useEffect(() => {
    const canvas = drawCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 600
    canvas.height = 200

    // Set drawing style
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    // Load existing signature if provided
    if (value && activeTab === 'draw') {
      const img = new Image()
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      }
      img.src = value
    }
  }, [value, activeTab])

  // Drawing functions
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const canvas = drawCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = drawCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveSignature()
    }
  }

  const clearSignature = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    onChange?.('')
  }

  const saveSignature = () => {
    const canvas = drawCanvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL('image/png')
    onChange?.(dataURL)
  }

  // Generate signature function
  const generateSignature = async () => {
    const canvas = generateCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 600
    canvas.height = 200

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!generatedName.trim()) {
      onChange?.('')
      return
    }

    try {
      // Load cursive font (Dancing Script from Google Fonts)
      const font = new FontFace(
        'DancingScript',
        'url(https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_sxjLh2nE3W0xR_Lw.woff2)'
      )

      await font.load()
      document.fonts.add(font)
      
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 48px "Dancing Script", cursive'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      
      // Draw the name in the center
      ctx.fillText(generatedName, canvas.width / 2, canvas.height / 2)
    } catch (error) {
      // Fallback if font fails to load - use system cursive font
      console.warn('Failed to load custom font, using fallback:', error)
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 48px "Brush Script MT", "Lucida Handwriting", cursive'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(generatedName, canvas.width / 2, canvas.height / 2)
    }
    
    // Save the generated signature
    const dataURL = canvas.toDataURL('image/png')
    onChange?.(dataURL)
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'draw' | 'generate')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="draw">Draw Signature</TabsTrigger>
          <TabsTrigger value="generate">Generate Signature</TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="space-y-3">
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
            <canvas
              ref={drawCanvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full cursor-crosshair border border-border rounded bg-white"
              style={{ touchAction: 'none' }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearSignature}
              className="flex-1"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Clear
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="generate" className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="generated-name">Name</Label>
            <Input
              id="generated-name"
              value={generatedName}
              onChange={(e) => setGeneratedName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
            <canvas
              ref={generateCanvasRef}
              className="w-full border border-border rounded bg-white"
            />
          </div>
          <Button
            type="button"
            onClick={generateSignature}
            className="w-full"
            disabled={!generatedName.trim()}
          >
            Generate Signature
          </Button>
        </TabsContent>
      </Tabs>

      {value && (
        <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
          <p className="text-xs text-muted-foreground mb-2">Preview:</p>
          <img src={value} alt="Signature preview" className="max-w-full h-20 object-contain" />
        </div>
      )}
    </div>
  )
}

