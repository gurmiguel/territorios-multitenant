export interface User {
  username: string
  permissions: string[]
}

export type ActionResponse = null | {
  success: true
  error?: never
  errorType?: never
  persist?: never
} | {
  success?: false
  error: unknown
  errorType: AuthErrorType
  persist: {
    email?: string
    name?: string
  }
}

export type AuthResponse = Record<`${'access' | 'refresh'}_token`, string>

export enum AuthErrorType {
  Unknown = -1,
  UserNotExists,
}
