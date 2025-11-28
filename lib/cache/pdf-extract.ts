'use cache'

import { cacheLife } from 'next/cache'

type Pdf2JsonModule = typeof import('pdf2json')

const decodeChunkText = (value: string | undefined): string => {
  if (!value) return ''
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

const decodePercentSequences = (value: string): string => {
  return value.replace(/%([0-9A-Fa-f]{2})/g, (match, hex) => {
    const code = parseInt(hex, 16)
    return Number.isNaN(code) ? match : String.fromCharCode(code)
  })
}

const normalizeRawText = (text: string): string => {
  return decodePercentSequences(text)
    .replace(/\r\n/g, '\n')
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

const buildTextFromPages = (pages: Array<{ Texts?: Array<{ x?: number; y?: number; w?: number; sw?: number; R?: Array<{ T?: string }> }> }>): string => {
  const pageTexts = pages.map((page) => {
    const pageTexts = page?.Texts ?? []
    if (pageTexts.length === 0) {
      return ''
    }

    const textItems = pageTexts
      .map((textItem) => {
        const chunks = textItem?.R ?? []
        const text = chunks.map((chunk) => decodeChunkText(chunk?.T)).join('')
        const x = typeof textItem.x === 'number' ? textItem.x : 0
        const y = typeof textItem.y === 'number' ? textItem.y : 0
        const w = typeof textItem.w === 'number' ? textItem.w : 0
        const sw = typeof textItem.sw === 'number' ? textItem.sw : 0

        return {
          text,
          x,
          y,
          w,
          sw,
        }
      })
      .filter((item) => item.text.trim().length > 0)

    if (textItems.length === 0) {
      return ''
    }

    const LINE_HEIGHT_THRESHOLD = 1.2
    const SPACE_THRESHOLD_MULTIPLIER = 1.2

    textItems.sort((a, b) => {
      const yDiff = Math.abs(a.y - b.y)
      if (yDiff > LINE_HEIGHT_THRESHOLD) {
        return a.y - b.y
      }
      return a.x - b.x
    })

    let result = ''
    let lastY = textItems[0].y
    let lastXEnd = textItems[0].x + textItems[0].w
    const spaceWidths = textItems.map(item => item.sw).filter(sw => sw > 0)
    const avgSpaceWidth = spaceWidths.length > 0
      ? spaceWidths.reduce((a, b) => a + b, 0) / spaceWidths.length
      : 3

    for (let i = 0; i < textItems.length; i++) {
      const item = textItems[i]
      const yDiff = Math.abs(item.y - lastY)
      const xGap = item.x - lastXEnd

      if (i > 0) {
        if (yDiff > LINE_HEIGHT_THRESHOLD) {
          result += '\n'
        } else if (xGap > avgSpaceWidth * SPACE_THRESHOLD_MULTIPLIER) {
          const spacesNeeded = Math.max(1, Math.round(xGap / avgSpaceWidth))
          result += ' '.repeat(Math.min(spacesNeeded, 5))
        } else if (xGap > 0) {
          result += ' '
        }
      }

      result += item.text
      lastY = item.y
      lastXEnd = item.x + item.w
    }

    return result.trim()
  })

  return pageTexts.filter(Boolean).join('\n\n')
}

async function extractTextFromBuffer(buffer: Buffer): Promise<{ text: string; pages: number }> {
  const pdf2jsonModule: Pdf2JsonModule = await import('pdf2json')
  const PDFParser = (pdf2jsonModule as unknown as { default?: unknown }).default ?? pdf2jsonModule

  return new Promise<{ text: string; pages: number }>((resolve, reject) => {
    const parser = new (PDFParser as new () => {
      on: (event: string, cb: (data: unknown) => void) => void
      parseBuffer: (buffer: Buffer) => void
      getRawTextContent?: () => string
    })()

    parser.on('pdfParser_dataError', (error: unknown) => {
      reject((error as { parserError?: Error })?.parserError || error)
    })

    parser.on('pdfParser_dataReady', (pdfData: unknown) => {
      const data = pdfData as {
        Pages?: Array<{
          Texts?: Array<{
            x?: number
            y?: number
            w?: number
            sw?: number
            R?: Array<{ T?: string }>
          }>
        }>
      }
      const pages = data?.Pages ?? []

      if (pages.length === 0) {
        resolve({ text: '', pages: 0 })
        return
      }

      const rawTextContent = parser.getRawTextContent?.()
      const text = rawTextContent
        ? normalizeRawText(rawTextContent)
        : buildTextFromPages(pages)

      resolve({
        text,
        pages: pages.length,
      })
    })

    parser.parseBuffer(buffer)
  })
}

export async function extractPdfText({ fileBase64 }: { fileBase64: string }) {
  const buffer = Buffer.from(fileBase64, 'base64')

  return extractTextFromBuffer(buffer)
}
