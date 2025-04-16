"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
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

export function StandaloneGraph() {
    const [location, setLocation] = useState(mockData.locations[0])
    const [material, setMaterial] = useState(mockData.materials[0])
    const [timeRange, setTimeRange] = useState(mockData.timeRanges[0])
  
    const data = mockData.getData(location, material, timeRange)
  
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d8", "#f9c74f", "#90be6d"]
    const color = colors[0]
  
    return (
      <Card className="w-full">
        <CardHeader className="pb-1 pt-3 px-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md truncate pr-2">
              {location} - {material} - {timeRange}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {/* Adjusted grid layout */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3 mb-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Location</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="text-sm">
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
              <label className="text-sm font-medium">Material</label>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger className="sm: w-[140px] text-sm">
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
              <label className="text-sm font-medium">Time Range</label>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="text-sm">
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
  
          <div className="w-full h-[300px]">
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
                  tick={{ fontSize: 12 }}
                  label={{
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
                    fontSize: 12,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: "Waste (kg)",
                    angle: -90,
                    position: "insideLeft",
                    fontSize: 12,
                  }}
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
                <Legend wrapperStyle={{ fontSize: 12 }} />
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