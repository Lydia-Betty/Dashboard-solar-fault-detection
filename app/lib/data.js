import { User, Report } from "./models"
import { connectToDB } from "./utils"

export const fetchUsers = async(q) =>{
    const regex = new RegExp(q, "i")
   try{
    await connectToDB()
    const users = await User.find({username:{$regex:regex}}).lean()
    return users
   } catch(error){
    console.log(error)
    throw new Error("Failed to fetch users...")
   } 
}

export const fetchUser = async(id) =>{

   try{
    await connectToDB()
    const user = await User.findById(id).lean()
    return user
   } catch(error){
    console.log(error)
    throw new Error("Failed to fetch user...")
   } 
}

export const fetchReports = async(q) =>{
    const regex = new RegExp(q, "i")
   try{
    await connectToDB()
    const reports = await Report.find({title:{$regex:regex}}).lean()
    .populate("author") // gets full user info
    .sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(reports));
   } catch(error){
    console.log(error)
    throw new Error("Failed to fetch report")
   } 
}

export const fetchReport = async(id) =>{

    try{
     await connectToDB()
     const report = await Report.findById(id).lean()
     return report
    } catch(error){
     console.log(error)
     throw new Error("Failed to fetch report...")
    } 
 }