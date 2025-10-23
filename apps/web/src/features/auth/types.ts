export interface User {
  username: string
  permissions: string[]
}

export type ActionResponse = null | {
  success: true
  data: { access_token: string, refresh_token: string }
  error?: never
  errorType?: never
  persist?: never
} | {
  success?: false
  error: unknown
  data?: never
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
