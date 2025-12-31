"use server"

import { requireAuth, requireWorkspaceAccess } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { analyzeTaskPriority } from "@/lib/taskScheduler"

const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  dueDate: z
    .string()
    .min(1, "Due date required")
    .refine(
      (val) => {
        if (!val || val === "") return false
        const date = new Date(val)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        date.setHours(0, 0, 0, 0)
        return date >= today
      },
      {
        message: "Due date cannot be in the past",
      }
    )
    .transform((val) => {
      if (!val || val === "") return undefined
      return new Date(val)
    }),
})

const updateTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
  status: z.enum(["todo", "done"]),
})

const deleteTaskSchema = z.object({
  taskId: z.string().min(1, "Task ID is required"),
  workspaceId: z.string().min(1, "Workspace ID is required"),
})

export async function createTask(formData: FormData) {
  try {
    const user = await requireAuth()
    
    const data = createTaskSchema.parse({
      title: formData.get("title"),
      description: formData.get("description"),
      workspaceId: formData.get("workspaceId"),
      dueDate: formData.get("dueDate"),
    })

    // Verify workspace access
    await requireWorkspaceAccess(data.workspaceId, user.id)

    // Check if task with same title already exists in this workspace
    const existingTask = await prisma.task.findFirst({
      where: {
        title: data.title,
        workspaceId: data.workspaceId,
      },
    })

    if (existingTask) {
      return { success: false, error: "A task with this name already exists in this workspace." }
    }

    // Analyze task priority and estimate hours
    const analysis = analyzeTaskPriority(data.title, data.description || "", data.dueDate || null)

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        workspaceId: data.workspaceId,
        status: "todo",
        dueDate: data.dueDate,
        priority: analysis.priority,
        estimatedHours: analysis.estimatedHours,
      },
    })

    revalidatePath(`/workspaces/${data.workspaceId}`)
    return { success: true, task }
  } catch (error) {
    console.error("Error creating task:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return { success: false, error: "A task with this name already exists in this workspace." }
      }
      return { success: false, error: error.message }
    }
    
    return { success: false, error: "Failed to create task" }
  }
}

export async function updateTaskStatus(formData: FormData) {
  try {
    const user = await requireAuth()
    
    const data = updateTaskSchema.parse({
      taskId: formData.get("taskId"),
      workspaceId: formData.get("workspaceId"),
      status: formData.get("status"),
    })

    // Verify workspace access
    await requireWorkspaceAccess(data.workspaceId, user.id)

    const task = await prisma.task.update({
      where: {
        id: data.taskId,
      },
      data: {
        status: data.status,
      },
    })

    revalidatePath(`/workspaces/${data.workspaceId}`)
    return { success: true, task }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to update task" }
  }
}

export async function deleteTask(formData: FormData) {
  try {
    const user = await requireAuth()
    
    const data = deleteTaskSchema.parse({
      taskId: formData.get("taskId"),
      workspaceId: formData.get("workspaceId"),
    })

    // Verify workspace access
    await requireWorkspaceAccess(data.workspaceId, user.id)

    await prisma.task.delete({
      where: {
        id: data.taskId,
      },
    })

    revalidatePath(`/workspaces/${data.workspaceId}`)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete task" }
  }
}

export async function getTasks(workspaceId: string) {
  try {
    const user = await requireAuth()
    
    // Verify workspace access
    await requireWorkspaceAccess(workspaceId, user.id)

    const tasks = await prisma.task.findMany({
      where: {
        workspaceId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, tasks }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to fetch tasks", tasks: [] }
  }
}

