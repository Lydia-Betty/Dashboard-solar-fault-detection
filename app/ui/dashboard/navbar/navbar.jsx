"use client"
import { usePathname } from "next/navigation"
import styles from "./navbar.module.css"
import {
    MdOutlineSearch,
    MdOutlineNotifications
} from "react-icons/md"

const Navbar = () => {

    const pathname = usePathname();

    return (
        <div className={styles.container}>
            <div className={styles.title}>{pathname.split("/").pop()}</div>
            <div className={styles.menu}>
                <div className={styles.search}>
                    <MdOutlineSearch />
                    <input type="search" placeholder="Search" className={styles.input} />
                </div>
                <div className={styles.icons}>
                    <MdOutlineNotifications size={20}/>
                </div>
            </div>
        </div>
    )

}

export default Navbar
