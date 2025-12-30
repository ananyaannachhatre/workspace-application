"use client"

interface Statistics {
  totalWorkspaces: number
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  tasksByStatus: {
    todo: number
    done: number
  }
  tasksWithDueDates: number
  overdueTasks: number
  recentTasks: number
  recentWorkspaces: number
  avgTasksPerWorkspace: string
}

interface StatisticsDashboardProps {
  statistics: Statistics
}

export default function StatisticsDashboard({ statistics }: StatisticsDashboardProps) {
  const completionRate =
    statistics.totalTasks > 0
      ? ((statistics.completedTasks / statistics.totalTasks) * 100).toFixed(1)
      : "0"

  const todoPercentage =
    statistics.totalTasks > 0
      ? ((statistics.tasksByStatus.todo / statistics.totalTasks) * 100).toFixed(1)
      : "0"
  const donePercentage =
    statistics.totalTasks > 0
      ? ((statistics.tasksByStatus.done / statistics.totalTasks) * 100).toFixed(1)
      : "0"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Activity Overview</h2>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workspaces"
          value={statistics.totalWorkspaces}
          icon="📁"
          color="blue"
        />
        <StatCard
          title="Total Tasks"
          value={statistics.totalTasks}
          icon="✓"
          color="green"
        />
        <StatCard
          title="Completed Tasks"
          value={statistics.completedTasks}
          icon="✅"
          color="emerald"
        />
        <StatCard
          title="Pending Tasks"
          value={statistics.pendingTasks}
          icon="⏳"
          color="orange"
        />
      </div>

      {/* Progress Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Completion Rate</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Completion Rate</span>
              <span className="font-semibold">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tasks by Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">To Do</span>
                <span className="font-semibold">
                  {statistics.tasksByStatus.todo} ({todoPercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full"
                  style={{ width: `${todoPercentage}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Done</span>
                <span className="font-semibold">
                  {statistics.tasksByStatus.done} ({donePercentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full"
                  style={{ width: `${donePercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasks with Due Dates</span>
              <span className="font-semibold text-gray-900">{statistics.tasksWithDueDates}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Overdue Tasks</span>
              <span
                className={`font-semibold ${
                  statistics.overdueTasks > 0 ? "text-red-600" : "text-gray-900"
                }`}
              >
                {statistics.overdueTasks}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tasks Created (Last 7 Days)</span>
              <span className="font-semibold text-gray-900">{statistics.recentTasks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Workspaces Created (Last 30 Days)</span>
              <span className="font-semibold text-gray-900">{statistics.recentWorkspaces}</span>
            </div>
            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-gray-600">Avg Tasks per Workspace</span>
              <span className="font-semibold text-gray-900">
                {statistics.avgTasksPerWorkspace}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string
  value: number
  icon: string
  color: string
}) {
  const colorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    emerald: "bg-emerald-100 text-emerald-600",
    orange: "bg-orange-100 text-orange-600",
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`${colorClasses[color as keyof typeof colorClasses]} p-3 rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  )
}

