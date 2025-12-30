import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getWorkspace } from "@/app/actions/workspaces"
import { getTasks } from "@/app/actions/tasks"
import WorkspaceTasks from "@/components/tasks/WorkspaceTasks"
import Link from "next/link"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function WorkspaceDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/auth/signin")
  }

  const workspaceResult = await getWorkspace(params.id)
  const tasksResult = await getTasks(params.id)

  if (!workspaceResult.success || !workspaceResult.workspace) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Workspace not found</h1>
          <Link href="/workspaces" className="text-indigo-600 hover:text-indigo-500">
            Go back to workspaces
          </Link>
        </div>
      </div>
    )
  }

  const workspace = workspaceResult.workspace
  const tasks = tasksResult.tasks || []

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/workspaces" className="text-indigo-600 hover:text-indigo-500">
                ← Back to Workspaces
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">{workspace.name}</h1>
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
          <WorkspaceTasks workspaceId={workspace.id} initialTasks={tasks} />
        </div>
      </main>
    </div>
  )
}

