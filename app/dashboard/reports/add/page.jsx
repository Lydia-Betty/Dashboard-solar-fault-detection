import { addReport } from "@/app/lib/actions"
import styles from "@/app/ui/dashboard/reports/addReport/addReport.module.css"

const AddReport = () =>{
    return(
        <div className={styles.container}>
            <form action={addReport} className={styles.form}>
                <input type="text" placeholder="title" name="title" required />
                <textarea name="description" id="description"  rows="16" placeholder="description"></textarea>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default AddReport