'use client'
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth";

export const getCurrentUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user;
};

export const isAdmin = async () => {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin;
};