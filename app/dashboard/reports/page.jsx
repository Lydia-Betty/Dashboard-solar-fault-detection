import { fetchReports } from "@/app/lib/data"
import styles from "@/app/ui/dashboard/reports/reports.module.css"
import Search from '@/app/ui/dashboard/search/search'
import Link from "next/link" 

const ReportsPage = async({searchParams}) => {
    const q = searchParams?.q || ""
        
        const reports = await fetchReports(q);
        console.log(reports)
    

    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <Search placeholder="Search for a report"/>
                <Link href="/dashboard/reports/add" >
                    <button className={styles.addButton}>Add New</button>
                </Link>
            </div>
            <table className={styles.table}>
                 <thead>
                    <tr>
                        <td>Author</td>
                        <td>Title</td>
                        <td>Created at</td>
                        <td>Description</td>
                    </tr>
                 </thead>
                 <tbody>
                    {reports.map((report) =>(
                        <tr key={report._id}>
                            <td>{report.author?.username || "Unknown"}</td>
                            <td>{report.title}</td>
                            <td>{report.createdAt?.toString().slice(0,10)}</td>
                            <td>{report.description}</td>
                            <td>
                                <div className={styles.buttons}>
                                    
                                    <Link href={`/dashboard/reports/${report._id}`}>
                                        <button className={`${styles.button} ${styles.view}`}>View</button>
                                    </Link>
                                    
                                </div>
                            </td>
                        </tr>
                    ))}
                 </tbody>
            </table>
        </div>
    )


}

export default ReportsPage 