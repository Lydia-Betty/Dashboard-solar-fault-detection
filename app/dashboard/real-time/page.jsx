"use client"

import { useState, useEffect } from "react"
import styles from "./real-time.module.css"
import Card from "@/app/ui/dashboard/card/card"
import Rightbar from "@/app/ui/dashboard/rightbar/rightbar"
import { MdPlayArrow, MdPause, MdRefresh, MdWarning } from "react-icons/md"

export default function RealTimePage() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [chartData, setChartData] = useState([])
  const [alertLevel, setAlertLevel] = useState("normal")
  const [panelSpecs, setPanelSpecs] = useState({
    area: 1.7,
    efficiency: 0.19,
    numberOfPanels: 1,
    totalArea: 1.7,
  })

  // Simulate real-time data
  useEffect(() => {
    let interval
    if (isStreaming) {
      interval = setInterval(() => {
        const now = new Date()
        const timeString = now.toLocaleTimeString()

        // Generate random data
        const irradiance = Math.random() * 200 + 600 // 600-800 W/m²
        const pvPower = calculatePvPower(irradiance, panelSpecs)

        // Determine alert level based on power
        let newAlertLevel = "normal"
        if (pvPower < 100) newAlertLevel = "red"
        else if (pvPower < 200) newAlertLevel = "orange"
        else if (pvPower < 300) newAlertLevel = "yellow"

        setAlertLevel(newAlertLevel)

        setChartData((prev) => {
          const newData = [
            ...prev,
            {
              time: timeString,
              irradiance,
              pvPower,
              timestamp: now.getTime(),
            },
          ]

          // Keep only the last 20 data points
          if (newData.length > 20) {
            return newData.slice(newData.length - 20)
          }
          return newData
        })
      }, 3000)
    }

    return () => clearInterval(interval)
  }, [isStreaming, panelSpecs])

  // Calculate PV power from irradiance using panel specs
  function calculatePvPower(irradiance, specs) {
    // PV Power (W) = Irradiance (W/m²) × Total Area (m²) × Efficiency
    return irradiance * specs.totalArea * specs.efficiency
  }

  // Handle panel specs change
  function handlePanelSpecsChange(specs) {
    setPanelSpecs(specs)
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Real-time Monitoring</h1>
            <p className={styles.subtitle}>Live PV power generation data</p>
          </div>

          <div className={styles.actions}>
            <div className={`${styles.badge} ${styles[alertLevel]}`}>
              {alertLevel === "normal"
                ? "Normal"
                : alertLevel === "yellow"
                  ? "Yellow Alert"
                  : alertLevel === "orange"
                    ? "Orange Alert"
                    : "Red Alert"}
            </div>

            <button
              className={`${styles.button} ${isStreaming ? styles.destructive : ""}`}
              onClick={() => setIsStreaming(!isStreaming)}
            >
              {isStreaming ? (
                <>
                  <MdPause /> Stop Stream
                </>
              ) : (
                <>
                  <MdPlayArrow /> Start Stream
                </>
              )}
            </button>

            <button className={`${styles.button} ${styles.outline}`} onClick={() => setChartData([])}>
              <MdRefresh /> Reset
            </button>
          </div>
        </div>

        <div className={styles.cards}>
          <Card title="Accuracy" value="91%" change="+5%" positive={true} detail="vs last week" />
          <Card
            title="Current Irradiance"
            value={chartData.length > 0 ? `${chartData[chartData.length - 1].irradiance.toFixed(1)} W/m²` : "N/A"}
            detail={`Last updated: ${chartData.length > 0 ? chartData[chartData.length - 1].time : "N/A"}`}
          />
          <Card
            title="Current PV Power"
            value={chartData.length > 0 ? `${chartData[chartData.length - 1].pvPower.toFixed(1)} W` : "N/A"}
            detail="Based on selected panel configuration"
          />
        </div>

        <div className={styles.chartContainer}>
          <div className={styles.chartHeader}>
            <h2 className={styles.chartTitle}>Real-time Monitoring</h2>
            <p className={styles.chartSubtitle}>Live data visualization</p>
          </div>
          <div className={styles.tabs}>
            <button className={styles.tabActive}>PV Power</button>
            <button className={styles.tab}>Irradiance</button>
            <button className={styles.tab}>Combined View</button>
          </div>
          <div className={styles.chart}>
            {chartData.length > 0 ? (
              <div className={styles.chartContent}>
                {/* This would be your chart component */}
                <p>Chart would render here with {chartData.length} data points</p>
                {/* You can integrate your existing chart component here */}
              </div>
            ) : (
              <div className={styles.noData}>
                <MdWarning size={24} />
                <p>No data available. Start the stream to see real-time data.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.tableContainer}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Recent Predictions</h2>
            <p className={styles.tableSubtitle}>Latest data points with alert levels</p>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Timestamp</th>
                <th>Predictions</th>
                <th>Alerts</th>
              </tr>
            </thead>
            <tbody>
              {chartData
                .slice(-5)
                .reverse()
                .map((point, i) => (
                  <tr key={i}>
                    <td>{101 + i}</td>
                    <td>{point.time}</td>
                    <td>{point.pvPower.toFixed(1)}</td>
                    <td>
                      <div
                        className={`${styles.alertBadge} ${
                          styles[
                            point.pvPower < 100
                              ? "red"
                              : point.pvPower < 200
                                ? "orange"
                                : point.pvPower < 300
                                  ? "yellow"
                                  : "normal"
                          ]
                        }`}
                      >
                        {point.pvPower < 100
                          ? "Red level"
                          : point.pvPower < 200
                            ? "Orange level"
                            : point.pvPower < 300
                              ? "Yellow level"
                              : "Normal"}
                      </div>
                    </td>
                  </tr>
                ))}

              {chartData.length === 0 && (
                <tr>
                  <td colSpan={4} className={styles.noDataCell}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right sidebar for panel selection */}
      <div className={styles.rightSidebar}>
        <Rightbar onSpecsChange={handlePanelSpecsChange} />
      </div>
    </div>
  )
}
