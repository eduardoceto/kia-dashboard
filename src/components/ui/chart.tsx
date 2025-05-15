import type React from "react"

export const AreaChart = ({ children }: { children: React.ReactNode }) => {
  return <svg>{children}</svg>
}

export const Area = ({ children }: { children?: React.ReactNode }) => {
  return <g>{children}</g>
}

export const XAxis = () => {
  return <g />
}

export const YAxis = () => {
  return <g />
}

export const CartesianGrid = () => {
  return <g />
}

export const Tooltip = () => {
  return <g />
}

export const ResponsiveContainer = ({ children }: { children: React.ReactNode }) => {
  return <div>{children}</div>
}

export const Legend = () => {
  return <g />
}

