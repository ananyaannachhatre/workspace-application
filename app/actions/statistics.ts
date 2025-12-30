"use server"

import { requireAuth } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export async function getUserStatistics() {
  try {
    const user = await requireAuth()

    // Get all user's workspaces
    const workspaces = await prisma.workspace.findMany({
      where: {
        ownerId: user.id,
      },
      include: {
        tasks: true,
      },
    })

    // Calculate statistics
    const totalWorkspaces = workspaces.length
    const totalTasks = workspaces.reduce((sum, ws) => sum + ws.tasks.length, 0)
    const completedTasks = workspaces.reduce(
      (sum, ws) => sum + ws.tasks.filter((t) => t.status === "done").length,
      0
    )
    const pendingTasks = totalTasks - completedTasks

    // Tasks by status
    const tasksByStatus = {
      todo: pendingTasks,
      done: completedTasks,
    }

    // Tasks with due dates
    const tasksWithDueDates = workspaces.reduce(
      (sum, ws) => sum + ws.tasks.filter((t) => t.dueDate !== null).length,
      0
    )

    // Overdue tasks
    const now = new Date()
    const overdueTasks = workspaces.reduce(
      (sum, ws) =>
        sum +
        ws.tasks.filter(
          (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "done"
        ).length,
      0
    )

    // Tasks created in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const recentTasks = workspaces.reduce(
      (sum, ws) =>
        sum + ws.tasks.filter((t) => new Date(t.createdAt) >= sevenDaysAgo).length,
      0
    )

    // Workspaces created in last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentWorkspaces = workspaces.filter(
      (ws) => new Date(ws.createdAt) >= thirtyDaysAgo
    ).length

    // Tasks per workspace (average)
    const avgTasksPerWorkspace =
      totalWorkspaces > 0 ? (totalTasks / totalWorkspaces).toFixed(1) : "0"

    return {
      success: true,
      statistics: {
        totalWorkspaces,
        totalTasks,
        completedTasks,
        pendingTasks,
        tasksByStatus,
        tasksWithDueDates,
        overdueTasks,
        recentTasks,
        recentWorkspaces,
        avgTasksPerWorkspace,
      },
    }
  } catch (error) {
    console.error("Error fetching statistics:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch statistics",
      statistics: null,
    }
  }
}

