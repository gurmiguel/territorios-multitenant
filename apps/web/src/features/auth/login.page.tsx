'use client'

import { OverlayLoading } from '@repo/ui/components/loading'
import { Button } from '@repo/ui/components/ui/button'
import { Input } from '@repo/ui/components/ui/input'
import { MailIcon, UserIcon } from 'lucide-react'
import { useActionState } from 'react'

import GoogleIcon from '~/assets/google-icon.svg'

import { emailLogin, initGoogleSignIn } from './login.actions'
import { ActionResponse, AuthErrorType } from './types'
import { HeaderConfig } from '../header/context'

export default function LoginPage() {
  const [state, dispatchLogin, isSubmitting] = useActionState<ActionResponse, FormData>(emailLogin, null)

  return (
    <div className="absolute-fill flex flex-col items-center justify-center bg-black/50">
      <HeaderConfig title="Login" />
      <div className="relative flex flex-col bg-background p-4 shadow-xl rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-primary">Acesse com seu e-mail</h2>

        <form action={dispatchLogin} className="flex flex-col justify-center gap-4">
          {isSubmitting && <OverlayLoading />}

          <Input type="email" name="email"
            label="E-mail" leftIcon={<MailIcon />}
            defaultValue={state?.persist?.email}
            required />

          {state?.errorType === AuthErrorType.UserNotExists && (
            <Input type="text" name="name"
              label="Nome" leftIcon={<UserIcon />}
              defaultValue={state?.persist?.name}
              autoFocus
              required />
          )}

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
