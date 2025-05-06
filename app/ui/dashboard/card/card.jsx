import styles from "./card.module.css"
import { 
    MdCheckCircleOutline,
    MdArrowUpward,
} from "react-icons/md"
const Card = () => {
    return (
        <div className={styles.container}>
            <MdCheckCircleOutline size={20}/>
            <div className={styles.text}>
                <span className={styles.title}>Accuracy</span>
                <span className={styles.number}>91%</span>
                <span className={styles.detail}>
                    <span className={styles.positive}><MdArrowUpward/> 5%</span> vs last week</span>
            </div>
        </div>
    )
}

export default Card