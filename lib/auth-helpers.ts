import { getServerSession } from "next-auth"
import { authOptions } from "./auth"
import { prisma } from "./prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return null
  }
  
  // Get the actual user from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })
  
  return user
}

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error("Unauthorized")
  }
  return user
}

export async function requireWorkspaceAccess(workspaceId: string, userId: string) {
  const workspace = await prisma.workspace.findFirst({
    where: {
      id: workspaceId,
      ownerId: userId,
    },
  })

  if (!workspace) {
    throw new Error("Workspace not found or access denied")
  }

  return workspace
}

