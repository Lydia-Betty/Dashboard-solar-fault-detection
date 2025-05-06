import { updateReport } from "@/app/lib/actions"
import { fetchReport } from "@/app/lib/data"
import styles from "@/app/ui/dashboard/reports/SingleReport/singleReport.module.css"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const SingleReport =async({params})=> {

    const {id} = params
    const report = await fetchReport(id)

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                Admin1
            </div>
            <div className={styles.formContainer}>
                <form action={updateReport} className={styles.form}>
                    <input type="hidden" name="id" value={report._id} />
                    <input type="hidden" name="author" value={userId} />

                    <label>Title</label>
                    <input type="text" name="title" defaultValue={report.title}/>
                    
                    <label>Description</label>
                    <textarea name="description" defaultValue={report.description}/>
                    
                    <button>Update</button>
                </form>

            </div>
        </div>
    )
}

export default SingleReport