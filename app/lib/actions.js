"use server"

import { connectToDB } from "./utils"
import { User, Report } from "./models"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export const addUser = async (formData) => {
  const { username, email, password, phoneNumber, address, isAdmin } = Object.fromEntries(formData)

  try {
    await connectToDB()
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      address,
      isAdmin: isAdmin === "true",
    })

    await newUser.save()
  } catch (err) {
    console.log(err)
    throw new Error("Failed to create user...")
  }

  revalidatePath("/dashboard/users")
  redirect("/dashboard/users")
}

export const updateUser = async (formData) => {
  const { id, username, email, password, phoneNumber, address, isAdmin } = Object.fromEntries(formData)

  try {
    await connectToDB()
    const updateFields = {
      username,
      email,
      phoneNumber,
      address,
      isAdmin: isAdmin === "true",
    }

    // Only hash password if it's provided
    if (password) {
      const salt = await bcrypt.genSalt(10)
      updateFields.password = await bcrypt.hash(password, salt)
    }

    // Remove empty fields
    Object.keys(updateFields).forEach(
      (key) => (updateFields[key] === "" || updateFields[key] === undefined) && delete updateFields[key],
    )

    await User.findByIdAndUpdate(id, updateFields)
  } catch (err) {
    console.log(err)
    throw new Error("Failed to update user...")
  }

  revalidatePath("/dashboard/users")
  redirect("/dashboard/users")
}

export const addReport = async (formData) => {
  const session = await getServerSession(authOptions)

  if (!session) {
    throw new Error("You must be logged in to create a report")
  }

  const { title, description } = Object.fromEntries(formData)

  try {
    await connectToDB()

    const newReport = new Report({
      title,
      description,
      author: session.user.id,
    })
    console.log("SESSION:", session);


    await newReport.save()
  } catch (err) {
    console.log(err)
    throw new Error("Failed to create report...")
  }

  revalidatePath("/dashboard/reports")
  redirect("/dashboard/reports")
}

export const updateReport = async (formData) => {
  const { id, title, description } = Object.fromEntries(formData)

  try {
    await connectToDB()
    const updateFields = {
      title,
      description,
    }

    Object.keys(updateFields).forEach(
      (key) => (updateFields[key] === "" || updateFields[key] === undefined) && delete updateFields[key],
    )

    await Report.findByIdAndUpdate(id, updateFields)
  } catch (err) {
    console.log(err)
    throw new Error("Failed to update report...")
  }

  revalidatePath("/dashboard/reports")
  redirect("/dashboard/reports")
}

export const deleteUser = async (formData) => {
  const { id } = Object.fromEntries(formData)

  try {
    await connectToDB()
    await User.findByIdAndDelete(id)
  } catch (err) {
    console.log(err)
    throw new Error("Failed to delete user...")
  }

  revalidatePath("/dashboard/users")
}

export const authenticate = async (formData) => {
  try {
    await signIn('credentials', {
      username: formData.get('username'),
      password: formData.get('password'),
      redirect: false
    });
    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
};