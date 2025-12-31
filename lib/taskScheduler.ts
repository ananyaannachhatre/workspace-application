// Simple rule-based NLP priority analysis
export function analyzeTaskPriority(title: string, description: string, dueDate: Date | null): {
  priority: number
  estimatedHours: number
  confidence: number
} {
  const text = `${title} ${description}`.toLowerCase()
  
  // Priority keywords and their weights (reduced to be more conservative)
  const urgentKeywords = ['urgent', 'asap', 'immediately', 'critical', 'emergency', 'deadline']
  const highKeywords = ['important', 'high priority', 'soon', 'quickly', 'priority', 'must']
  const mediumKeywords = ['moderate', 'standard', 'normal', 'regular']
  const lowKeywords = ['low', 'minor', 'later', 'when possible', 'optional', 'break', 'casual', 'informal']
  
  // Resource intensity indicators (adjusted for more realistic estimates)
  const highIntensityKeywords = ['complex', 'difficult', 'research', 'analysis', 'development', 'design', 'implementation', 'testing', 'review']
  const mediumIntensityKeywords = ['update', 'modify', 'check', 'fix', 'optimize', 'meeting', 'standup']
  const lowIntensityKeywords = ['simple', 'easy', 'quick', 'basic', 'minor', 'small', 'break', 'short']
  
  let priorityScore = 0
  let intensityScore = 0
  let keywordMatches = 0
  
  // Check urgency keywords (reduced weight)
  urgentKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      priorityScore += 2
      keywordMatches++
    }
  })
  
  highKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      priorityScore += 1.5
      keywordMatches++
    }
  })
  
  mediumKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      priorityScore += 0.5
      keywordMatches++
    }
  })
  
  lowKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      priorityScore -= 1
      keywordMatches++
    }
  })
  
  // Check resource intensity (adjusted for more realistic estimates)
  highIntensityKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      intensityScore += 2
      keywordMatches++
    }
  })
  
  mediumIntensityKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      intensityScore += 1
      keywordMatches++
    }
  })
  
  lowIntensityKeywords.forEach(keyword => {
    if (text.includes(keyword)) {
      intensityScore += 0.5
      keywordMatches++
    }
  })
  
  // Due date priority (most important factor, overrides description priority)
  let dueDatePriority = 0
  if (dueDate) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate)
    due.setHours(0, 0, 0, 0)
    
    const daysUntilDue = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue <= 0) {
      dueDatePriority = 5 // Overdue or due today - highest priority
    } else if (daysUntilDue <= 1) {
      dueDatePriority = 4 // Due tomorrow
    } else if (daysUntilDue <= 2) {
      dueDatePriority = 3 // Due in 2 days
    } else if (daysUntilDue <= 5) {
      dueDatePriority = 2 // Due within 5 days
    } else if (daysUntilDue <= 10) {
      dueDatePriority = 1 // Due within 10 days
    }
    // No points for tasks due more than 10 days out
  }
  
  // Due date priority overrides description priority for urgent tasks
  if (dueDatePriority >= 3) {
    priorityScore = dueDatePriority // Due date takes precedence
  } else {
    priorityScore += dueDatePriority // Add due date priority to description priority
  }
  
  // Calculate estimated hours based on intensity (more conservative)
  let estimatedHours = 1 // Default minimum
  
  if (intensityScore >= 4) {
    estimatedHours = 3 // High intensity (3 hours)
  } else if (intensityScore >= 2) {
    estimatedHours = 2 // Medium intensity (2 hours)
  } else if (intensityScore >= 1) {
    estimatedHours = 1.5 // Low-medium intensity (1.5 hours)
  } else {
    estimatedHours = 1 // Low intensity (1 hour)
  }
  
  // Special cases for common tasks
  if (text.includes('standup') || text.includes('daily') || text.includes('morning')) {
    estimatedHours = 0.5 // Standup meetings are short
    priorityScore = 0 // Usually routine, not urgent
  }
  
  if (text.includes('break') || text.includes('lunch') || text.includes('coffee')) {
    estimatedHours = 0.5 // Breaks are short
    priorityScore = -1 // Low priority
  }
  
  if (text.includes('review') || text.includes('code review')) {
    estimatedHours = 1.5 // Code reviews typically 1-2 hours
  }
  
  if (text.includes('testing') || text.includes('test')) {
    estimatedHours = 2 // Testing usually takes longer
  }
  
  // Normalize priority to 0-3 scale (adjusted for due date precedence)
  let normalizedPriority = 0
  if (priorityScore >= 4.5) {
    normalizedPriority = 3 // Urgent (due today/tomorrow)
  } else if (priorityScore >= 3) {
    normalizedPriority = 2 // High (due within 2 days)
  } else if (priorityScore >= 1.5) {
    normalizedPriority = 1 // Medium (due within 5 days)
  } else {
    normalizedPriority = 0 // Low (due later or no due date)
  }
  
  // Confidence based on keyword matches
  const confidence = Math.min(keywordMatches / 3, 1) // Max confidence when 3+ keywords found
  
  return {
    priority: normalizedPriority,
    estimatedHours,
    confidence
  }
}

