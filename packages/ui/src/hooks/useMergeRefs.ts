import { Ref } from 'react'

export function useMergeRefs<E>(...refs: (Ref<E> | undefined)[]) {
  return (value: any) => {
    refs.forEach(ref => {
      if (!ref) return
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref && typeof ref === 'object' && 'current' in ref) {
        ref.current = value
      }
    })
  }
}
