'use client'

import ptBR from '@repo/utils/zod-locales/pt-BR'
import { PropsWithChildren, useMemo } from 'react'
import z from 'zod'

function ZodProvider({ children }: PropsWithChildren) {
  useMemo(() => {
    z.config(ptBR())
  }, [])

  return children
}

export default ZodProvider
