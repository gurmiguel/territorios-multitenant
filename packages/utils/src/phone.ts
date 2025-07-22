export function formatPhoneNumber(phone: string): string {
  return phone.replace(/^(\d{2})(\d{4,5})(\d{4})$/, '$1 $2-$3')
}
