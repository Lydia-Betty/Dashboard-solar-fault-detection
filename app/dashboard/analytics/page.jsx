"use client"

import { useState } from "react"
import styles from "./analytics.module.css"
import Card from "@/app/ui/dashboard/card/card"
import { MdCalendarMonth } from "react-icons/md"

// Sample data for analytics
const monthlyData = [
  { month: "Jan", production: 420, forecast: 450 },
  { month: "Feb", production: 480, forecast: 500 },
  { month: "Mar", production: 650, forecast: 630 },
  { month: "Apr", production: 780, forecast: 800 },
  { month: "May", production: 820, forecast: 850 },
  { month: "Jun", production: 880, forecast: 900 },
  { month: "Jul", production: 890, forecast: 920 },
  { month: "Aug", production: 840, forecast: 870 },
  { month: "Sep", production: 720, forecast: 750 },
  { month: "Oct", production: 580, forecast: 600 },
  { month: "Nov", production: 460, forecast: 480 },
  { month: "Dec", production: 390, forecast: 410 },
]

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState("monthly")

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Analyze your PV system performance</p>
        </div>

        <div className={styles.actions}>
          <select className={styles.select} value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>

          <button className={styles.dateButton}>
            <MdCalendarMonth />
            <span>Apr 24, 2025 - May 4, 2025</span>
          </button>
        </div>
      </div>

      <div className={styles.cards}>
        <Card title="Total Production" value="7,842 kWh" change="+12%" positive={true} detail="from previous period" />
        <Card
          title="Average Daily Production"
          value="21.5 kWh"
          change="+5%"
          positive={true}
          detail="from previous period"
        />
        <Card title="Peak Production" value="4.8 kW" detail="On July 15th at 12:30" />
        <Card title="Forecast Accuracy" value="91%" change="+5%" positive={true} detail="vs last week" />
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>Production vs Forecast</h2>
          <p className={styles.chartSubtitle}>Comparing actual production with forecasted values</p>
        </div>
        <div className={styles.chart}>
          {/* This would be your chart component */}
          <div className={styles.chartPlaceholder}>
            <p>Chart showing {timeframe} production vs forecast data</p>
            <p className={styles.chartNote}>Using your existing chart component</p>
          </div>
        </div>
      </div>

      <div className={styles.twoColumns}>
        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>System Efficiency Analysis</h2>
            <p className={styles.chartSubtitle}>Breakdown of efficiency factors</p>
          </div>
          <div className={styles.chart}>
            <div className={styles.chartPlaceholder}>
              <p>Pie chart showing efficiency breakdown</p>
              <ul className={styles.efficiencyList}>
                <li>
                  <span className={styles.colorBox} style={{ backgroundColor: "#0088FE" }}></span> Panel Efficiency: 19%
                </li>
                <li>
                  <span className={styles.colorBox} style={{ backgroundColor: "#00C49F" }}></span> Inverter Losses: 3%
                </li>
                <li>
                  <span className={styles.colorBox} style={{ backgroundColor: "#FFBB28" }}></span> Wiring Losses: 2%
                </li>
                <li>
                  <span className={styles.colorBox} style={{ backgroundColor: "#FF8042" }}></span> Dirt/Dust: 4%
                </li>
                <li>
                  <span className={styles.colorBox} style={{ backgroundColor: "#8884D8" }}></span> Temperature: 5%
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Performance Metrics</h2>
            <p className={styles.chartSubtitle}>Key performance indicators</p>
          </div>
          <div className={styles.metricsContainer}>
            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span>Performance Ratio</span>
                <span>87%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: "87%" }}></div>
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span>Capacity Factor</span>
                <span>22%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: "22%", backgroundColor: "var(--green)" }}></div>
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span>Specific Yield</span>
                <span>4.2 kWh/kWp</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: "75%", backgroundColor: "var(--purple)" }}></div>
              </div>
            </div>

            <div className={styles.metric}>
              <div className={styles.metricHeader}>
                <span>System Availability</span>
                <span>99.7%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progress} style={{ width: "99.7%", backgroundColor: "var(--yellow)" }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
