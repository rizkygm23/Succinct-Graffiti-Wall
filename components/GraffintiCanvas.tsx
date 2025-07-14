"use client"

import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from "react"
import { ReactSketchCanvas, type ReactSketchCanvasRef } from "react-sketch-canvas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Paintbrush, Minus, Plus } from "lucide-react"

// Base64 untuk kanvas kosong (1x1 piksel transparan)
const EMPTY_CANVAS_BASE64 =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="

// ------ tambahkan support forwardRef biar parent bisa export manual juga ------
const GraffitiCanvas = forwardRef(function GraffitiCanvas(
  { onDrawEnd }: { onDrawEnd: (data: { paths: any; base64: string }) => void },
  ref
) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null)

  const [strokeColor, setStrokeColor] = useState("black")
  const [strokeWidth, setStrokeWidth] = useState(3)

  // Biarkan parent bisa akses exportImage langsung via ref
  useImperativeHandle(ref, () => ({
    async exportImage() {
      return await canvasRef.current?.exportImage("png")
    }
  }))

  // Saat mount, kirim base64 kosong ke parent
  useEffect(() => {
    const initializeCanvas = async () => {
      if (canvasRef.current) {
        const initialBase64 = await canvasRef.current.exportImage("png")
        onDrawEnd({ paths: [], base64: initialBase64 || EMPTY_CANVAS_BASE64 })
      }
    }
    initializeCanvas()
  }, [onDrawEnd])

  // Panggil setiap coretan selesai
  const handleStrokeEnd = async () => {
  const paths = await canvasRef.current?.exportPaths()
  const base64 = await canvasRef.current?.exportImage("png")
  console.log("GraffitiCanvas: handleStrokeEnd! base64?", base64?.length, paths)
  if (paths && base64) {
    onDrawEnd({ paths, base64 })
  } else {
    onDrawEnd({ paths: [], base64: EMPTY_CANVAS_BASE64 })
  }
}

  const handleClearCanvas = async () => {
    await canvasRef.current?.clearCanvas()
    onDrawEnd({ paths: [], base64: EMPTY_CANVAS_BASE64 })
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden  bg-white shadow-md transition-all duration-300 hover:shadow-lg hover:border-primary/50 flex flex-col h-full">
      <ReactSketchCanvas
        ref={canvasRef}
        width="100%"
        height="100%"
        style={{ borderRadius: 8, background: "#fafafa" }}
        strokeWidth={strokeWidth}
        strokeColor={strokeColor}
        onStroke={handleStrokeEnd}
       
        allowOnlyPointerType="all"
       
      />
      <div className="flex flex-col sm:flex-row gap-3 p-3 border-t border-gray-200 bg-gray-50 items-center">
        <div className="flex items-center gap-2">
          <Paintbrush className="w-5 h-5 text-gray-600" />
          <Input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="w-12 h-8 p-0 border-none cursor-pointer"
            title="Pilih Warna Kuas"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <Minus className="w-4 h-4 text-gray-600" />
          <Slider
            min={1}
            max={20}
            step={1}
            value={[strokeWidth]}
            onValueChange={(val) => setStrokeWidth(val[0])}
            className="w-full max-w-xs"
            aria-label="Ukuran Kuas"
          />
          <Plus className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700 w-8 text-right">{strokeWidth}px</span>
        </div>
        <div className="flex gap-2 mt-2 sm:mt-0">
          <Button
            className="bg-primary text-white hover:bg-primary/90"
            onClick={() => canvasRef.current?.undo()}
          >Undo</Button>
          <Button
            className="bg-gray-500 text-white hover:bg-gray-600"
            onClick={handleClearCanvas}
          >Clear</Button>
        </div>
      </div>
    </div>
  )
})

export default GraffitiCanvas
