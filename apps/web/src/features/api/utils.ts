export function getTenantFromHost(host: string): string {
  if (process.env.NEXT_PUBLIC_STATIC_TENANT) return process.env.NEXT_PUBLIC_STATIC_TENANT

  return host.split('.').shift() ?? ''
}
