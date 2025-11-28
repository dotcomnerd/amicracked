'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { usePDFJS } from '@/hooks/use-pdfjs'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import type * as PDFJS from 'pdfjs-dist/types/src/pdf'
import { useCallback, useMemo, useState } from 'react'

const MAX_PREVIEW_PAGES = 3

type ResumePreviewProps = {
  file: File | null
}

export const ResumePreview = ({ file }: ResumePreviewProps) => {
  const [previews, setPreviews] = useState<string[]>([])
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)

  const renderPreview = useCallback(
    async (pdfjs: typeof PDFJS) => {
      if (!file) {
        setPreviews([])
        return
      }

      setIsRendering(true)
      setError(null)

      try {
        const arrayBuffer = await file.arrayBuffer()
        const pdfDocument = await pdfjs.getDocument({ data: arrayBuffer }).promise
        const pages: string[] = []

        const previewCount = Math.min(pdfDocument.numPages, MAX_PREVIEW_PAGES)

        for (let pageNumber = 1; pageNumber <= previewCount; pageNumber += 1) {
          const page = await pdfDocument.getPage(pageNumber)
          const viewport = page.getViewport({ scale: 2.5 })
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          if (!context) {
            continue
          }

          canvas.width = viewport.width
          canvas.height = viewport.height

          await page.render({ canvas, canvasContext: context, viewport }).promise
          pages.push(canvas.toDataURL('image/png'))
        }

        setPreviews(pages)
      } catch (err) {
        console.error('Unable to render PDF preview:', err)
        setError('Unable to render PDF preview')
        setPreviews([])
      } finally {
        setIsRendering(false)
      }
    },
    [file]
  )

  usePDFJS(renderPreview, [file ? file.name : ''])

  const handleOpenDialog = useCallback(() => {
    setCurrentPage(0)
    setIsDialogOpen(true)
  }, [])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(0, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(previews.length - 1, prev + 1))
  }

  const previewButton = useMemo(() => {
    if (!file || isRendering || previews.length === 0) {
      return null
    }

    return (
      <Button
        onClick={handleOpenDialog}
        variant="outline"
        className="w-full"
      >
        <FileText className="h-4 w-4 mr-2" />
        View PDF Preview
      </Button>
    )
  }, [file, isRendering, previews.length, handleOpenDialog])

  if (!file) {
    return null
  }

  return (
    <>
      <div className="space-y-2">
        {isRendering && (
          <div className="text-xs text-muted-foreground">Rendering preview...</div>
        )}
        {error && (
          <div className="text-xs text-destructive">{error}</div>
        )}
        {previewButton}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              PDF Preview
              {previews.length > 1 && (
                <span className="text-muted-foreground font-normal ml-2">
                  Page {currentPage + 1} of {previews.length}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          {previews.length > 0 && (
            <div className="flex flex-col">
              <div className="flex items-center justify-center gap-4 p-4 bg-muted/20">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 0}
                  aria-label="Previous page"
                  className="shrink-0"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <ScrollArea className="flex-1 max-h-[80vh]">
                  <div className="flex justify-center items-start p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previews[currentPage]}
                      alt={`PDF page ${currentPage + 1} full view`}
                      className="w-auto h-auto max-h-[80vh] rounded-lg border-2 border-border shadow-lg bg-background object-contain"
                    />
                  </div>
                </ScrollArea>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNextPage}
                  disabled={currentPage === previews.length - 1}
                  aria-label="Next page"
                  className="shrink-0"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              {previews.length > 1 && (
                <div className="px-6 pb-6 pt-4 border-t bg-muted/10">
                  <div className="flex justify-center items-center gap-3">
                    {previews.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index)}
                        className={`rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                          index === currentPage
                            ? 'w-10 h-2 bg-primary'
                            : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                        }`}
                        aria-label={`Go to page ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
