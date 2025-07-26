'use client'

import { createContext, PropsWithChildren, useContext, useLayoutEffect, useState } from 'react'

interface HeaderContext {
  title: string
  setTitle: (title: string)=> void
  backRoute?: string | boolean
  setBackRoute: (route: string | boolean)=> void
  showMap?: boolean
  setShowMap: (show: boolean)=> void
}

const headerContext = createContext({} as HeaderContext)

export function HeaderProvider({ children }: PropsWithChildren) {
  const [title, setTitle] = useState<string>('')
  const [backRoute, setBackRoute] = useState<string | boolean>()
  const [showMap, setShowMap] = useState(false)

  return (
    <headerContext.Provider value={{ title, setTitle, backRoute, setBackRoute, showMap, setShowMap }}>
      {children}
    </headerContext.Provider>
  )
}

export function HeaderConfig({ title, backRoute, showMap }: Omit<HeaderContext, `set${string}`>) {
  const ctx = useContext(headerContext)

  useLayoutEffect(() => {
    ctx.setTitle(title)
    ctx.setBackRoute(backRoute ?? false)
    ctx.setShowMap(showMap ?? false)
  }, [title, backRoute, ctx, showMap])

  return <></>
}

export function useHeader() {
  return useContext(headerContext) as Omit<HeaderContext, `set${string}`>
}
