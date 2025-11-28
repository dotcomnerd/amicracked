import { NextRequest, NextResponse } from 'next/server'

type Pdf2JsonModule = typeof import('pdf2json')

const decodeText = (value: string | undefined): string => {
    if (!value) return ''
    try {
        return decodeURIComponent(value)
    } catch {
        return value
    }
}

const extractTextWithPdf2Json = async (buffer: Buffer) => {
    const pdf2jsonModule: Pdf2JsonModule = await import('pdf2json')
    const PDFParser = (pdf2jsonModule as unknown as { default?: unknown }).default ?? pdf2jsonModule

    return new Promise<{ text: string; pages: number }>((resolve, reject) => {
        const parser = new (PDFParser as new () => {
            on: (event: string, cb: (data: unknown) => void) => void
            parseBuffer: (buffer: Buffer) => void
        })()

        parser.on('pdfParser_dataError', (error: unknown) => {
            reject((error as { parserError?: Error })?.parserError || error)
        })

        parser.on('pdfParser_dataReady', (pdfData: unknown) => {
            const data = pdfData as { Pages?: Array<{ Texts?: Array<{ R?: Array<{ T?: string }> }> }> }
            const pages = data?.Pages ?? []

            const text = pages
                .map((page) => {
                    const pageTexts = page?.Texts ?? []
                    return pageTexts
                        .map((textItem) => {
                            const chunks = textItem?.R ?? []
                            return chunks.map((chunk) => decodeText(chunk?.T)).join('')
                        })
                        .join(' ')
                        .trim()
                })
                .filter(Boolean)
                .join('\n\n')

            resolve({
                text,
                pages: pages.length,
            })
        })

        parser.parseBuffer(buffer)
    })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

      if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

      if (!file.type.includes('pdf')) {
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)

      const result = await extractTextWithPdf2Json(buffer)

      console.log('Extracted PDF text:', `${result.text.substring(0, 200)}...`)

    return NextResponse.json({
      success: true,
        total_pages: result.pages,
        full_text: result.text,
        screenshot: null,
        images: [],
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process PDF' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'OCR API is running',
  })
}
