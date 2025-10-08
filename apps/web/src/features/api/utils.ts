export function getTenantFromHost(host: string): string {
  return host.split('.').shift() ?? ''
}
