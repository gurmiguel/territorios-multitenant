import { cx } from 'class-variance-authority'
import { ClassValue } from 'class-variance-authority/types'
import { extendTailwindMerge } from 'tailwind-merge'

type AdditionalClassGroupIDs = 'accessible-text' | 'accessible-bg'

export const twMerge = extendTailwindMerge<AdditionalClassGroupIDs>({
  extend: {
    classGroups: {
      'accessible-text': [{
        'accessible-text': [v => isNaN(v)],
      }],
      'accessible-bg': [{
        'accessible-bg': [v => isNaN(v)],
      }],
    },
    conflictingClassGroups: {
      'accessible-text': ['text-color'],
      'accessible-bg': ['bg-color'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(cx(...inputs))
}
