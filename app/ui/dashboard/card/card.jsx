import styles from "./card.module.css"
import { 
    MdCheckCircleOutline,
    MdArrowUpward,
    MdArrowDownward,
} from "react-icons/md"


export default function Card ({
  title, 
  value,       // a number 
  unit,        // optional string, e.g. "kWh" or "W/m²"
  deltaText,   // optional string, e.g. "+8% vs avg"
  deltaIsPositive, // boolean: choose green/up or red/down arrow
}){
    return (
        <div className={styles.container}>
            <MdCheckCircleOutline size={20}/>
            {deltaText && (
            deltaIsPositive 
                ? <MdArrowUpward size={20} color="green" />
                : <MdArrowDownward size={20} color="red" />
            )}
            
            <div className={styles.text}>
                <span className={styles.title}>{title}</span>
                <span className={styles.number}>
                    {value}
                    {unit && <span className={styles.unit}>{unit}</span>}
                </span>
                {deltaText && (
                    <span className={styles.detail}>
                        <span className={deltaIsPositive ? styles.positive : styles.negative}>
                        {deltaText}
                        </span>
                    </span>
                )}
            </div>
        </div>
    )
}
