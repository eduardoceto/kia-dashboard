"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/button"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { createClient } from "@/src/utils/supabase/client"

const MATERIALS = [
  "Metal/Non metallic",
  "Other Recycables",
  "Sludge",
  "Uretano",
  "Vidrio",
  "Autopartes Destruida"
]
const TIME_RANGES = ["Last Week", "Last Month", "Last Quarter", "Last Year"]

// Map material to excel_id
const MATERIAL_TO_EXCEL_ID: Record<string, number[]> = {
  "Sludge": [1],
  "Uretano": [2],
  "Vidrio": [2],
  "Autopartes Destruida": [2],
  "Other Recycables": [3],
  "Metal/Non metallic": [4],
}

interface GraphProps {
    id: number
    onRemove: (id: number) => void
    totalGraphs: number
}

export function UniqueGraph({ id, onRemove, totalGraphs }: GraphProps) {
  const [material, setMaterial] = useState(MATERIALS[0])
  const [timeRange, setTimeRange] = useState(TIME_RANGES[0])
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const supabase = createClient()
        // Calculate date range
        const now = new Date()
        let fromDate = new Date()
        if (timeRange === "Last Week") fromDate.setDate(now.getDate() - 6)
        else if (timeRange === "Last Month") fromDate.setDate(now.getDate() - 29)
        else if (timeRange === "Last Quarter") fromDate.setMonth(now.getMonth() - 2)
        else fromDate.setFullYear(now.getFullYear() - 1)
        // Map material to excel_id(s)
        const excelIds = MATERIAL_TO_EXCEL_ID[material] || []
        // Query waste_logs for selected excel_id(s) and date range
        let query = supabase
          .from('waste_logs')
          .select('created_at, excel_id, quantity, quantity_type')
          .gte('created_at', fromDate.toISOString())
          .lte('created_at', now.toISOString())
        if (excelIds.length === 1) {
          query = query.eq('excel_id', excelIds[0])
        } else if (excelIds.length > 1) {
          query = query.in('excel_id', excelIds)
        }
        const { data: logs, error: logsErr } = await query
        if (logsErr) throw logsErr
        // Only use rows where quantity_type is 'kg'
        const filteredLogs = logs?.filter(l => l.quantity_type === 'kg') || []
        // Group by day/week/month as needed
        let points = 7
        let groupKey = 'day'
        if (timeRange === "Last Month") { points = 30; groupKey = 'day' }
        else if (timeRange === "Last Quarter") { points = 3; groupKey = 'month' }
        else if (timeRange === "Last Year") { points = 12; groupKey = 'month' }
        const grouped = Array.from({ length: points }, (_, i) => {
          let label
          let start, end
          if (groupKey === 'day') {
            start = new Date(fromDate); start.setDate(fromDate.getDate() + i)
            end = new Date(start); end.setDate(start.getDate() + 1)
            label = i.toString()
          } else {
            start = new Date(fromDate); start.setMonth(fromDate.getMonth() + i)
            end = new Date(start); end.setMonth(start.getMonth() + 1)
            label = start.toLocaleString('default', { month: 'short' })
          }
          const sum = filteredLogs.filter(l => {
            const d = new Date(l.created_at)
            return d >= start && d < end
          }).reduce((acc, l) => acc + (l.quantity || 0), 0) || 0
          return { name: label, value: sum }
        })
        setData(grouped)
      } catch (e: any) {
        setError(e.message || "Error fetching data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [material, timeRange])

  // Generate a unique color for this graph
  const colors = ["#e63946", "#2a9d8f", "#1d3557", "#f4a261", "#e76f51"]
  const color = colors[id % colors.length]

  // Determine graph height based on total number of graphs
  const getGraphHeight = () => {
    if (totalGraphs <= 2) return "h-[300px]"
    if (totalGraphs <= 4) return "h-[250px]"
    if (totalGraphs <= 6) return "h-[220px]"
    return "h-[200px]"
  }

  return (
    <Card className="w-full border-foreground">
      <CardHeader className={totalGraphs > 4 ? "p-3" : "pb-1 pt-3 px-4"}>
        <div className="flex items-center justify-between">
          <CardTitle className={`${totalGraphs > 6 ? "text-sm" : "text-md"} truncate pr-2 KiaSignatureBold`}>
            {material} - {timeRange}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onRemove(id)} className="h-7 w-7 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={totalGraphs > 4 ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className="flex flex-wrap justify-between gap-6 mb-2">
          <div className="space-y-1 min-w-[200px]">
            <label className={`${totalGraphs > 6 ? "text-xs" : "text-sm"} font-medium`}>Material</label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger className={`${totalGraphs > 6 ? "h-8 text-xs" : ""}`}>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {MATERIALS.map((mat) => (
                  <SelectItem key={mat} value={mat}>
                    {mat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 min-w-[200px]">
            <label className={`${totalGraphs > 6 ? "text-xs" : "text-sm"} font-medium`}>Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className={totalGraphs > 6 ? "h-8 text-xs" : ""}>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {TIME_RANGES.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <div className={`w-full ${getGraphHeight()}`}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 5,
                  right: 20,
                  left: 0,
                  bottom: 0,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: totalGraphs > 6 ? 10 : 12 }}
                  label={
                    totalGraphs <= 6
                      ? {
                          value:
                            timeRange === "Last Week"
                              ? "Days"
                              : timeRange === "Last Month"
                                ? "Days"
                                : timeRange === "Last Quarter"
                                  ? "Months"
                                  : "Months",
                          position: "insideBottomRight",
                          offset: -5,
                          fontSize: totalGraphs > 4 ? 10 : 12,
                        }
                      : undefined
                  }
                />
                <YAxis
                  tick={{ fontSize: totalGraphs > 6 ? 10 : 12 }}
                  label={
                    totalGraphs <= 6
                      ? {
                          value: "Waste (kg)",
                          angle: -90,
                          position: "insideLeft",
                          fontSize: totalGraphs > 4 ? 10 : 12,
                        }
                      : undefined
                  }
                />
                <Tooltip
                  formatter={(value) => [`${value} kg`, `${material} waste`]}
                  labelFormatter={(label) => {
                    if (timeRange === "Last Week") {
                      return `Day ${Number.parseInt(label) + 1}`
                    } else if (timeRange === "Last Month") {
                      return `Day ${Number.parseInt(label) + 1}`
                    } else if (timeRange === "Last Quarter") {
                      return `Month ${label}`
                    } else {
                      return `Month ${label}`
                    }
                  }}
                />
                <Legend wrapperStyle={{ fontSize: totalGraphs > 6 ? 10 : 12 }} />
                <Area
                  type="monotone"
                  dataKey="value"
                  name={`${material} waste`}
                  stroke={color}
                  fill={color}
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}