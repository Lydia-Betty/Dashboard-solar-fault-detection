import styles from "./footer.module.css"
import Image from "next/image";

const Footer = () => {
    return (
        <div className={styles.container}>
            <div className={styles.logo}>
                <Image
                          className={styles.logoImage}
                          src="/logo.png"
                          alt=""
                          width="50"
                          height="50"
                        />
            </div>
            <div className={styles.text}>All rights reserved</div>
        </div>
    )
}

export default Footer