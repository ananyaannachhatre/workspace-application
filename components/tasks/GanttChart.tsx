"use client"

import { useState, useEffect } from "react"
import { scheduleTasks } from "@/lib/taskScheduler"

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

interface ScheduledTask {
  task: Task
  scheduledStart: Date
  scheduledEnd: Date
  order: number
}

interface GanttChartProps {
  tasks: Task[]
}

export default function GanttChart({ tasks }: GanttChartProps) {
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (tasks.length > 0) {
      const scheduled = scheduleTasks(tasks)
      setScheduledTasks(scheduled)
    }
  }, [tasks])

  if (!isClient) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Schedule (Gantt Chart)</h3>
        <div className="text-gray-500">Loading schedule...</div>
      </div>
    )
  }

  if (scheduledTasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Schedule (Gantt Chart)</h3>
        <p className="text-gray-500">No tasks to schedule or all tasks are completed.</p>
      </div>
    )
  }

  // Calculate date range for the chart
  const allDates = scheduledTasks.flatMap(st => [st.scheduledStart, st.scheduledEnd])
  const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
  const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
  
  // Add padding to the range
  minDate.setDate(minDate.getDate() - 1)
  maxDate.setDate(maxDate.getDate() + 1)
  
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
  const dayWidth = Math.max(120, 800 / totalDays) // Minimum 120px per day

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  }

  const getPriorityColor = (priority: number, isCompleted: boolean) => {
    if (isCompleted) {
      return 'bg-gray-500' // Completed tasks in gray
    }
    switch (priority) {
      case 3: return 'bg-red-600' // Urgent - darker red
      case 2: return 'bg-orange-600' // High - darker orange
      case 1: return 'bg-yellow-600' // Medium - darker yellow
      case 0: return 'bg-green-600' // Low - darker green
      default: return 'bg-gray-500'
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

  // Group tasks by day for better visualization
  const tasksByDay = new Map<string, ScheduledTask[]>()
  
  scheduledTasks.forEach(st => {
    const dayKey = st.scheduledStart.toDateString()
    if (!tasksByDay.has(dayKey)) {
      tasksByDay.set(dayKey, [])
    }
    tasksByDay.get(dayKey)!.push(st)
  })

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Task Schedule (Gantt Chart)</h3>
      
      {/* Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-600 rounded"></div>
          <span className="text-gray-800 font-medium">Urgent</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-600 rounded"></div>
          <span className="text-gray-800 font-medium">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-600 rounded"></div>
          <span className="text-gray-800 font-medium">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-gray-800 font-medium">Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-gray-800 font-medium">Completed</span>
        </div>
      </div>

      {/* Traditional Gantt Chart Layout */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: '600px' }}>
        <div className="min-w-max">
          {/* Calculate timeline dimensions */}
          {(() => {
            const allDates = scheduledTasks.flatMap(st => [st.scheduledStart, st.scheduledEnd])
            const minDate = new Date(Math.min(...allDates.map(d => d.getTime())))
            const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())))
            
            // Add padding to the range
            minDate.setDate(minDate.getDate() - 1)
            maxDate.setDate(maxDate.getDate() + 1)
            
            const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
            const hourWidth = 40 // 40px per hour
            const dayWidth = hourWidth * 24 // 24 hours per day
            const taskRowHeight = 40
            const taskNameWidth = 200 // Width for task names
            
            // Generate all hours for the timeline
            const generateTimelineHours = () => {
              const hours = []
              for (let day = 0; day < totalDays; day++) {
                const currentDate = new Date(minDate)
                currentDate.setDate(minDate.getDate() + day)
                
                for (let hour = 0; hour < 24; hour++) {
                  const hourDate = new Date(currentDate)
                  hourDate.setHours(hour, 0, 0, 0)
                  hours.push(hourDate)
                }
              }
              return hours
            }
            
            const timelineHours = generateTimelineHours()
            
            return (
              <div>
                {/* Header with dates and hours */}
                <div className="flex border-b-2 border-gray-200">
                  <div className="w-[200px] font-semibold text-gray-700 p-2 border-r border-gray-200">Tasks</div>
                  <div className="flex" style={{ width: `${totalDays * dayWidth}px` }}>
                    {Array.from({ length: totalDays }, (_, dayIndex) => {
                      const currentDate = new Date(minDate)
                      currentDate.setDate(minDate.getDate() + dayIndex)
                      
                      return (
                        <div key={dayIndex} className="border-r border-gray-200" style={{ width: `${dayWidth}px` }}>
                          {/* Date header */}
                          <div className="text-center text-xs font-medium text-gray-700 bg-gray-50 p-1 border-b border-gray-200">
                            {currentDate.toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          
                          {/* Hour headers */}
                          <div className="flex">
                            {Array.from({ length: 24 }, (_, hourIndex) => (
                              <div 
                                key={hourIndex}
                                className="text-center text-xs text-gray-500 border-r border-gray-100"
                                style={{ width: `${hourWidth}px` }}
                              >
                                {hourIndex % 3 === 0 ? `${hourIndex}:00` : ''}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Task rows */}
                {scheduledTasks.map((scheduledTask, taskIndex) => {
                  const isCompleted = scheduledTask.task.status === 'done'
                  
                  // Calculate position and width
                  // Get the start of the day for minDate to ensure proper alignment
                  const minDateStart = new Date(minDate)
                  minDateStart.setHours(0, 0, 0, 0)
                  
                  const startHourOffset = (scheduledTask.scheduledStart.getTime() - minDateStart.getTime()) / (1000 * 60 * 60)
                  const durationHours = (scheduledTask.scheduledEnd.getTime() - scheduledTask.scheduledStart.getTime()) / (1000 * 60 * 60)
                  
                  const leftPosition = startHourOffset * hourWidth
                  const barWidth = durationHours * hourWidth
                  
                  return (
                    <div key={scheduledTask.task.id} className="flex border-b border-gray-100">
                      {/* Task name column */}
                      <div className="w-[200px] p-2 border-r border-gray-200">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {scheduledTask.task.title}
                          {isCompleted && (
                            <span className="ml-2 text-xs text-gray-500">(Completed)</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-block w-2 h-2 rounded-full ${getPriorityColor(scheduledTask.task.priority, isCompleted)}`}></span>
                          <span className="text-xs text-gray-600">{getPriorityLabel(scheduledTask.task.priority)}</span>
                          <span className="text-xs text-gray-400">({scheduledTask.task.estimatedHours || 0}h)</span>
                        </div>
                      </div>
                      
                      {/* Timeline area */}
                      <div className="relative" style={{ width: `${totalDays * dayWidth}px`, height: `${taskRowHeight}px` }}>
                        {/* Grid lines for hours */}
                        <div className="absolute inset-0 flex">
                          {timelineHours.map((hourDate, hourIndex) => (
                            <div 
                              key={hourIndex}
                              className="border-r border-gray-100"
                              style={{ width: `${hourWidth}px` }}
                            />
                          ))}
                        </div>
                        
                        {/* Task bar */}
                        <div
                          className={`absolute top-2 h-6 rounded ${getPriorityColor(scheduledTask.task.priority, isCompleted)} ${isCompleted ? 'opacity-60' : 'opacity-80'} flex items-center px-2 text-white text-xs font-medium shadow-sm hover:opacity-100 transition-opacity`}
                          style={{
                            left: `${leftPosition}px`,
                            width: `${barWidth}px`,
                            minWidth: '20px'
                          }}
                          title={`${scheduledTask.task.title}\n${formatDate(scheduledTask.scheduledStart)} ${formatTime(scheduledTask.scheduledStart)} - ${formatTime(scheduledTask.scheduledEnd)}\nPriority: ${getPriorityLabel(scheduledTask.task.priority)}${isCompleted ? '\nStatus: Completed' : ''}`}
                        >
                          <span className={`truncate ${isCompleted ? 'line-through' : ''}`}>
                            {scheduledTask.task.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="font-medium text-gray-900">Total Tasks</div>
            <div className="text-gray-600">{scheduledTasks.length}</div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Total Hours</div>
            <div className="text-gray-600">
              {scheduledTasks.reduce((sum, st) => sum + (st.task.estimatedHours || 0), 0)}h
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Completed</div>
            <div className="text-gray-600">
              {scheduledTasks.filter(st => st.task.status === 'done').length}
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">Pending</div>
            <div className="text-gray-600">
              {scheduledTasks.filter(st => st.task.status === 'todo').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
