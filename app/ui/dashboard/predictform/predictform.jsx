"use client"

import { useState, useEffect } from "react"
import {getAvailableModels } from "@/app/lib/model-service"
import Papa from "papaparse"
import styles from "./predictform.module.css"

export default function PredictForm({ onPredictionComplete }) {
  const [mode, setMode]       = useState("upload")
  const [modelType, setModelType] = useState("lstm")
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState(null);

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
      }else {
        if (!coords) {
          alert("Please click “Use My Location” first.");
          setLoading(false);
          return;
        }
        formData.append("lat", coords.lat.toString());
        formData.append("lon", coords.lon.toString());
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
          coords,
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
  
useEffect(() => {
    const stored = window.localStorage.getItem("myFarmCoords");
    if (stored) {
      try {
        const { lat, lon } = JSON.parse(stored);
        // Only accept if both lat and lon are valid numbers
        if (typeof lat === "number" && typeof lon === "number") {
          setCoords({ lat, lon });
        }
      } catch (_) {
        // if parse error, ignore
        window.localStorage.removeItem("myFarmCoords");
      }
    }
  }, []);

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        window.localStorage.setItem("myFarmCoords", JSON.stringify({ lat, lon }));
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Couldn’t fetch your location (permission denied or unavailable).");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function handleClearLocation() {
    window.localStorage.removeItem("myFarmCoords");
    setCoords(null);
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

      
      {mode === "nasa" && (
        <div style={{ marginTop: "0.5rem" }}>
          {coords ? (
            <>
              <p>
                📍 Using my location: lat {coords.lat.toFixed(5)}, lon {coords.lon.toFixed(5)}
              </p>
              <button onClick={handleClearLocation} disabled={loading} className={styles.predictButton}>
                Change Location
              </button>
            </>
          ) : (
            <button onClick={handleUseMyLocation} disabled={loading} className={styles.predictButton}>
              {loading ? "Getting location…" : "Use My Location"}
            </button>
          )}
        </div>
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

