import Search from '@/app/ui/dashboard/search/search'
import styles from '@/app/ui/dashboard/users/users.module.css'
import Link from "next/link"
import Image from "next/image"
import { fetchUsers } from "@/app/lib/data"
import { deleteUser } from '@/app/lib/actions'

const UsersPage = async ({searchParams}) => {
    const q = searchParams?.q || ""
    
    const users = await fetchUsers(q);
    console.log(users)


    return (
        <div className={styles.container}>
            <div className={styles.top}>
                <Search placeholder="Search for a user"/>
                <Link href="/dashboard/users/add" >
                    <button className={styles.addButton}>Add New</button>
                </Link>
            </div>
            <table className={styles.table}>
                 <thead>
                    <tr>
                        <td>Name</td>
                        <td>Email</td>
                        <td>Phone number</td>
                        <td>Created at</td>
                        <td>Role</td>
                    </tr>
                 </thead>
                 <tbody>
                    {users.map((user) =>(
                        <tr key={user._id}>
                            <td><div className={styles.user}>
                                <Image src={user.img || "/noavatare.png"} alt='' width={25} height={25} className={styles.userImage}/>
                                {user.username}
                                </div>
                            </td>
                            <td>{user.email}</td>
                            <td>{user.phoneNumber}</td>
                            <td>{user.createdAt?.toString().slice(4,16)}</td>
                            <td>{user.isAdmin ? "Admin" : "Not Admin"}</td>
                            <td>
                                <div className={styles.buttons}>
                                    
                                    <Link href={`/dashboard/users/${user._id}`}>
                                        <button className={`${styles.button} ${styles.view}`}>View</button>
                                    </Link>
                                    <form action={deleteUser}>
                                        <input type="hidden" name='id' value={(user._id)} />
                                        <button className={`${styles.button} ${styles.delete}`}>Delete</button>
                                    </form>
                                    
                                </div>
                            </td>
                        </tr>
                    ))}
                 </tbody>
            </table>
        </div>
    )

}

export default UsersPage