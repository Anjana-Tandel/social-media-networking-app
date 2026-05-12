const mongoose=require("mongoose");
require("dotenv").config();

const url_db=process.env.MONGO_URL;

mongoose.connect(url_db);
const db=mongoose.connection;

db.on("connected",()=>{
    console.log("DB Connected....");
})
db.on("error",(err)=>{
    console.log("Some Error Occured....");
})
db.on("disconnected",()=>{
    console.log("DB disconnected....");
})
module.exports=db;