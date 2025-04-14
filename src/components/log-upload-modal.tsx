"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { UploadIcon as FileUpload } from "lucide-react"
import { LogData } from "@/types"
import useLogModal from "@/src/hooks/useLogModal"



export function LogUploadModal() {
  const { isOpen, onClose, onSubmit, task } = useLogModal()
  const [formData, setFormData] = useState<LogData>({
    notes: "",
    completionDate: new Date().toISOString().split("T")[0],
    attachments: [],
    completionPercentage: 100,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
    setFormData({
      notes: "",
      completionDate: new Date().toISOString().split("T")[0],
      attachments: [],
      completionPercentage: 100,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const fileNames = Array.from(e.target.files).map((file) => file.name)
      setFormData((prev) => ({ ...prev, attachments: fileNames }))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-900 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800 sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Task Log</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {task && (
            <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-md mb-4">
              <h3 className="font-medium">{task.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">{task.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="completionDate">Completion Date</Label>
            <Input
              id="completionDate"
              name="completionDate"
              type="date"
              value={formData.completionDate}
              onChange={handleChange}
              className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="completionPercentage">Completion Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="completionPercentage"
                name="completionPercentage"
                type="number"
                min="0"
                max="100"
                value={formData.completionPercentage}
                onChange={handleChange}
                className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700"
                required
              />
              <span>%</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 min-h-[100px]"
              placeholder="Add any relevant notes about task completion..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-md p-4 text-center">
              <label htmlFor="file-upload" className="cursor-pointer">
                <FileUpload className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  {formData.attachments.length > 0
                    ? `${formData.attachments.length} file(s) selected`
                    : "Click to upload files"}
                </span>
                <Input id="file-upload" type="file" multiple className="hidden" onChange={handleFileChange} />
              </label>
            </div>
            {formData.attachments.length > 0 && (
              <ul className="text-sm text-zinc-600 dark:text-zinc-400 pl-4">
                {formData.attachments.map((file, index) => (
                  <li key={index} className="truncate">
                    {file}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
              Submit Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
