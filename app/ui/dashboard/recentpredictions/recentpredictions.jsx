import styles from "./recentpredictions.module.css"


export default function Recentpredictions ({ predictions=[] }) {
    if (!predictions) return <div>No data available</div>;
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Recent Predictions</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <td>ID</td>
                        <td>Timestamp</td>
                        <td>Irradiation (W/m²)</td>
                        <td>PV Power (Wh)</td>
                        <td>Alerts</td>
                    </tr>
                </thead>
                <tbody>
                    {predictions.map((item, idx) => {
                        const irr = (item.predictions?.[0] ?? 0).toFixed(3);
                        const pv  = (item.predictedPV ?? 0).toFixed(2);
                        const dt  = new Date(item.createdAt).toLocaleString(undefined, {
                        year: "numeric",
                        month:"2-digit",
                        day:  "2-digit",
                        hour: "2-digit",
                        minute:"2-digit" })

                        const level = pv< 1.2
                        ? "RPL"
                        : pv < 2.8
                        ? "OPL"
                        : pv < 5.1
                        ? "YPL"
                        : "Normal"

                        const levelLabel =
                        level === "RPL"
                            ? "Red level"
                            : level === "OPL"
                            ? "Orange level"
                            : level === "YPL"
                            ? "Yellow level"
                            : "Normal"

                        return (
                        <tr key={item._id || idx}>
                            <td>{String(item._id || "").slice(-4)}</td>
                            <td>{dt}</td>
                            <td>{irr}</td>
                            <td>{pv}</td> 
                            <td>
                                <span className={`${styles.status} ${styles[level.toLowerCase()]}`}>
                                    {levelLabel}
                                </span>
                            </td>
                        </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
