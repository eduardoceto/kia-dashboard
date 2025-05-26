"use client"

import type React from "react"

import { useState } from "react"
import { CalendarIcon, CheckCircle } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/src/components/ui/calendar"
import { createClient } from "@/src/utils/supabase/client"

export default function VehicleProductionForm() {
  const [quantity, setQuantity] = useState("")
  const [month, setMonth] = useState("")
  const [year, setYear] = useState("")
  const [date, setDate] = useState<Date>()
  const [isSubmitted, setIsSubmitted] = useState(false)

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 10 }, (_, i) => (currentYear - 5 + i).toString())

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    let usedMonth = month
    let usedYear = year
    if (date) {
      usedMonth = date.toLocaleString('default', { month: 'long' })
      usedYear = date.getFullYear().toString()
    }

    const supabase = createClient()
    const { error } = await supabase.from("vehicle_production").insert([
      {
        quantity: Number(quantity),
        month: usedMonth,
        year: Number(usedYear),
      },
    ])

    if (error) {
      alert("Error saving data: " + error.message)
      return
    }

    // Show success message
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setQuantity("")
      setMonth("")
      setYear("")
      setDate(undefined)
      setIsSubmitted(false)
    }, 3000)
  }

  return (
    <>
      {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-6 space-y-2 text-center">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <h3 className="text-xl font-medium">Production Data Saved</h3>
                <p className="text-muted-foreground">Your vehicle production data has been recorded successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter number of vehicles"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min="1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="month">Month</Label>
                    <Select value={month} onValueChange={setMonth} required>
                      <SelectTrigger id="month">
                        <SelectValue placeholder="Select month" />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Select value={year} onValueChange={setYear} required>
                      <SelectTrigger id="year">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Alternative: Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "MMMM yyyy") : "Select month and year"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">Optional: Use calendar to select month and year</p>
                </div>

                <Button type="submit" className="w-full">
                  Submit Production Data
                </Button>
              </form>
            )}
    </>
  )
}
