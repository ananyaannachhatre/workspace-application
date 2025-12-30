"use client"

import { signOut } from "next-auth/react"

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ redirect: false })
    window.location.href = "/auth/signin"
  }

  return (
    <button
      onClick={handleSignOut}
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Sign out
    </button>
  )
}

