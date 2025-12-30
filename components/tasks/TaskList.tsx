"use client"

import { updateTaskStatus, deleteTask } from "@/app/actions/tasks"
import { useState, useEffect } from "react"

interface Task {
  id: string
  title: string
  status: string
  createdAt: Date
  dueDate: Date | null
}

interface TaskListProps {
  tasks: Task[]
  workspaceId: string
  onTaskUpdated: () => void
  onTaskDeleted: () => void
}

export default function TaskList({ tasks, workspaceId, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const [updating, setUpdating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const formatDate = (date: Date) => {
    if (!isClient) {
      return date.toISOString().split('T')[0]
    }
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const handleStatusChange = async (taskId: string, newStatus: "todo" | "done") => {
    setUpdating(taskId)
    try {
      const formData = new FormData()
      formData.append("taskId", taskId)
      formData.append("workspaceId", workspaceId)
      formData.append("status", newStatus)

      const result = await updateTaskStatus(formData)
      if (result.success) {
        onTaskUpdated()
      }
    } catch (error) {
      console.error("Failed to update task:", error)
    } finally {
      setUpdating(null)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return
    }

    setDeleting(taskId)
    try {
      const formData = new FormData()
      formData.append("taskId", taskId)
      formData.append("workspaceId", workspaceId)

      const result = await deleteTask(formData)
      if (result.success) {
        onTaskDeleted()
      }
    } catch (error) {
      console.error("Failed to delete task:", error)
    } finally {
      setDeleting(null)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No tasks yet. Create one to get started!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <ul className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <li key={task.id} className="p-4 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <input
                  type="checkbox"
                  checked={task.status === "done"}
                  onChange={(e) =>
                    handleStatusChange(task.id, e.target.checked ? "done" : "todo")
                  }
                  disabled={updating === task.id}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <div className="flex-1">
                  <span
                    className={`${
                      task.status === "done"
                        ? "line-through text-gray-500"
                        : "text-gray-900"
                    }`}
                  >
                    {task.title}
                  </span>
                  {task.dueDate && (
                    <span
                      className={`ml-2 text-xs ${
                        new Date(task.dueDate) < new Date() && task.status !== "done"
                          ? "text-red-600 font-semibold"
                          : "text-gray-500"
                      }`}
                    >
                      (Due: {formatDate(new Date(task.dueDate))})
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(new Date(task.createdAt))}
                </span>
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                disabled={deleting === task.id}
                className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
              >
                {deleting === task.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

