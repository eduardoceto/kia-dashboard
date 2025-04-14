"use client"

import { useState } from "react"
import { TaskCard } from "@/src/components/task-card"
import { LogUploadModal } from "@/src/components/log-upload-modal"
import { useTasks } from "@/src/hooks/use-tasks"
import type { Task } from "@/types"
import type { LogData } from "@/types"

export default function TasksPage() {
  const { tasks, completeTask, deleteTask } = useTasks()


  return (
    <div>
      <div className="max-w-5xl mx-auto ">

        <div className="w-full overflow-x-auto scrollbar-none">
          <div className="flex gap-3 min-w-full p-1">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}x
                task={task as Task}
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
    </div>
  )
}
