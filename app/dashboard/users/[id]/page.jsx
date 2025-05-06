import { updateUser } from "@/app/lib/actions"
import { fetchUser } from "@/app/lib/data"
import styles from "@/app/ui/dashboard/users/SingleUser/singleUser.module.css"
import Image from "next/image"


const SingleUser = async({params})=> {

    const {id} = params
    const user = await fetchUser(id)
    return (
        <div className={styles.container}>
            <div className={styles.infoContainer}>
                <div className={styles.imgContainer}>
                    <Image src={user.img || "/noavatar.png"} alt="" fill/>
                </div>
                {user.username}
            </div>
            <div className={styles.formContainer}>
                <form action={updateUser} className={styles.form}>
                    <input type="hidden" name="id" value={user._id} />
                    <label>username</label>
                    <input type="text" name="username" placeholder={user.username}/>
                    <label>Email</label>
                    <input type="email" name="email" placeholder={user.email}/>
                    <label>Password</label>
                    <input type="password" name="password" />
                    <label>Phone Number</label>
                    <input type="phone" name="phone Number" placeholder={user.phoneNumber}/>
                    <label>Address</label>
                    <textarea type="text" name="address" placeholder={user.address}/>
                    <label>Is Admin</label>
                    <select name="IsAdmin" id="isAdmin">
                        <option value={true} selected={user.isAdmin}>Yes</option>
                        <option value={false} selected={!user.isAdmin}>No</option>
                    </select>
                    <button>Update</button>
                </form>

            </div>
        </div>
    )
}

export default SingleUser