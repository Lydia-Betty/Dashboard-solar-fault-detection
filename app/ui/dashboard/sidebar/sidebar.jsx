"use client"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import MenuLink from "./menuLink/menuLink"
import styles from "./sidebar.module.css"
import Image from "next/image";

import {
  MdDashboard,
  MdAnalytics,
  MdAccessTime,
  MdOutlinePerson,
  MdOutlineInsertDriveFile,
  MdOutlineSettings,
  MdHelpOutline,
  MdOutlineLogout,
} from "react-icons/md"

const menuItems = [
  {
    title: "Home",
    list: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: <MdDashboard />,
      },
      {
        title: "Analytics",
        path: "/dashboard/analytics",
        icon: <MdAnalytics />,
      },
      {
        title: "Real-time",
        path: "/dashboard/real-time",
        icon: <MdAccessTime />,
      },
      {
        title: "Reports",
        path: "/dashboard/reports",
        icon: <MdOutlineInsertDriveFile />,
      },
      {
        title: "Users",
        path: "/dashboard/users",
        icon: <MdOutlinePerson />,
      },
    ],
  },
  {
    title: "User",
    list: [
      {
        title: "Settings",
        path: "/dashboard/settings",
        icon: <MdOutlineSettings />,
      },
      {
        title: "Help",
        path: "/dashboard/help",
        icon: <MdHelpOutline />,
      },
    ],
  },
]

const Sidebar = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return <div className={styles.container}>Loading...</div>;
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  return (
    <div className={styles.container}>
      <div className={styles.user}>
        <Image
          className={styles.userImage}
          src={session.user.img || "/noavatar.png"}
          alt=""
          width="50"
          height="50"
        />
        <div className={styles.userDetails}>
          <span className={styles.userName}>{session.user.name}</span>
          <span className={styles.userTitle}>{session.user.isAdmin ? 'Admin' : 'User'}</span>
        </div>
      </div>
      <ul className={styles.list}>
        {menuItems.map((cat) => (
          <li key={cat.title}>
            <span className={styles.cat}>{cat.title}</span>
            {cat.list.map((item) => (
              <MenuLink item={item} key={item.title} />
            ))}
          </li>
        ))}
      </ul>
        <button className={styles.logout} onClick={handleLogout}>
          <MdOutlineLogout />
          Logout
        </button>
    </div>
  );
};
export default Sidebar
