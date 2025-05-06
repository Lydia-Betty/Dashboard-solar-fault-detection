import styles from "./recentpredictions.module.css"

const Recentpredictions = () => {
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Recent Predictions</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <td>ID</td>
                        <td>Timestamp</td>
                        <td>Predictions</td>
                        <td>Alerts</td>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>101</td>
                        <td>01.01.2025</td>
                        <td>75.5</td>
                        <td>
                            <span className={`${styles.status} ${styles.normal}`}>Normal</span>
                        </td>
                    </tr>
                    <tr>
                        <td>101</td>
                        <td>01.01.2025</td>
                        <td>75.5</td>
                        <td>
                            <span className={`${styles.status} ${styles.ypl}`}>Yellow level</span>
                        </td>
                    </tr>
                    <tr>
                        <td>101</td>
                        <td>01.01.2025</td>
                        <td>75.5</td>
                        <td>
                            <span className={`${styles.status} ${styles.opl}`}>Orange level</span>
                        </td>
                    </tr>
                    <tr>
                        <td>101</td>
                        <td>01.01.2025</td>
                        <td>75.5</td>
                        <td>
                            <span className={`${styles.status} ${styles.rpl}`}>Red level</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}

export default Recentpredictions