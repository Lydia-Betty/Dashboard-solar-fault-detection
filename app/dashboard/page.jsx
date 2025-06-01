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
  const [specs, setSpecs] = useState(() => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("panelSpecs");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
            // if parsing fails, fall back to defaults
          }
        }
      }
      return {
        area: 0,
        efficiency: 0,
        numberOfPanels: 0,
        totalArea: 0,
      };
    });

    useEffect(() => {
      if (typeof window !== "undefined") {
        localStorage.setItem("panelSpecs", JSON.stringify(specs));
      }
    }, [specs]);



  useEffect(() => {
    fetch("/api/predictions")
      .then(r => r.json())
      .then(setBatch)
      .catch(console.error);
  }, []);

  // whenever specs change, downstream data will recalc PV power
  const onSpecsChange = (newSpecs) => {
    setSpecs(newSpecs)
  }
  

  // on new predictions, stitch together the payload your child comps expect
  const handleNewPredictions = async ({ modelType, dayAhead, createdAt}) => {
    const docs = dayAhead.map((irr, i) => {
       // clamp tiny irradiance at night to zero
      const clippedIrr = irr < 1e-3 ? 0 : irr;

      // compute PV power
      const predictedPV = clippedIrr * specs.totalArea * specs.efficiency;
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
        predictions: [clippedIrr],
        predictedPV,
        alert,
      };
    });

    try {
      // 1) Save into MongoDB
      await saveEnrichedDocs(docs);

            // locally prepend and keep most recent 100
      setBatch(prev =>
        [ ...docs, ...prev ]
          .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 100)
      );

      console.log({ modelType, dayAhead, specs });

    }catch (err) {
      console.error("Save error:", err);
    }
  }

  // detect “no specs chosen yet”:
  const specsReady = specs.totalArea > 0 && specs.efficiency > 0
  


const computeTomorrowYield = () => {
  if (!batch || batch.length < 24 || !specsReady) return 0;

  // We assume batch[0..23] are the 24 hourly docs from the latest forecast time
  // (Ensure that your `setBatch` always prepends new docs in chronological order.)
  const latest24 = batch.slice(0, 24);
  // Sum predictedPV across those 24 docs:
  const total = latest24.reduce((acc, d) => acc + (d.predictedPV || 0), 0);
  const totalKWh = total / 1000
  // Round to one decimal if you like:
  return Math.round(totalKWh * 10) / 10;
};
const tomorrowYield = computeTomorrowYield();

const computeAlertFrequencies = () => {
  if (!batch || batch.length === 0) return { RPL: 0, OPL: 0, YPL: 0, Normal: 0 };

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const recent = batch.filter((d) => new Date(d.createdAt) >= sevenDaysAgo);
  const counts = { RPL: 0, OPL: 0, YPL: 0, Normal: 0 };
  for (let doc of recent) {
    if (doc.alert === "RPL") counts.RPL++;
    else if (doc.alert === "OPL") counts.OPL++;
    else if (doc.alert === "YPL") counts.YPL++;
    else if (doc.alert === "Normal") counts.Normal++;
  }
  return counts;
};
const alertCounts = computeAlertFrequencies();

 const [dailyError, setDailyError] = useState(null);

  useEffect(() => {
    // We only need to load once or whenever batch changes (if you want to recompute)
    async function loadError() {
      try {
        // Replace with your real fetch:
        // const resp = await fetch("/api/observations?date=yesterday");
        // const actuals = await resp.json();
        // Compute MAE, RMSE, etc. vs batch’s “yesterday’s forecast”.

        // For now, use dummy values:
        const summary = { MAE: 12.3, RMSE: 18.7, MAPE: 15.2 };
        setDailyError(summary);
      } catch (err) {
        console.error("Could not load daily error:", err);
      }
    }
    loadError();
  }, [batch]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.main}>
                <div className={styles.cards}>
                    <Card
                      title="Tomorrow’s PV Yield"
                      value={tomorrowYield}
                      unit="kWh"
                      deltaText=""               // no “vs last week” needed here
                      deltaIsPositive={true}
                    />
                    <Card
                      title="This Week’s Alerts"
                      value={
                        <>
                          <span className={styles.alertR}>RPL:{alertCounts.RPL}</span>
                          <span className={styles.alertO}>OPL:{alertCounts.OPL}</span>
                          <span className={styles.alertY}>YPL:{alertCounts.YPL}</span>
                          <span className={styles.alertNormal}>N:{alertCounts.Normal}</span>
                        </>
                      }
                      unit=""
                      deltaText=""               // no “vs last week” needed here
                      deltaIsPositive={true}
                    />
                    <Card
                      title="Yesterday’s Mean Absolut Error"
                      value={dailyError ? dailyError.MAE.toFixed(1) : "–"}
                      unit="W/m²"
                      deltaText=""               // no “vs last week” needed here
                      deltaIsPositive={true}
                    />
                </div>
                <PredictForm
                    onPredictionComplete={handleNewPredictions}
                />
                {specsReady
                  ? <Chart predictions={batch}/>
                  : <div style={{ margin: "2rem", color: "orange" }}>
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