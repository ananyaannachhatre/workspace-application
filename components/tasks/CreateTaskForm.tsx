"use client"

import { createTask } from "@/app/actions/tasks"
import { useState } from "react"

interface CreateTaskFormProps {
  workspaceId: string
  onTaskCreated: () => void
}

export default function CreateTaskForm({ workspaceId, onTaskCreated }: CreateTaskFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validate due date is provided and not in the past
      if (!dueDate) {
        setError("Due date required")
        setLoading(false)
        return
      }

      const selectedDate = new Date(dueDate)
      const todayDate = new Date()
      todayDate.setHours(0, 0, 0, 0)
      
      if (selectedDate < todayDate) {
        setError("Due date cannot be in the past. Please select today or a future date.")
        setLoading(false)
        return
      }

      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("workspaceId", workspaceId)
      formData.append("dueDate", dueDate)

      const result = await createTask(formData)

      if (!result.success) {
        setError(result.error || "Failed to create task")
        setLoading(false)
        return
      }

      setTitle("")
      setDescription("")
      setDueDate("")
      onTaskCreated()
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-6">
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the task and its requirements (e.g., complexity, dependencies, resources needed)"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        
        <div className="flex gap-4">
          <div className="flex flex-col">
            <label htmlFor="dueDate" className="text-xs text-gray-600 mb-1">Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={today}
              required
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Task"}
        </button>
      </div>
    </form>
  )
}

