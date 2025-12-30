import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getUserStatistics } from "@/app/actions/statistics"
import StatisticsDashboard from "@/components/statistics/StatisticsDashboard"
import Link from "next/link"
import SignOutButton from "@/components/auth/SignOutButton"

export default async function StatisticsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  const result = await getUserStatistics()
  const stats = result.statistics

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Failed to load statistics</h1>
          <Link href="/workspaces" className="text-indigo-600 hover:text-indigo-500">
            Go back to workspaces
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/workspaces" className="text-indigo-600 hover:text-indigo-500">
                ← Back to Workspaces
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Statistics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user?.email}</span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <StatisticsDashboard statistics={stats} />
        </div>
      </main>
    </div>
  )
}

