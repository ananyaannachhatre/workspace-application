"use client"

import { signIn, useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "OAuthAccountNotLinked") {
      setError("This email is already registered with a password. Please sign in with your password instead.")
    } else if (errorParam === "OAuthSignin") {
      setError("Failed to sign in with OAuth provider. Please try again.")
    } else if (errorParam === "OAuthCallback") {
      setError("Error during OAuth callback. Please try again.")
    } else if (errorParam === "OAuthCreateAccount") {
      setError("Failed to create account with OAuth provider. Please try again.")
    } else if (errorParam) {
      setError("An error occurred during sign in. Please try again.")
    }
    
    if (session) {
      router.push("/workspaces")
    }
  }, [searchParams, session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "OAuthAccountNotLinked") {
          setError("This email is already registered with an OAuth provider. Please use that provider to sign in.")
        } else {
          setError("Invalid email or password")
        }
      } else if (result?.ok) {
        router.push("/workspaces")
      } else {
        setError("An error occurred. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleSocialSignIn = async (provider: string) => {
    setLoading(true)
    setError("")
    try {
      await signIn(provider, { 
        callbackUrl: "/workspaces",
      })
    } catch (err) {
      setError(`Failed to sign in with ${provider}`)
      setLoading(false)
    }
  }

  return (
    <div className="bg-white py-8 px-6 shadow rounded-lg">
      <div className="space-y-4">
        <button
          onClick={() => handleSocialSignIn("gitlab")}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="#FC6D26" d="M22.65 14.39L12 22.13 1.35 14.39a.849.849 0 0 1-.3-.94l1.22-3.78 2.44-7.51A.849.849 0 0 1 4.9 1.69a.849.849 0 0 1 .98.27L12 10.6l6.12-8.64a.849.849 0 0 1 .98-.27.849.849 0 0 1 .59.81l2.44 7.51 1.22 3.78a.849.849 0 0 1-.3.94z"/>
          </svg>
          Continue with GitLab
        </button>

        <button
          onClick={() => handleSocialSignIn("github")}
          disabled={loading}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Continue with GitHub
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
          </div>
        </div>
      </div>

      <form className="space-y-6 mt-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Email address"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <Link href="/auth/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </div>
  )
}

