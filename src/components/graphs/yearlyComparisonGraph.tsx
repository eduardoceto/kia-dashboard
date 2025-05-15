"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"

import { mockData, mockCombinedData } from "@/src/components/testData/data"
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"


function CombinedChart({
    data = mockCombinedData,
    height = "h-[500px]",
  }: { title: string; data?: typeof mockCombinedData; height?: string }) {
    const [showComparison, setShowComparison] = useState<boolean>(true)

    const [selectedMaterial] = useState(mockData.materials[0])

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
      <Card className="w-full rounded-md bg-[#fbfbfb] shadow-md">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle>{selectedMaterial}</CardTitle>
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 grid-cols-2 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Material:</span>
              <Select value={selectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Select material" />
                </SelectTrigger>
                <SelectContent>
                  {mockData.materials.map((material) => (
                    <SelectItem key={material} value={material}>
                      {material}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

            <div className="flex flex-col justify-between items-center gap-2 ml-auto">
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
                    const nameStr = String(name);
                    if (nameStr.includes("Vehicle")) {
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
  
  
  
  // Year-over-year comparison dashboard
export function YearComparisonGraph() {
  const [selectedMaterial] = useState(mockData.materials[0])
    return (
      <div className="space-y-6">
        
  
        <CombinedChart title={`${selectedMaterial} 2024`} />
  
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Key Insights</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Total waste increased by 32.8% compared to 2023</li>
              <li>Highest volume month was October with 343,672 kg</li>
              <li>Efficiency (kg/vehicle) increased by 22.4% year-over-year</li>
              <li>Second half of the year showed significantly higher volumes</li>
            </ul>
          </div>
  
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Investigate July-November spike to understand volume increase</li>
              <li>Review efficiency improvements to replicate across other materials</li>
              <li>Consider capacity planning for year-end based on current trends</li>
              <li>Analyze correlation between production volume and waste generation</li>
            </ul>
          </div> 
        </div> */}
      </div>
    )
  }