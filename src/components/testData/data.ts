// Mock data for individual graphs
export const mockData = {
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

export const mockCombinedData = [
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