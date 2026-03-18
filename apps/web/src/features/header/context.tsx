'use client'

import { createContext, PropsWithChildren, useContext, useLayoutEffect, useMemo, useState } from 'react'

interface HeaderContext {
  title: string
  setTitle: (title: string)=> void
  backRoute?: string | boolean
  setBackRoute: (route: string | boolean)=> void
  show?: 'map'[]
  hidden?: 'users'[]
  setShow: (show: HeaderContext['show'])=> void
  setHidden: (hidden: HeaderContext['hidden'])=> void
}

const headerContext = createContext({} as HeaderContext)

export function HeaderProvider({ children }: PropsWithChildren) {
  const [title, setTitle] = useState<string>('')
  const [backRoute, setBackRoute] = useState<string | boolean>()
  const [show, setShow] = useState<HeaderContext['show']>([])
  const [hidden, setHidden] = useState<HeaderContext['hidden']>([])

  return (
    <headerContext.Provider value={{ title, setTitle, backRoute, setBackRoute, show, setShow, hidden, setHidden }}>
      {children}
    </headerContext.Provider>
  )
}

export function HeaderConfig({ title, backRoute, show, hidden }: Omit<HeaderContext, `set${string}`>) {
  const ctx = useContext(headerContext)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedShow = useMemo(() => show ?? [], [JSON.stringify(show)])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedHidden = useMemo(() => hidden ?? [], [JSON.stringify(hidden)])

  useLayoutEffect(() => {
    ctx.setTitle(title)
    ctx.setBackRoute(backRoute ?? false)
    ctx.setShow(memoizedShow)
    ctx.setHidden(memoizedHidden)
  }, [title, backRoute, ctx, memoizedShow, memoizedHidden])

  return <></>
}

export function useHeader() {
  return useContext(headerContext) as Omit<HeaderContext, `set${string}`>
}
