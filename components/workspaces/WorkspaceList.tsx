"use client"

import Link from "next/link"
import { deleteWorkspace } from "@/app/actions/workspaces"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface Workspace {
  id: string
  name: string
  createdAt: Date
}

interface WorkspaceListProps {
  workspaces: Workspace[]
}

export default function WorkspaceList({ workspaces }: WorkspaceListProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (e: React.MouseEvent, workspaceId: string, workspaceName: string) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${workspaceName}"? This will also delete all tasks in this workspace.`)) {
      return
    }

    setDeleting(workspaceId)
    try {
      const formData = new FormData()
      formData.append("workspaceId", workspaceId)

      const result = await deleteWorkspace(formData)
      if (result.success) {
        // Remove workspace from local state instead of refreshing
        window.location.reload()
      } else {
        alert(result.error || "Failed to delete workspace")
      }
    } catch (error) {
      alert("An error occurred while deleting the workspace")
    } finally {
      setDeleting(null)
    }
  }

  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No workspaces yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {workspaces.map((workspace) => (
        <div
          key={workspace.id}
          className="relative bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
        >
          <Link
            href={`/workspaces/${workspace.id}`}
            className="block"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{workspace.name}</h3>
            <p className="text-sm text-gray-500">
              Created {new Date(workspace.createdAt).toLocaleDateString()}
            </p>
          </Link>
          <button
            onClick={(e) => handleDelete(e, workspace.id, workspace.name)}
            disabled={deleting === workspace.id}
            className="absolute top-4 right-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
          >
            {deleting === workspace.id ? "Deleting..." : "Delete"}
          </button>
        </div>
      ))}
    </div>
  )
}

