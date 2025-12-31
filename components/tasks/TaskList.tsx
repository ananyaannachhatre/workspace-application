"use client"

import { updateTaskStatus, deleteTask } from "@/app/actions/tasks"
import { useState, useEffect } from "react"

interface Task {
  id: string
  title: string
  description: string
  status: string
  createdAt: Date
  dueDate: Date | null
  priority: number
  estimatedHours: number
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

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return 'text-red-600 bg-red-50'
      case 2: return 'text-orange-600 bg-orange-50'
      case 1: return 'text-yellow-600 bg-yellow-50'
      case 0: return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 3: return 'Urgent'
      case 2: return 'High'
      case 1: return 'Medium'
      case 0: return 'Low'
      default: return 'Unknown'
    }
  }

  const formatDate = (date: Date) => {
    if (!isClient) {
      return date.toISOString().split('T')[0]
    }
    // Manual formatting for dd/mm/yyyy to avoid locale issues
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
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

  // Sort tasks by due date (earliest first), tasks without due date at the end
  const sortedTasks = [...tasks].sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return 0
    if (!a.dueDate) return 1
    if (!b.dueDate) return -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  return (
    <div className="bg-white rounded-lg shadow">
      <ul className="divide-y divide-gray-200">
        {sortedTasks.map((task) => (
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
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`${
                        task.status === "done"
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {task.dueDate && (
                      <span
                        className={`${
                          new Date(task.dueDate) < new Date() && task.status !== "done"
                            ? "text-red-600 font-semibold"
                            : "text-gray-500"
                        }`}
                      >
                        Due: {formatDate(new Date(task.dueDate))}
                      </span>
                    )}
                    <span>
                      Est: {task.estimatedHours}h
                    </span>
                    <span>
                      Created: {formatDate(new Date(task.createdAt))}
                    </span>
                  </div>
                </div>
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

