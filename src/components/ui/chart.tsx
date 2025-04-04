import type React from "react"

export const AreaChart = ({ children, data, margin }: { children: React.ReactNode; data: any[]; margin: any }) => {
  return <svg>{children}</svg>
}

export const Area = ({
  type,
  dataKey,
  stroke,
  fill,
  fillOpacity,
  name,
}: { type: string; dataKey: string; stroke: string; fill: string; fillOpacity: number; name: string }) => {
  return <g />
}

export const XAxis = ({ dataKey, label }: { dataKey: string; label: any }) => {
  return <g />
}

export const YAxis = ({ label }: { label: any }) => {
  return <g />
}

export const CartesianGrid = ({ strokeDasharray }: { strokeDasharray: string }) => {
  return <g />
}

export const Tooltip = ({ formatter, labelFormatter }: { formatter: any; labelFormatter: any }) => {
  return <g />
}

export const ResponsiveContainer = ({
  children,
  width,
  height,
}: { children: React.ReactNode; width: string; height: string }) => {
  return <div>{children}</div>
}

export const Legend = () => {
  return <g />
}

