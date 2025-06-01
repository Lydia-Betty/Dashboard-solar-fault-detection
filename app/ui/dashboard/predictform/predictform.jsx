"use client"

import { useState } from "react"
import {getAvailableModels } from "@/app/lib/model-service"
import Papa from "papaparse"
import styles from "./predictform.module.css"

const NASA_API = "https://power.larc.nasa.gov/api/temporal/hourly/point"

export default function PredictForm({ onPredictionComplete }) {
  const [mode, setMode]       = useState("upload")
  const [modelType, setModelType] = useState("lstm")
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
  
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
          setFileData({ data: results.data, file });
        }
      })
      };

    reader.readAsText(file);
  };


  const handlePredict = async () => {
    if (mode === "upload" &&(!fileData || !fileData.file))
      return alert("Upload valid data")
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("mode", mode)
      formData.append("model", modelType)
      if (mode === "upload") {
        formData.append("file", fileData.file);
      }
      

      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const {day_ahead } = await response.json()
        const one_step = day_ahead[0];
        console.log("🟢 /predict returned day_ahead:", day_ahead);
        onPredictionComplete({
          modelType,
          SingleStep: one_step,
          dayAhead: day_ahead,
          createdAt: new Date().toISOString(),
          fileData: mode === "upload" ? fileData: null,
        })
      } else {
        try {
          const error = await response.json();
          console.error("Prediction error:", error?.error || "Unknown error")
          alert("Not enough clean data to make a prediction. Try again later or choose a different location.")
        } catch (err) {
          console.error("Prediction failed, but could not parse JSON:", err)
        }
      }
    } catch (err) {
      console.error("Error during prediction:", err)
    } finally {
      setLoading(false)
    }
  }
  
  

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Meteorological Data Source</h3>
      <div className={styles.predictButton}>
        <label>
          <input
            type="radio"
            name="mode"
            value="upload"
            checked={mode === "upload"}
            onChange={() => {
              setMode("upload");
              setFileData(null);}
            }
          />{" "}
          Upload CSV
        </label>
        <label style={{ marginLeft: 16 }}>
          <input
            type="radio"
            name="mode"
            value="nasa"
            checked={mode === "nasa"}
            onChange={() => {
              setMode("nasa");
              setFileData(null);}
            }
          />{" "}
          Use NASA Data
        </label>
      </div>

      {mode === "upload" && (
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
          className={styles.predictButton}
        />
      )}

      {mode === "nasa" && (
        <p style={{ color: "gray", margin: "0.5rem 0" }}>
          No CSV required— server will fetch the data from NASA for you.
        </p>
      )}

      <select
        value={modelType}
        onChange={(e) => setModelType(e.target.value)}
        className={styles.select}
      >
        {getAvailableModels().map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>


      <button onClick={handlePredict} disabled={loading || (mode === "upload" && !fileData)} className={styles.predictButton}>
        {loading ? "Predicting..." : "Predict"}
      </button>
    </div>
  )
}

