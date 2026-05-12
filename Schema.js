const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const user=new mongoose.Schema({
    user_fullName:{
        type:String,
        required:true
    },
    user_name:{
        type:String,
        required:true,
        unique:true
    },
    user_password:{
        type:String,
        required:true,
        unique:true
    },
    confirm_password:{
        type:String,
        required:true
    },
    user_email:{
        type:String,
        unique:true
    },
    user_profile_pic:{
        type:String
    },
    user_dob:{
        type:Date
    },
    user_gender:{
        type:String
    }
})

user.pre("save",async function(next){
    const my_user=this;
    try{
        //hashing the password

        if(!my_user.isModified("user_password")){
            return next();
        }
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(my_user.user_password,salt);
        my_user.user_password=hashedPassword;
        my_user.confirm_password=hashedPassword;
        next();
    }
    catch(err){

    }
})

const user_data=mongoose.model("user_data",user);
module.exports=user_data;