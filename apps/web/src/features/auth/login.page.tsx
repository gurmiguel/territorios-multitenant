'use client'

import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { MailIcon } from 'lucide-react'

import GoogleIcon from '~/assets/google-icon.svg'

import { emailLogin, initGoogleSignIn } from './login.actions'
import { HeaderConfig } from '../header/context'

export default function LoginPage() {
  return (
    <div className="absolute-fill flex flex-col items-center justify-center bg-black/50">
      <HeaderConfig title="Login" />
      <div className="flex flex-col bg-background p-4 shadow-xl rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-primary">Acesse com seu e-mail</h2>

        <form action={emailLogin} className="flex flex-col justify-center gap-4">
          <Input type="email" name="email"
            label="E-mail" leftIcon={<MailIcon />}
            required />

          <Button type="submit" size="sm" className="mx-auto px-4 rounded-md uppercase shadow-2xl font-normal">Acessar</Button>
        </form>

        <p className="text-secondary-foreground text-center my-3 font-semibold">ou entre com</p>

        <Button className="mx-auto bg-red-600 hover:bg-red-800/90 uppercase font-normal" onClick={() => initGoogleSignIn([window.location.origin, 'login/google-callback'].join('/'))}>
          <GoogleIcon className="size-4" />
          Google
        </Button>
      </div>
    </div>
  )
}
