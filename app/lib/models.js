import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        min:3,
        max:20,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    img:{
        type:String,
    },
    isAdmin:{
        type:Boolean,
        default:false,
    },
    phoneNumber:{
        type:String,
    },
    address:{
        type:String,
    }
},
    { timestamps:true}
)

const reportSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User" 
    },
    title:{
        type:String,
        required:true,
        unique:true,
    },
    description:{
        type:String,
        required:true,
    },
},
    { timestamps:true}
)

export const User = mongoose.models.User || mongoose.model("User", userSchema)
export const Report = mongoose.models.Report || mongoose.model("Report", reportSchema)