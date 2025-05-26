"use client"
import styles from "./chart.module.css"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, LabelList } from 'recharts';

// helper to format ISO → “YYYY‑MM‑DD HH:mm”
function formatDateTime(isoString) {
  const dt = new Date(isoString)
  const yyyy = dt.getFullYear()
  const mm = String(dt.getMonth() + 1).padStart(2, "0")
  const dd = String(dt.getDate()).padStart(2, "0")
  const hh = String(dt.getHours()).padStart(2, "0")
  const min = String(dt.getMinutes()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`
}

const Chart = ({ predictions }) => {
  if (!predictions) return <div>No data available</div>;

  const today = new Date().toISOString().split("T")[0];

    const pvData = predictions
    .slice()                     // make a copy
    .reverse()
    .map((item) => {
      const dt = new Date(item.createdAt);
      const hour = dt.getHours().toString().padStart(2, "0") + ":00";
      let alert = "Normal"
      if (item.predictedPV < 1.2) alert = "RPL"
      else if (item.predictedPV < 2.8) alert = "OPL"
      else if (item.predictedPV < 5.1) alert = "YPL"
      return {
        date: item.createdAt,
        label: formatDateTime(item.createdAt),
        predictedPV: item.predictedPV,     // your computed PV power
        alert         // expect "Normal", "OPL", etc.
      };
    })

    console.log({
      today,
      timestamps: predictions.slice(0,5).map((p) =>
        p.createdAt?.slice(0,10)
      )
    });

      // 2) Compute min, max, and standard (mean) from the pv values
  const pvValues = pvData.map((d) => d.predictedPV)
  const minPV = Math.min(...pvValues)
  const maxPV = Math.max(...pvValues)
  const avgPV = pvValues.reduce((sum, v) => sum + v, 0) / pvValues.length

    if (pvData.length === 0) {return <div>No forecasts for today yet</div>;}


    return (
        <div className={styles.container}>
            <h2 className={styles.title}>PV Power Forecast with Alert Levels</h2>
            <ResponsiveContainer width="100%" height="95%">
              <LineChart data={pvData} className={styles.chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis stroke="white" dataKey="label" domain={['dataMin','dataMax']} angle={-45} textAnchor="end" height={50} fontSize={7} interval={0} />
                <YAxis stroke="white" fontSize={7} label={{ value: 'PV Power (kWh)', angle: -90, position: 'insideLeft', style: { fill: 'white', fontSize: 10 }}} />
                <Tooltip
                  contentStyle={{ background: "#A5BFCC", border: "none" }}
                  labelFormatter={(label) => `Time: ${label}`}
                  formatter={(value) =>
                    Number.isFinite(value) ? value.toFixed(2) : "N/A"
                  }
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ color: 'white', fontSize: 10, paddingTop: 10, display: 'flex', justifyContent: 'center' }} />
                <ReferenceLine y={avgPV} stroke="black" label={{ value: `Avg (${avgPV.toFixed(1)})`, position: 'top', style: { fill: 'white', fontSize: 10 } }} />
                <ReferenceLine y={maxPV} stroke="green" label={{ value: `Max (${maxPV.toFixed(1)})`, position: 'top', style: { fill: 'white', fontSize: 10 } }} />
                <ReferenceLine y={minPV} stroke="orange" label={{ value: `Min (${minPV.toFixed(1)})`, position: 'top', style: { fill: 'white', fontSize: 10 } }} />

                {/* <Line type="monotone" dataKey="actual" stroke="blue" name="Actual PV Power" fontSize={10} /> */}
                <Line type="monotone" dataKey="predictedPV" stroke="red" strokeDasharray="5 5" name="Predicted PV Power" fontSize={10}>
                  <LabelList
                    dataKey="alert"
                    position="top"
                    content={({ x, y, value }) => {
                      if (!Number.isFinite(y)) return null
                      return (
                        <text x={x} y={y - 6} fill="white" fontSize={10} textAnchor="middle">
                          {value}
                        </text>
                      ) 
                    }}
                  />

                </Line>
              </LineChart>
            </ResponsiveContainer>

        </div>
    )
}

export default Chart
