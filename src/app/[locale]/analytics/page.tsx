"use client"

import { useEffect } from "react"
import { useState } from "react"
import { PlusCircle, X, BarChart4, LineChart } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ComposedChart,
  Bar,
  Line,
} from "recharts"

// Mock data for individual graphs
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

// Graph component with its own controls
interface GraphProps {
  id: number
  onRemove: (id: number) => void
  totalGraphs: number
}

function WasteGraph({ id, onRemove, totalGraphs }: GraphProps) {
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
              <SelectTrigger className={totalGraphs > 6 ? "h-8 text-xs" : ""}>
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

// Combined chart component
function CombinedChart({
  title,
  data = mockCombinedData,
  height = "h-[500px]",
}: { title: string; data?: typeof mockCombinedData; height?: string }) {
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
                  if (name.includes("Vehicle")) {
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

// Multi-graph dashboard component
function MultiGraphDashboard() {
  const [graphs, setGraphs] = useState([0]) // Start with one graph
  const [nextId, setNextId] = useState(1)
  const [gridCols, setGridCols] = useState("md:grid-cols-1")

  // Update grid columns based on number of graphs
  useEffect(() => {
    if (graphs.length === 1) {
      setGridCols("md:grid-cols-1") // Single graph takes full width
    } else {
      setGridCols("md:grid-cols-2") // All other cases use 2 columns max
    }
  }, [graphs.length])

  const addGraph = () => {
    setGraphs([...graphs, nextId])
    setNextId(nextId + 1)
  }

  const removeGraph = (id: number) => {
    setGraphs(graphs.filter((graphId) => graphId !== id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Custom Analysis Graphs</h2>
        <Button onClick={addGraph} className="flex items-center gap-1">
          <PlusCircle className="h-4 w-4 mr-1" />
          Add Graph
        </Button>
      </div>

      <div className={`grid gap-4 ${gridCols}`}>
        {graphs.map((id) => (
          <WasteGraph key={id} id={id} onRemove={removeGraph} totalGraphs={graphs.length} />
        ))}
      </div>

      {graphs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No graphs to display. Add a graph to start analyzing waste disposal data.
          </p>
          <Button onClick={addGraph} className="mt-4 flex items-center gap-1 mx-auto">
            <PlusCircle className="h-4 w-4 mr-1" />
            Add Graph
          </Button>
        </div>
      )}
    </div>
  )
}

// Year-over-year comparison dashboard
function YearComparisonDashboard() {
  const [selectedMaterial, setSelectedMaterial] = useState(mockData.materials[0])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Year-over-Year Comparison</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Material:</span>
          <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
            <SelectTrigger className="w-[200px]">
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

      <CombinedChart title={`${selectedMaterial} 2024`} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </div>
  )
}

export default function UnifiedWasteDashboard() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Waste Disposal Analysis Dashboard</h1>
      </div>

      <Tabs defaultValue="multi-graph" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="multi-graph" className="flex items-center gap-2">
            <BarChart4 className="h-4 w-4" />
            <span>Multi-Graph View</span>
          </TabsTrigger>
          <TabsTrigger value="year-comparison" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            <span>Year Comparison</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="multi-graph">
          <MultiGraphDashboard />
        </TabsContent>
        <TabsContent value="year-comparison">
          <YearComparisonDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
