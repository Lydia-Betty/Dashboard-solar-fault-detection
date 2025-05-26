"use client"
import Card from "../ui/dashboard/card/card"
import Rightbar from "../ui/dashboard/rightbar/rightbar"
import styles from "../ui/dashboard/dashboard.module.css"
import Recentpredictions from "../ui/dashboard/recentpredictions/recentpredictions"
import Chart from "../ui/dashboard/chart/chart"
import PredictForm from "../ui/dashboard/predictform/predictform"
import { useState, useEffect } from "react"

async function saveEnrichedDocs(docs) {
  // docs is an array of fully‐formed objects:
  // { modelName, createdAt, predictions: [irr], predictedPV, alert }
  const res = await fetch("/api/predictions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ docs }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error || "Could not save predictions");
  }
  return res.json();
}



const Dashboard=()=>  {
  const [batch, setBatch] = useState([])

  // 2) Panel specs from the right side (area per panel, efficiency, count, totalArea)
  const [specs, setSpecs] = useState({
    area: 0,
    efficiency: 0,
    numberOfPanels: 0,
    totalArea: 0,
  })

  useEffect(() => {
    fetch("/api/predictions")
      .then((r) => r.json())
      .then((data) => {
        // data should be array of docs with predictedPV & alert
        setBatch(data);
      })
      .catch(console.error);
  }, []);

  // whenever specs change, downstream data will recalc PV power
  const onSpecsChange = (newSpecs) => {
    setSpecs(newSpecs)
  }

  // on new predictions, stitch together the payload your child comps expect
  const handleNewPredictions = async ({ modelType, dayAhead, createdAt}) => {
    const docs = dayAhead.map((irr, i) => {
      const { totalArea, efficiency } = specs

      // compute PV power
      const predictedPV = irr * totalArea * efficiency;
      // compute alert level
      let alert = "Normal";
      if (irr < 1.2) alert = "RPL";
      else if (irr < 2.8) alert = "OPL";
      else if (irr < 5.1) alert = "YPL";

      // advance timestamp for each step
      const base = new Date(createdAt);
      base.setHours(base.getHours() + i);
      const ts = base.toISOString();

      return {
        modelName: modelType,
        createdAt: ts,
        predictions: [irr],
        predictedPV,
        alert,
      };
    });

    try {
      // 1) Save into MongoDB
      await saveEnrichedDocs(docs);

      setBatch((prev) => {
        return [...docs, ...prev]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 100);
      });

      console.log({ modelType, dayAhead, specs });

    }catch (err) {
      console.error("Save error:", err);
    }
  }

  // detect “no specs chosen yet”:
  const specsReady = specs.totalArea > 0 && specs.efficiency > 0
  

    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className={styles.cards}>
                    <Card/>
                    <Card/>
                    <Card/>
                </div>
                <PredictForm
                    onPredictionComplete={handleNewPredictions}
                />
                {!specsReady && (
                  <div style={{ color: "orange", margin: "1rem 0" }}>
                    Please select a panel on the right to enable PV power plotting.
                  </div>
                )}

                
                {specsReady
                  ? <Chart predictions={batch}/>
                  : <div style={{ margin: "2rem", color: "#888" }}>
                      Chart will appear once panel specs are set.
                    </div>
                }
                <Recentpredictions predictions={batch}/>
            </div>


            <div className={styles.side}>
                <Rightbar onSpecsChange={onSpecsChange}/>
            </div>
            
        </div>
    )

}
export default Dashboard;