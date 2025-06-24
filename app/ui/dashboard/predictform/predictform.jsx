"use client"

import { useState, useEffect, useCallback } from "react"
import { getAvailableModels } from "@/app/lib/model-service"
import Papa from "papaparse"
import { Wrapper } from '@googlemaps/react-wrapper'
import styles from "./predictform.module.css"

export default function PredictForm({ onPredictionComplete }) {
  const [mode, setMode] = useState("upload")
  const [modelType, setModelType] = useState("lstm")
  const [fileData, setFileData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState(null)   // { lat, lng }
  const [polygon, setPolygon] = useState(null)

  // parse CSV upload
  const handleFileChange = e => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = event => {
      Papa.parse(event.target.result, {
        header: true,
        dynamicTyping: true,
        complete: results => setFileData({ data: results.data, file })
      })
    }
    reader.readAsText(file)
  }

  // browser geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.")
      return
    }
    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCoords({ lat, lng })
        window.localStorage.setItem("farmCoords", JSON.stringify({ lat, lng }))
        setLoading(false)
      },
      () => {
        alert("Could not fetch location.")
        setLoading(false)
      }
    )
  }

  // clear stored
  const handleClearLocation = () => {
    window.localStorage.removeItem("farmCoords")
    setCoords(null)
  }

  // on mount, load stored coords
  useEffect(() => {
    const stored = window.localStorage.getItem("farmCoords")
    if (stored) {
      try {
        const { lat, lng } = JSON.parse(stored)
        if (typeof lat === 'number' && typeof lng === 'number') {
          setCoords({ lat, lng })
        }
      } catch {}
    }
  }, [])

  // init map + drawing
  const onMapLoad = useCallback(map => {
    if (!window.google?.maps?.drawing) return
    const mgr = new window.google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        drawingModes: [window.google.maps.drawing.OverlayType.POLYGON]
      }
    })
    mgr.setMap(map)
    mgr.addListener('overlaycomplete', e => {
      if (polygon) polygon.setMap(null)
      e.overlay.setEditable(false)
      setPolygon(e.overlay)
      const path = e.overlay.getPath().getArray()
      const n = path.length, sum = path.reduce((acc, p) => ({ lat: acc.lat + p.lat(), lng: acc.lng + p.lng() }), { lat: 0, lng: 0 })
      const centroid = { lat: sum.lat / n, lng: sum.lng / n }
      setCoords(centroid)
      window.localStorage.setItem("farmCoords", JSON.stringify(centroid))
    })
  }, [polygon])

  // prediction
  const handlePredict = async () => {
    if (mode === 'upload' && !fileData) return alert("Upload CSV.")
    if (mode === 'nasa' && !coords) return alert("Click 'Use My Location' or draw on the map.")
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('mode', mode)
      formData.append('model', modelType)
      if (mode === 'upload') formData.append('file', fileData.file)
      else {
        formData.append('lat', coords.lat.toString())
        formData.append('lon', coords.lng.toString())
      }
      const res = await fetch('/api/predict', { method: 'POST', body: formData })
      if (!res.ok) throw new Error(await res.text())
      const { day_ahead } = await res.json()
      onPredictionComplete({ modelType, SingleStep: day_ahead[0], dayAhead: day_ahead, createdAt: new Date().toISOString(), fileData: mode === 'upload' ? fileData : null, coords })
    } catch (err) {
      console.error(err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Meteorological Data Source</h3>
      {/* mode selector */}
      <div className={styles.predictButton}>
        <label><input type="radio" name="mode" value="upload" checked={mode==='upload'} onChange={()=>{setMode('upload'); setFileData(null)}}/> Upload CSV</label>
        <label style={{ marginLeft:16 }}><input type="radio" name="mode" value="nasa" checked={mode==='nasa'} onChange={()=>{setMode('nasa');}}/> Use NASA Data</label>
      </div>
      {mode==='upload' && <input type="file" accept=".csv" onChange={handleFileChange} disabled={loading} className={styles.predictButton}/>}      
      {mode==='nasa' && (
        <div style={{ margin:'1rem 0' }}>
          {coords ? (
            <><p>📍 lat {coords.lat.toFixed(5)}, lng {coords.lng.toFixed(5)}</p><button onClick={handleClearLocation} disabled={loading} className={styles.predictButton}>Change</button></>
          ) : (
            <button onClick={handleUseMyLocation} disabled={loading} className={styles.predictButton}>{loading?'Getting…':'Use My Location'}</button>
          )}
          <div style={{ height:300, width:'100%', marginTop:8 }}>
            <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={['drawing']}>
              {/** only render map container after script loaded */}
              <div id="map" style={{ height:'100%' }} ref={el => {
                if (!el || !window.google?.maps) return
                const map = new window.google.maps.Map(el, { center: coords||{lat:0,lng:0}, zoom: coords?12:2 })
                onMapLoad(map)
              }}/>
            </Wrapper>
          </div>
        </div>
      )}
      {/* model selector */}
      <select value={modelType} onChange={e=>setModelType(e.target.value)} className={styles.select}>
        {getAvailableModels().map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <button onClick={handlePredict} disabled={loading|| (mode==='upload'&&!fileData)} className={styles.predictButton}>{loading?'Predicting...':'Predict'}</button>
    </div>
  )
}