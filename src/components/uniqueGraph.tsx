"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

const mockData = {
    locations: ["Factory A", "Factory B", "Factory C", "Factory D"],
    materials: ["Paper / Cardboard", "Plastic", "Metal", "Glass", "Organic", "Electronic", "Hazardous", "Mixed"],
    timeRanges: ["Last Week", "Last Month", "Last Quarter", "Last Year"],
    getData: (location: string, material: string, timeRange: string) => {
      // Generate random data based on the selected parameters
      const points =
        timeRange === "Last Week" ? 7 : timeRange === "Last Month" ? 30 : timeRange === "Last Quarter" ? 12 : 52
  
      return Array.from({ length: points }, (_, i) => ({
        name: i.toString(),
        value: Math.floor(Math.random() * 1000) + 100,
      }))
    },
  }

interface GraphProps {
    id: number
    onRemove: (id: number) => void
    totalGraphs: number
}

export function UniqueGraph({ id, onRemove, totalGraphs }: GraphProps) {
  const [location, setLocation] = useState(mockData.locations[0])
  const [material, setMaterial] = useState(mockData.materials[0])
  const [timeRange, setTimeRange] = useState(mockData.timeRanges[0])

  const data = mockData.getData(location, material, timeRange)

  // Generate a unique color for this graph
  const colors = ["#ff6b6b", "#4ecdc4", "#45b7d8", "#f9c74f", "#90be6d"]
  const color = colors[id % colors.length]

  // Determine graph height based on total number of graphs
  const getGraphHeight = () => {
    if (totalGraphs <= 2) return "h-[300px]"
    if (totalGraphs <= 4) return "h-[250px]"
    if (totalGraphs <= 6) return "h-[220px]"
    return "h-[200px]"
  }

  return (
    <Card className="w-full">
      <CardHeader className={totalGraphs > 4 ? "p-3" : "pb-1 pt-3 px-4"}>
        <div className="flex items-center justify-between">
          <CardTitle className={`${totalGraphs > 6 ? "text-sm" : "text-md"} truncate pr-2`}>
            {location} - {material} - {timeRange}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={() => onRemove(id)} className="h-7 w-7 flex-shrink-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className={totalGraphs > 4 ? "p-3 pt-0" : "p-4 pt-0"}>
        <div className={`grid gap-2 ${totalGraphs > 6 ? "grid-cols-1 md:grid-cols-3" : "md:grid-cols-3"} mb-2`}>
          <div className="space-y-1">
            <label className={`${totalGraphs > 6 ? "text-xs" : "text-sm"} font-medium`}>Location</label>
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className={totalGraphs > 6 ? "h-8 text-xs" : ""}>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                {mockData.locations.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className={`${totalGraphs > 6 ? "text-xs" : "text-sm"} font-medium`}>Material</label>
            <Select value={material} onValueChange={setMaterial}>
              <SelectTrigger className={`${totalGraphs > 6 ? "h-8 text-xs" : ""} ${totalGraphs > 1 ? "w-[140px]" : ""}`}>
                <SelectValue placeholder="Select material" />
              </SelectTrigger>
              <SelectContent>
                {mockData.materials.map((mat) => (
                  <SelectItem key={mat} value={mat}>
                    {mat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className={`${totalGraphs > 6 ? "text-xs" : "text-sm"} font-medium`}>Time Range</label>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className={totalGraphs > 6 ? "h-8 text-xs" : ""}>
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {mockData.timeRanges.map((range) => (
                  <SelectItem key={range} value={range}>
                    {range}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

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
                                : "Weeks",
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
                    return `Month ${Number.parseInt(label) + 1}`
                  } else {
                    return `Week ${Number.parseInt(label) + 1}`
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
      </CardContent>
    </Card>
  )
}