"use client"
import styles from "./chart.module.css"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, LabelList } from 'recharts';

const standard = 2.8;
const max = 5.1;
const min = 1.2;

const pvData = [
    {
      date: '2020-04-01',
      actual: 3.2,
      predicted: 3.0,
      alert: 'Normal'
    },
    {
      date: '2020-04-02',
      actual: 3.5,
      predicted: 2.1,
      alert: 'YPL'
    },
    {
        date: '2020-04-03',
        actual: 3.2,
        predicted: 4.0,
        alert: 'OPL'
      },
      {
        date: '2020-04-04',
        actual: 4.5,
        predicted: 4.1,
        alert: 'Normal'
      },
      {
        date: '2020-04-05',
        actual: 2.2,
        predicted: 1.0,
        alert: 'OPL'
      },
      {
        date: '2020-04-06',
        actual: 4.5,
        predicted: 2.1,
        alert: 'RPL'
      },
    // ... up to 2020-06-29
  ];
  

const Chart = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>PV Power Forecast with Alert Levels</h2>
            <ResponsiveContainer width="100%" height="95%">
                <LineChart data={pvData} className={styles.chart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis stroke= "white" dataKey="date" angle={-45} textAnchor="end" height={50} fontSize={7} />
                    <YAxis stroke= "white" fontSize={7} label={{ value: 'PV Power (kWh)', angle: -90, position: 'insideLeft', style: { fill: 'white', fontSize: 10 }}} />
                    <Tooltip contentStyle={{background:"#A5BFCC", border:"none"}} />
                    
                    <Legend
                        verticalAlign="bottom"
                        wrapperStyle={{
                            color: 'white',
                            fontSize: 10,
                            paddingTop: 10,
                            display: 'flex',
                            justifyContent: 'center',
                        }}
                    />

                    <ReferenceLine y={standard} stroke="black" label={{value: 'Standard',position: 'top',style: { fill: 'white', fontSize: 10 },}} />
                    <ReferenceLine y={max} stroke="green" label={{value: 'Max',position: 'top',style: { fill: 'white', fontSize: 10 },}} />
                    <ReferenceLine y={min} stroke="orange" label={{value: 'Min',position: 'top',style: { fill: 'white', fontSize: 10 },}} />

                    <Line type="monotone" dataKey="actual" stroke="blue" name="Actual PV Power" fontSize={10} />
                    <Line type="monotone" dataKey="predicted" stroke="red" strokeDasharray="5 5" name="Predicted PV Power" fontSize={10}>
                        <LabelList dataKey="alert" position="top" 
                            content={({ x, y, value }) => (
                                <text
                                  x={x}
                                  y={y - 5}
                                  fill="white"
                                  fontSize={10}
                                  textAnchor="middle"
                                >
                                  {value}
                                </text>
                              )}
                        />
                    </Line>
                </LineChart>
            </ResponsiveContainer>

        </div>
    )
}

export default Chart
