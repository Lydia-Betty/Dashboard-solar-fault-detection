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

export default function Chart ({ predictions=[] }){

  // sort earliest→latest
  const data = predictions
    .slice()
    .sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map(x => ({
      label: formatDateTime(x.createdAt),
      predictedPV:    x.predictedPV,
      alert: x.alert,
    }));

      if (!data.length) {
        return <div>No forecasts yet</div>;
      }

    

// statistics
  const pvVals = data.map(d => d.pv);
  const minPV = Math.min(...pvVals);
  const maxPV = Math.max(...pvVals);
  const avgPV = pvVals.reduce( (sum,v)=> sum+v, 0 ) / pvVals.length;

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>PV Power Forecast with Alert Levels</h2>
            <ResponsiveContainer width="100%" height="95%">
              <LineChart data={data} className={styles.chart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis stroke="rgb(55, 58, 120)" dataKey="label" angle={-45} textAnchor="end" height={50} fontSize={7} interval={0} />
                <YAxis stroke="rgb(55, 58, 120)" fontSize={7} label={{ value: 'PV Power (Wh)', angle: -90, position: 'insideLeft', style: { fill: 'rgb(55, 58, 120)', fontSize: 10 }}} />
                <Tooltip
                  contentStyle={{ background: "#A5BFCC", border: "none" }}
                  labelFormatter={l => `Time: ${l}`}
                  formatter={v=>v.toFixed(2)}
                />
                <Legend verticalAlign="bottom" wrapperStyle={{ color: 'rgb(55, 58, 120)', fontSize: 10, paddingTop: 10, display: 'flex', justifyContent: 'center' }} />
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
                        <text x={x} y={y - 6} fill="rgb(55, 58, 120)" fontSize={10} textAnchor="middle">
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

