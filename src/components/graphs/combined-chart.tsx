"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from "recharts"

// Mock data for the combined chart
const mockCombinedData = [
  {
    month: "January",
    "kg/2024": 127204,
    "kg/2023": 176748,
    "kg/Vehicle (2024)": 8.05,
    "kg/Vehicle (2023)": 7.29,
  },
  {
    month: "February",
    "kg/2024": 150150,
    "kg/2023": 155305,
    "kg/Vehicle (2024)": 7.6,
    "kg/Vehicle (2023)": 7.85,
  },
  {
    month: "March",
    "kg/2024": 144376,
    "kg/2023": 190176,
    "kg/Vehicle (2024)": 7.32,
    "kg/Vehicle (2023)": 8.52,
  },
  {
    month: "April",
    "kg/2024": 179060,
    "kg/2023": 150145,
    "kg/Vehicle (2024)": 7.39,
    "kg/Vehicle (2023)": 8.35,
  },
  {
    month: "May",
    "kg/2024": 182529,
    "kg/2023": 184061,
    "kg/Vehicle (2024)": 7.76,
    "kg/Vehicle (2023)": 8.0,
  },
  {
    month: "June",
    "kg/2024": 184119,
    "kg/2023": 190791,
    "kg/Vehicle (2024)": 8.8,
    "kg/Vehicle (2023)": 8.02,
  },
  {
    month: "July",
    "kg/2024": 263461,
    "kg/2023": 140138,
    "kg/Vehicle (2024)": 12.47,
    "kg/Vehicle (2023)": 8.22,
  },
  {
    month: "August",
    "kg/2024": 319491,
    "kg/2023": 197874,
    "kg/Vehicle (2024)": 11.83,
    "kg/Vehicle (2023)": 8.08,
  },
  {
    month: "September",
    "kg/2024": 309319,
    "kg/2023": 174396,
    "kg/Vehicle (2024)": 12.31,
    "kg/Vehicle (2023)": 7.99,
  },
  {
    month: "October",
    "kg/2024": 343672,
    "kg/2023": 174740,
    "kg/Vehicle (2024)": 11.95,
    "kg/Vehicle (2023)": 7.6,
  },
  {
    month: "November",
    "kg/2024": 312476,
    "kg/2023": 174902,
    "kg/Vehicle (2024)": 12.59,
    "kg/Vehicle (2023)": 7.78,
  },
  {
    month: "December",
    "kg/2024": 212036,
    "kg/2023": 143523,
    "kg/Vehicle (2024)": 10.65,
    "kg/Vehicle (2023)": 8.49,
  },
  {
    month: "Total",
    "kg/2024": 2727902,
    "kg/2023": 2054179,
    "kg/Vehicle (2024)": 9.82, // Average
    "kg/Vehicle (2023)": 8.02, // Average
  },
]

interface CombinedChartProps {
  title: string
  data?: typeof mockCombinedData
  height?: string
}

export function CombinedChart({ title, data = mockCombinedData, height = "h-[500px]" }: CombinedChartProps) {
  const [showComparison, setShowComparison] = useState<boolean>(true)

  // Calculate max values for y-axis scaling
  const maxKg = Math.max(
    ...data.map((item) => Math.max(item["kg/2024"] || 0, showComparison ? item["kg/2023"] || 0 : 0)),
  )
  const maxKgVehicle = Math.max(
    ...data.map((item) =>
      Math.max(item["kg/Vehicle (2024)"] || 0, showComparison ? item["kg/Vehicle (2023)"] || 0 : 0),
    ),
  )

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <CardTitle>{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={showComparison ? "comparison" : "single"}
              onValueChange={(value) => setShowComparison(value === "comparison")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="View mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comparison">Compare with 2023</SelectItem>
                <SelectItem value="single">Show 2024 only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`w-full ${height}`}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" angle={-45} textAnchor="end" height={70} tick={{ fontSize: 12 }} />
              <YAxis
                yAxisId="left"
                orientation="left"
                label={{ value: "kg", angle: -90, position: "insideLeft" }}
                domain={[0, maxKg * 1.1]}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: "kg/Vehicle", angle: 90, position: "insideRight" }}
                domain={[0, maxKgVehicle * 1.1]}
              />
              <Tooltip
                formatter={(value, name) => {
                  if (typeof name === 'string' && name.includes("Vehicle")) {
                    return [`${value} kg/vehicle`, name]
                  }
                  return [`${value.toLocaleString()} kg`, name]
                }}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="kg/2024"
                name="kg/2024"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                barSize={showComparison ? 20 : 40}
              />
              {showComparison && (
                <Bar
                  yAxisId="left"
                  dataKey="kg/2023"
                  name="kg/2023"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  barSize={20}
                />
              )}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="kg/Vehicle (2024)"
                name="kg/Vehicle (2024)"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              {showComparison && (
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="kg/Vehicle (2023)"
                  name="kg/Vehicle (2023)"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

