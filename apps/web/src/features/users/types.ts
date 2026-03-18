export interface User {
  id: string
  email: string
  name: string
  permissions: string[]
  createdAt: string
  providers: { provider: string }[]
}
