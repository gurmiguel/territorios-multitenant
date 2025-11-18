import { useParams as useRouterParams } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

/**
 * @param match Use a regular expression to match the desired part of the URL with a single group
 */
export function useParams(match: RegExp, paramName: string) {
  const params = useRouterParams()

  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    setRendered(true)
  }, [])

  return useMemo(() => {
    if (!rendered) return params[paramName]?.toString()

    return window.location.pathname.match(match)?.[1]
  }, [match, paramName, params, rendered])
}
