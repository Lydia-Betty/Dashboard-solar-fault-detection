'use client';
import { authenticate } from '@/app/lib/actions';
import { signIn } from 'next-auth/react'; // Add this import
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from "./loginForm.module.css";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.target);
    
    const result = await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      // redirect: false
      redirect: true,            // ← let NextAuth redirect for us
      callbackUrl: "/dashboard", // ← and send us here when done
    });

    if (result?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/dashboard");
    }
  };


  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>Login</h1>
      {error && <div className="error">{error}</div>}
      <input name="username" placeholder="Username" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}
