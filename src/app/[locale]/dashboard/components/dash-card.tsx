"use client"

import { useState } from "react"
import { TaskCard } from "@/src/components/task-card"
import { LogUploadModal } from "@/src/components/log-upload-modal"
import { useTasks } from "@/src/hooks/use-tasks"
import type { Task } from "@/types"
import type { LogData } from "@/types"


export default function TasksPage() {
  const { tasks, completeTask, deleteTask } = useTasks()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)

  const handleUploadLog = (task: Task) => {
    setSelectedTask(task)
    setIsLogModalOpen(true)
  }

  const handleLogSubmit = (logData: LogData) => {
    if (selectedTask) {
      completeTask(selectedTask.id, logData)
    }
    setIsLogModalOpen(false)
    setSelectedTask(null)
  }

  return (
    <div>
      <div className="max-w-5xl mx-auto ">

        <div className="w-full overflow-x-auto scrollbar-none">
          <div className="flex gap-3 min-w-full p-1">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUploadLog={() => handleUploadLog(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-12 text-zinc-400 w-full">
                <p>All tasks completed! Great job!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <LogUploadModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onSubmit={handleLogSubmit}
        task={selectedTask}
      />
    </div>
  )
}
