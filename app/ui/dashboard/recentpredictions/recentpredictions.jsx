import styles from "./recentpredictions.module.css"


const Recentpredictions = ({ predictions }) => {
    if (!predictions) return <div>No data available</div>;
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Recent Predictions</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <td>ID</td>
                        <td>Timestamp</td>
                        <td>Irradiation</td>
                        <td>PV Power (kWh)</td>
                        <td>Alerts</td>
                    </tr>
                </thead>
                <tbody>
                    {predictions.map((item, index) => {
                        const irradiance = item.predictions[0] ?? 0
                        const pvKilowatt = item.predictedPV ?? 0

                        const level = pvKilowatt < 1.2
                        ? "RPL"
                        : pvKilowatt < 2.8
                        ? "OPL"
                        : pvKilowatt < 5.1
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
                        <tr key={item._id || index}>
                            <td>{String(item._id || "").slice(-4)}</td>
                            <td>{new Date(item.createdAt).toLocaleDateString(undefined, {year: "numeric",month: "2-digit",day: "2-digit",hour: "2-digit",minute: "2-digit",})}</td>
                            <td>{irradiance.toFixed(3)}</td>
                            <td>{pvKilowatt.toFixed(2)}</td> {/* new PV column */}
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

export default Recentpredictions