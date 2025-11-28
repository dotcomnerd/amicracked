import { NextRequest, NextResponse } from 'next/server'
import { extractImages, extractText, getDocumentProxy, renderPageAsImage } from 'unpdf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    console.log('File:', file)

    if (!file) {
      console.log('No file uploaded')
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!file.type.includes('pdf')) {
      console.log('File is not a PDF')
      return NextResponse.json(
        { error: 'File must be a PDF' },
        { status: 400 }
      )
    }

    const arrayBuffer = await file.arrayBuffer()
    const pdfData = new Uint8Array(arrayBuffer)

    const pdf = await getDocumentProxy(pdfData)

    const [textResult, firstPageImage] = await Promise.all([
      extractText(pdf, { mergePages: true }),
      renderPageAsImage(pdf, 1, {
        canvasImport: () => import('@napi-rs/canvas'),
        scale: 1.5,
        toDataURL: true,
      }).catch(() => null),
    ])

    const allImages: Array<{ page: number; index: number; base64: string; width: number; height: number }> = []

    for (let pageNum = 1; pageNum <= textResult.totalPages; pageNum++) {
      try {
        const pageImages = await extractImages(pdf, pageNum)

        const { createCanvas } = await import('@napi-rs/canvas')

        for (let imgIndex = 0; imgIndex < pageImages.length; imgIndex++) {
          const img = pageImages[imgIndex]
          const canvas = createCanvas(img.width, img.height)
          const ctx = canvas.getContext('2d')
          const imageData = ctx.createImageData(img.width, img.height)
          const pixels = img.width * img.height

          if (img.channels === 4) {
            imageData.data.set(img.data)
          } else if (img.channels === 3) {
            for (let i = 0; i < pixels; i++) {
              const srcIdx = i * 3
              const dstIdx = i * 4
              imageData.data[dstIdx] = img.data[srcIdx]
              imageData.data[dstIdx + 1] = img.data[srcIdx + 1]
              imageData.data[dstIdx + 2] = img.data[srcIdx + 2]
              imageData.data[dstIdx + 3] = 255
            }
          } else if (img.channels === 1) {
            for (let i = 0; i < pixels; i++) {
              const srcIdx = i
              const dstIdx = i * 4
              const gray = img.data[srcIdx]
              imageData.data[dstIdx] = gray
              imageData.data[dstIdx + 1] = gray
              imageData.data[dstIdx + 2] = gray
              imageData.data[dstIdx + 3] = 255
            }
          }

          ctx.putImageData(imageData, 0, 0)
          const base64 = canvas.toDataURL('image/png').split(',')[1]

          allImages.push({
            page: pageNum,
            index: imgIndex + 1,
            base64,
            width: img.width,
            height: img.height,
          })
        }
      } catch (error) {
        console.error(`Error extracting images from page ${pageNum}:`, error)
      }
    }

    const screenshotBase64 = firstPageImage
      ? typeof firstPageImage === 'string'
        ? firstPageImage.split(',')[1]
        : Buffer.from(firstPageImage).toString('base64')
      : allImages.find(img => img.page === 1)?.base64 || null

    console.log('Extracted PDF text:', `${textResult.text.substring(0, 200)}...`)
    console.log('Extracted images:', allImages.length)

    return NextResponse.json({
      success: true,
      total_pages: textResult.totalPages,
      full_text: textResult.text,
      screenshot: screenshotBase64,
      images: allImages.map(img => ({
        page: img.page,
        index: img.index,
        base64: img.base64,
        width: img.width,
        height: img.height,
      })),
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
