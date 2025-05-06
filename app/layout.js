
import "./ui/globals.css"
import { Inter } from 'next/font/google'
import { getServerSession } from "next-auth";
import AuthProvider from "@/app/dashboard/authprovider/authprovider";
const inter = Inter({ subsets: ['latin'] })

const metadata = {
  title: "PV Power Dashboard",
  description: "Monitor and predict PV power generation",
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      
      <body suppressHydrationWarning={true} className={inter.className}>
      <AuthProvider >
        {children}
      </AuthProvider>
      </body>
      
    </html>
  )
}
