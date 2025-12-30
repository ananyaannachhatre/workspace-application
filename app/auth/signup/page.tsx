import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import SignUpForm from "@/components/auth/SignUpForm"

export default async function SignUpPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/workspaces")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <SignUpForm />
      </div>
    </div>
  )
}

