"use client"

import { createWorkspace } from "@/app/actions/workspaces"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function CreateWorkspaceForm() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)

      const result = await createWorkspace(formData)

      if (!result.success) {
        setError(result.error || "Failed to create workspace")
        setLoading(false)
        return
      }

      setName("")
      // No need to refresh - the workspace will appear in the list
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workspace name"
          required
          className="flex-1 px-4 py-2 border border-gray-300 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>
    </form>
  )
}

