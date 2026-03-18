'use client'

import { SearchIcon } from '@repo/ui/components/ui/icons'
import { Input } from '@repo/ui/components/ui/input'
import Fuse from 'fuse.js'
import { ChangeEvent, FormEvent, MouseEvent, useMemo, useRef, useState } from 'react'

import { User } from './types'
import { UserListingItem } from './user-listing-item'

interface Props {
  users: User[]
}

const SEARCH_DEBOUNCE_TIME = 500 // ms

export function UsersListing({ users }: Props) {
  const input = useRef<HTMLInputElement>(null)

  const index = useMemo(() => new Fuse(users, {
    ignoreDiacritics: true,
    minMatchCharLength: 2,
    keys: [{ weight: 1.5, name: 'name' }, 'email'],
  }), [users])

  const [searchTerm, setSearchTerm] = useState('')

  const items = useMemo(() => {
    const sanitizedTerm = searchTerm
      .replace(/[_+=!?:;,[\]*~\|^´`"'#$\)\(&%\\\/><]/g, '')
    if (sanitizedTerm.length < 2) return users
    return index.search(sanitizedTerm).map(x => x.item)
  }, [index, searchTerm, users])

  const debouncer = useRef<ReturnType<typeof setTimeout>>(null)

  function handleSearchInstant(e: MouseEvent | FormEvent<HTMLFormElement>) {
    e.preventDefault()

    debouncer.current && clearTimeout(debouncer.current)
    setSearchTerm(input.current?.value ?? '')
  }

  function handleDebouncedSearch(e: ChangeEvent<HTMLInputElement>) {
    const { value } = e.currentTarget

    debouncer.current && clearTimeout(debouncer.current)
    debouncer.current = setTimeout(() => setSearchTerm(value), SEARCH_DEBOUNCE_TIME)
  }

  return (
    <>
      <form className="mb-4" noValidate onSubmit={handleSearchInstant}>
        <Input
          ref={input}
          name="search-users"
          autoComplete="off"
          label="Buscar usuários"
          rightIcon={<SearchIcon className="cursor-pointer pointer-events-auto" onClick={handleSearchInstant} />}
          onChange={handleDebouncedSearch}
        />
      </form>

      <div className="flex flex-col gap-2">
        {items.length === 0 && <p className="text-center text-sm text-accent-foreground my-4">Nenhum usuário encontrado</p>}

        {items.map(item => <UserListingItem key={item.id} item={item} />)}
      </div>
    </>
  )
}