// Dynamic task scheduling algorithm
export function scheduleTasks(tasks: Array<{
  id: string
  title: string
  description: string | null
  dueDate: Date | null
  priority: number
  estimatedHours: number | null
  status: string
  createdAt: Date
}>): Array<{
  task: {
    id: string
    title: string
    description: string | null
    dueDate: Date | null
    priority: number
    estimatedHours: number | null
    status: string
    createdAt: Date
  }
  scheduledStart: Date
  scheduledEnd: Date
  order: number
}> {
  // Separate completed tasks (keep their existing schedule) and todo tasks (schedule them)
  const completedTasks = tasks.filter(task => task.status === 'done')
  const todoTasks = tasks.filter(task => task.status === 'todo')
  
  // Sort by priority (highest first), then by due date (earliest first)
  const sortedTasks = todoTasks.sort((a, b) => {
    // First sort by due date urgency - tasks due today/tomorrow come first regardless of description priority
    const getDueDateUrgency = (task: any) => {
      if (!task.dueDate) return 999 // No due date = lowest urgency
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const due = new Date(task.dueDate)
      due.setHours(0, 0, 0, 0)
      return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }
    
    const aUrgency = getDueDateUrgency(a)
    const bUrgency = getDueDateUrgency(b)
    
    // Tasks due earlier come first
    if (aUrgency !== bUrgency) {
      return aUrgency - bUrgency
    }
    
    // If same due date urgency, then use calculated priority
    if (a.priority !== b.priority) {
      return b.priority - a.priority // Higher priority first
    }
    
    return 0
  })

  const scheduledTasks: Array<{
    task: {
      id: string
      title: string
      description: string | null
      dueDate: Date | null
      priority: number
      estimatedHours: number | null
      status: string
      createdAt: Date
    }
    scheduledStart: Date
    scheduledEnd: Date
    order: number
  }> = []
  
  // Add completed tasks first (they keep their existing schedule)
  // For completed tasks, we need to estimate their original schedule based on creation date
  completedTasks.forEach((task, index) => {
    // Estimate when this task was likely scheduled (based on creation date)
    const estimatedStart = new Date(task.createdAt)
    estimatedStart.setHours(9, 0, 0, 0) // Assume started at 9 AM
    
    const estimatedHours = task.estimatedHours || 1 // Default to 1 hour if null
    const estimatedEnd = new Date(estimatedStart.getTime() + estimatedHours * 60 * 60 * 1000)
    
    scheduledTasks.push({
      task: {
        ...task,
        createdAt: task.createdAt
      },
      scheduledStart: estimatedStart,
      scheduledEnd: estimatedEnd,
      order: -1000 + index // Completed tasks come first with negative order
    })
  })
  
  // Start from today at current time (or 9 AM if past work hours)
  let currentTime = new Date()
  const currentHour = currentTime.getHours()
  
  if (currentHour >= 15 || currentHour < 9) {
    // If past work hours (3 PM) or before work hours, start at 9 AM today
    currentTime.setHours(9, 0, 0, 0)
  } else {
    // Start from current time
    currentTime.setMinutes(0, 0, 0)
  }
  
  // Work hours: 9 AM - 3 PM (6 hours per day), no weekends
  const workStartHour = 9
  const workEndHour = 15 // 3 PM = 6-hour workday
  
  // Helper function to check if date is weekend
  const isWeekend = (date: Date) => {
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday = 0, Saturday = 6
  }
  
  // Helper function to find next workday
  const getNextWorkday = (date: Date) => {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    // Skip weekends
    while (isWeekend(nextDay)) {
      nextDay.setDate(nextDay.getDate() + 1)
    }
    
    return nextDay
  }
  
  // Schedule only TODO tasks (completed tasks keep their time slots)
  sortedTasks.forEach((task, index) => {
    const taskDuration = task.estimatedHours || 1 // Default to 1 hour if null
    let remainingHours = taskDuration
    let taskStartTime = new Date(currentTime)
    
    // Ensure we start on a weekday
    while (isWeekend(taskStartTime)) {
      taskStartTime = getNextWorkday(taskStartTime)
      currentTime = new Date(taskStartTime)
    }
    
    // Check if task fits in current workday
    const currentHour = currentTime.getHours()
    const hoursRemainingToday = Math.max(0, workEndHour - currentHour)
    
    if (remainingHours > hoursRemainingToday) {
      // Task spans multiple days or needs to start tomorrow
      if (hoursRemainingToday > 0) {
        // Schedule remaining part today
        scheduledTasks.push({
          task,
          scheduledStart: taskStartTime,
          scheduledEnd: new Date(currentTime.getTime() + hoursRemainingToday * 60 * 60 * 1000),
          order: index
        })
        remainingHours -= hoursRemainingToday
      }
      
      // Move to next workday
      currentTime = getNextWorkday(currentTime)
      currentTime.setHours(workStartHour, 0, 0, 0)
      taskStartTime = new Date(currentTime)
    }
    
    // Schedule the remaining part
    const daysNeeded = Math.ceil(remainingHours / 6) // 6 hours per day now
    
    for (let day = 0; day < daysNeeded; day++) {
      // Ensure we're on a workday
      while (isWeekend(currentTime)) {
        currentTime = getNextWorkday(currentTime)
        currentTime.setHours(workStartHour, 0, 0, 0)
      }
      
      const hoursToday = Math.min(remainingHours, 6) // Max 6 hours per day
      const dayStart = day === 0 ? taskStartTime : new Date(currentTime)
      
      scheduledTasks.push({
        task,
        scheduledStart: dayStart,
        scheduledEnd: new Date(dayStart.getTime() + hoursToday * 60 * 60 * 1000),
        order: index + day * 0.1 // Slight offset for multi-day tasks
      })
      
      remainingHours -= hoursToday
      
      if (remainingHours > 0) {
        // Move to next workday
        currentTime = getNextWorkday(currentTime)
        currentTime.setHours(workStartHour, 0, 0, 0)
      } else {
        currentTime = new Date(dayStart.getTime() + hoursToday * 60 * 60 * 1000)
      }
    }
  })
  
  // Sort all tasks by scheduled start time
  return scheduledTasks.sort((a, b) => {
    return a.scheduledStart.getTime() - b.scheduledStart.getTime()
  })
}
