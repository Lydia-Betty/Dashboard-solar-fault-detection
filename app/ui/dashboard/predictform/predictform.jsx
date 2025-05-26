"use client"
import { useState } from "react"
import {getAvailableModels } from "@/app/lib/model-service"
import Papa from "papaparse"
import styles from "./predictform.module.css"

const PredictForm = ({ onPredictionComplete }) => {
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
    if (!fileData || !fileData.file) return alert("Upload valid data")
  
    setLoading(true)
    console.log("👉 About to send POST /predict with", fileData.file, modelType)
  
    try {
      const formData = new FormData()
      formData.append("file", fileData.file)
      formData.append("model", modelType)
      
  
      const response = await fetch("/api/predict", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const { one_step, day_ahead } = await response.json()
        console.log("🟢 /predict returned day_ahead:", day_ahead);
        onPredictionComplete({
          modelType,
          singleStep: one_step,
          dayAhead: day_ahead,
          createdAt: new Date().toISOString(),
          fileData,
        })
      } else {
        try {
          const error = await response.json();
          console.error("Prediction error:", error?.error || "Unknown error")
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
      <h3 className={styles.title}>Upload Meteorological Data</h3>
      <input type="file" accept=".csv" onChange={handleFileChange} />

      <select value={modelType} onChange={(e) => setModelType(e.target.value)} className={styles.select}>
        {getAvailableModels().map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>

      <button onClick={handlePredict} disabled={loading} className={styles.predictButton}>
        {loading ? "Predicting..." : "Predict"}
      </button>
    </div>
  )
}

export default PredictForm
