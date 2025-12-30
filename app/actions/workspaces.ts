"use server"

import { requireAuth, requireWorkspaceAccess } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required"),
})

export async function createWorkspace(formData: FormData) {
  try {
    const user = await requireAuth()
    
    if (!user || !user.id) {
      return { success: false, error: "User not found or invalid session" }
    }
    
    const data = createWorkspaceSchema.parse({
      name: formData.get("name"),
    })

    // Check if workspace with same name already exists for this user
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        name: data.name,
        ownerId: user.id,
      },
    })

    if (existingWorkspace) {
      return { success: false, error: "A workspace with this name already exists." }
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        ownerId: user.id,
      },
    })

    revalidatePath("/workspaces")
    return { success: true, workspace }
  } catch (error) {
    console.error("Error creating workspace:", error)
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    
    // Handle specific database errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint violated')) {
        return { success: false, error: "Invalid user session. Please sign out and sign in again." }
      }
      if (error.message.includes('Unique constraint')) {
        return { success: false, error: "A workspace with this name already exists." }
      }
      return { success: false, error: error.message }
    }
    
    return { success: false, error: "Failed to create workspace" }
  }
}

export async function getWorkspaces() {
  try {
    const user = await requireAuth()
    
    const workspaces = await prisma.workspace.findMany({
      where: {
        ownerId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { success: true, workspaces }
  } catch (error) {
    console.error("Error fetching workspaces:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch workspaces"
    return { success: false, error: errorMessage, workspaces: [] }
  }
}

export async function getWorkspace(workspaceId: string) {
  try {
    const user = await requireAuth()
    
    const workspace = await requireWorkspaceAccess(workspaceId, user.id)
    
    return { success: true, workspace }
  } catch (error) {
    return { success: false, error: "Workspace not found or access denied" }
  }
}

export async function deleteWorkspace(formData: FormData) {
  try {
    const user = await requireAuth()
    
    const workspaceId = formData.get("workspaceId") as string
    
    if (!workspaceId) {
      return { success: false, error: "Workspace ID is required" }
    }

    // Verify workspace access
    await requireWorkspaceAccess(workspaceId, user.id)

    // Delete workspace (tasks will be cascade deleted)
    await prisma.workspace.delete({
      where: {
        id: workspaceId,
      },
    })

    revalidatePath("/workspaces")
    return { success: true }
  } catch (error) {
    console.error("Error deleting workspace:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to delete workspace"
    return { success: false, error: errorMessage }
  }
}

