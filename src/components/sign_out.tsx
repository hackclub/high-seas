'use client'

import { Button, buttonVariants } from './ui/button'

export default function SignOut() {
  const handleOnClick = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('cache.')) {
        localStorage.removeItem(key)
      }
    })
    sessionStorage.clear()
  }

  return (
    <a onClick={handleOnClick} href="/signout" className="block">
      <Button className={buttonVariants({ variant: 'outline' })}>
        Sign out
        <span className="hidden lg:block">&nbsp;of High Seas</span>
      </Button>
    </a>
  )
}
