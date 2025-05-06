import { addUser } from "@/app/lib/actions"
import { fetchUsers } from "@/app/lib/data"
import styles from "@/app/ui/dashboard/users/addUser/addUser.module.css"

const AddUser = () =>{

    return(
        <div className={styles.container}>
            <form action={addUser} className={styles.form}>
                <input type="text" placeholder="username" name="username" required />
                <input type="email" placeholder="email" name="email" required />
                <input type="password" placeholder="password" name="password" required />
                <input type="phone" placeholder="phone number" name="phoneNumber" required />
                <select name="isAdmin" id="isAdmin">
                    <option value="false">Is Admin?</option>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                </select>
                <textarea name="address" id="address"  rows="16" placeholder="address"></textarea>
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default AddUser 