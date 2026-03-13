export enum AuthProviders {
  Email = 'email',
  Google = 'google',
  TFA = 'tfa',
}

export const SafeAuthProviders = new Set<AuthProviders>([
  AuthProviders.Google,
  AuthProviders.TFA,
])
