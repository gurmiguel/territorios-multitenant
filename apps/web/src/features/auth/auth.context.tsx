'use client'

import { IPermission, Permission } from '@repo/utils/permissions/index'
import { createContext, PropsWithChildren, useCallback, useContext } from 'react'
import { ImmerReducer, useImmerReducer } from 'use-immer'

import { User } from './types'

interface AuthContext {
  state: {
    accessToken: string | null
    user: User | null
  }
  login(accessToken: string, user: User): void
  logout(): void
  can(...permission: IPermission[]): boolean
  cannot(...permission: IPermission[]): boolean
}

const authContext = createContext({} as AuthContext)

export function useAuth() {
  return useContext(authContext)
}

const actions = {
  login: (state, action: { accessToken: string, user: User }) => {
    state.accessToken = action.accessToken
    state.user = action.user
  },
  logout: state => {
    state.accessToken = null
    state.user = null
  },
} satisfies Record<string, ImmerReducer<AuthContext['state'], any>>

type ActionTypes = keyof typeof actions
interface Actions<K extends keyof typeof actions> {
  type: K
  payload: Parameters<typeof actions[K]>[1]
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useImmerReducer<AuthContext['state'], Actions<ActionTypes>>((state, action) => {
    actions[action.type](state, action.payload as any)
  }, {
    accessToken: null,
    user: null,
  })

  const login = useCallback<AuthContext['login']>((accessToken, user) => {
    dispatch({ type: 'login', payload: { accessToken, user } })
  }, [dispatch])

  const logout = useCallback<AuthContext['logout']>(() => {
    dispatch({ type: 'logout', payload: undefined })
  }, [dispatch])

  const can = useCallback<AuthContext['can']>((...permissions) => {
    return permissions.some(permission => state.user?.permissions?.includes(Permission(permission))) || false
  }, [state])

  const cannot = useCallback<AuthContext['cannot']>((...permissions) => {
    return permissions.every(permission => state.user?.permissions?.includes(Permission(permission)) ?? true) === false
  }, [state])

  return (
    <authContext.Provider value={{ state, login, logout, can, cannot }}>
      {children}
    </authContext.Provider>
  )
}
