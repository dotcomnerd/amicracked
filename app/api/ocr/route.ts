import { extractPdfText } from '@/lib/cache/pdf-extract'
import { NextRequest, NextResponse } from 'next/server'

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
    const fileBase64 = buffer.toString('base64')

    const result = await extractPdfText({ fileBase64 })

      console.log('Extracted PDF text:', `${result.text.substring(0, 200)}...`)

    return NextResponse.json({
      success: true,
        total_pages: result.pages,
        full_text: result.text,
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
