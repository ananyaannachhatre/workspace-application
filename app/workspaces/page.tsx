import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getWorkspaces } from "@/app/actions/workspaces"
import WorkspaceList from "@/components/workspaces/WorkspaceList"
import CreateWorkspaceForm from "@/components/workspaces/CreateWorkspaceForm"
import SignOutButton from "@/components/auth/SignOutButton"
import Link from "next/link"

export default async function WorkspacesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  const result = await getWorkspaces()
  const workspaces = result.workspaces || []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Workspaces</h1>
              <Link
                href="/statistics"
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
              >
                Statistics
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user?.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Workspace</h2>
            <CreateWorkspaceForm />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Workspaces</h2>
            <WorkspaceList workspaces={workspaces} />
          </div>
        </div>
      </main>
    </div>
  )
}

