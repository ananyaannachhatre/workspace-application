"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import CreateTaskForm from "./CreateTaskForm"
import TaskList from "./TaskList"
import GanttChart from "./GanttChart"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  createdAt: Date
  dueDate: Date | null
  priority: number
  estimatedHours: number | null
}

interface WorkspaceTasksProps {
  workspaceId: string
  initialTasks: Task[]
}

export default function WorkspaceTasks({ workspaceId, initialTasks }: WorkspaceTasksProps) {
  const router = useRouter()
  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  useEffect(() => {
    setTasks(initialTasks)
  }, [initialTasks])

  const refreshTasks = () => {
    // Use window reload for faster refresh instead of router.refresh
    window.location.reload()
  }

  const handleTaskCreated = () => {
    refreshTasks()
  }

  const handleTaskUpdated = () => {
    refreshTasks()
  }

  const handleTaskDeleted = () => {
    refreshTasks()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tasks</h2>
        <CreateTaskForm workspaceId={workspaceId} onTaskCreated={handleTaskCreated} />
      </div>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <p className="text-sm text-blue-700">
          <strong>Note:</strong> Below are the tasks to be completed. Once a task is finished, click on the checkbox to mark it as "done". Tasks are automatically prioritized based on due date and description analysis.
        </p>
      </div>

      <div>
        <TaskList
          tasks={tasks}
          workspaceId={workspaceId}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      </div>

      <div>
        <GanttChart tasks={tasks} />
      </div>
    </div>
  )
}

