"use client"

import { useState, useEffect } from "react"
import styles from "./analytics.module.css"
import Card from "@/app/ui/dashboard/card/card"
import Chart from "@/app/ui/dashboard/chart/chart"
import { MdCalendarMonth } from "react-icons/md"

// If you want to show model accuracy metrics:
const models = [
  { id: "lstm",       name: "LSTM",       metrics: { accuracy: "77%" } },
  { id: "bilstm",     name: "Bi-LSTM",    metrics: { accuracy: "78%" } },
  { id: "transformer",name: "Transformer",metrics: { accuracy: "96%" } },
  { id: "tft",        name: "TFT",        metrics: { accuracy: "78%" } },
]

export default function AnalyticsPage() {
  const [predictions, setPredictions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [timeframe, setTimeframe] = useState('week');
  const [selectedModel, setSelectedModel] = useState("lstm")
 
  useEffect(() => {
      setIsLoading(true)
      fetch("/api/predictions")
        .then((res) => res.json())
        .then((data) => {
          setPredictions(data)
          setIsLoading(false)
        })
        .catch((err) => {
          console.error("Failed to load predictions:", err)
          setIsLoading(false)
        })
    }, [])

  // Build a time‑series chart (e.g., grouping by day or month)
  // For example aggregate by date:
      // Helper to compute average forecast per day (YYYY‑MM‑DD)
  const dailyAverages = (() => {
    const agg = {}
    predictions.forEach((doc) => {
      if (doc.modelName !== selectedModel) return
      const day = new Date(doc.createdAt).toISOString().slice(0, 10)
      agg[day] = agg[day] || { total: 0, count: 0 }
      agg[day].total += doc.predictions[0]
      agg[day].count += 1
    })
    return Object.entries(agg)
      .map(([date, { total, count }]) => ({
        date,
        predicted: total / count,
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1))
  })()

  const getModelAccuracy = () => {
    const m = models.find((m) => m.id === selectedModel)
    return m?.metrics.accuracy || "N/A"
  }

  return (
    <div className={styles.container}>

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Analytics</h1>
          <p className={styles.subtitle}>Analyze your PV system performance</p>
        </div>
        
        <div className={styles.actions}>
          <select
            className={styles.select}
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="monthly">Monthly</option>
          </select>

          <select
            className={styles.select}
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <button className={styles.dateButton}>
            <MdCalendarMonth />
            <span>Last 30 Days</span>
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className={styles.cards}>
        <Card title="Total Predictions" value={predictions.length} detail="records stored" />
        <Card title="Period" value={timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} />
        <Card title="Model Accuracy" value={getModelAccuracy()} />
        <Card title="Selected Model" value={models.find((m) => m.id === selectedModel)?.name} />
      </div>

      {/* Production vs. Forecast Chart */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h2 className={styles.chartTitle}>Average Forecast ({timeframe})</h2>
          <p className={styles.chartSubtitle}>
            {isLoading
              ? "Loading prediction data..."
              : dailyAverages.length
              ? ""
              : "No data available for this model"}
          </p>
        </div>
        <div className={styles.chart}>
          {!isLoading && dailyAverages.length > 0 ? (
            <Chart
              predictions={dailyAverages.flatMap(d => {
                // d.date = '2025-07-15'
                return Array.from({ length: 24 }, (_, hour) => {
                  const timestamp = new Date(`${d.date}T${hour.toString().padStart(2,'0')}:00:00Z`).toISOString()
                  return {
                    _id: `${d.date}-${hour}`, 
                    createdAt: timestamp,
                    predictedPV: d.predicted, // or however you want to interpolate
                    predictions: [d.predicted],
                    inputData: []
                  }
                })
              })}
            />
          ) : (
            <div className={styles.chartPlaceholder}>
              <p>{isLoading ? "Loading..." : "No data to display"}</p>
            </div>
          )}
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
            <h2 className={styles.chartTitle}>Model Prediction Accuracy</h2>
            <p className={styles.chartSubtitle}>Comparing different model performance</p>
          </div>
          <div className={styles.metricsContainer}>
            {models.map((model) => (
              <div key={model.id} className={styles.metric}>
                <div className={styles.metricHeader}>
                  <span>{model.name}</span>
                  <span>{model.metrics ? model.metrics.accuracy : "N/A"}</span>
                </div>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progress}
                    style={{
                      width: model.metrics ? model.metrics.accuracy : 0,
                      backgroundColor:
                        model.id === "lstm"
                          ? "var(--primary)"
                          : model.id === "bilstm"
                          ? "var(--green)"
                          : model.id === "transformer"
                          ? "var(--purple)"
                          : "var(--yellow)",
                          }}
                  ></div>
                </div>
              </div>
            ))}

                </div>

        </div>
      </div>
    </div>
  )
}
