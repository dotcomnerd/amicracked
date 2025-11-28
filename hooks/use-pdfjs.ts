'use client'

import { useEffect, useState } from 'react'
import type * as PDFJS from 'pdfjs-dist/types/src/pdf'

type PrimitiveDependency = string | number | boolean | undefined | null

export const usePDFJS = (
  onLoad: (pdfjs: typeof PDFJS) => Promise<void>,
  deps: PrimitiveDependency[] = []
) => {
  const [pdfjs, setPDFJS] = useState<typeof PDFJS | null>(null)

  useEffect(() => {
    let isMounted = true
    import('pdfjs-dist/webpack.mjs').then((module) => {
      if (!isMounted) {
        return
      }
      setPDFJS(module)
    })
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!pdfjs) {
      return
    }

    let isActive = true
    ;(async () => {
      if (!isActive) {
        return
      }
      await onLoad(pdfjs)
    })()

    return () => {
      isActive = false
    }
  }, [pdfjs, onLoad, ...deps])
}
