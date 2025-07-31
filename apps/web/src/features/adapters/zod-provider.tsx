'use client'

import ptBR from '@repo/utils/zod-locales/pt-BR'
import { memo, PropsWithChildren } from 'react'
import z from 'zod'

function ZodProvider({ children }: PropsWithChildren) {
  z.config(ptBR())

  return children
}

export default memo(ZodProvider)
