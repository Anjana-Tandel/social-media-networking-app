const express=require("express");
const router=express.Router();
const user=require("./Schema");
const local_midd=require("./server");

router.get("/",async(req,resp)=>{
    const data=await user.find({});
    return resp.json({
        Data:data
    })
 
})

router.get("/:user_name",async(req,resp)=>{
    try{
    const user_name=req.params.user_name;
        const response=await user.find({user_name:user_name})
        if(response.length!=0){
        return resp.status(200).json(response)
        }
        else{
            return resp.status(404).json({
                status:"Its A Bad Request...."
            })
        }
    }
    catch(err){
        console.log(err)
    }
})

router.post("/",async(req,resp)=>{
    
    const data=req.body;
    try{
    const newUser=new user(data);
    const res=newUser.save();
    return resp.json({
        Status:"success..."
    });
}
catch(err){
    return resp.json({status:"Some Error"})
}
})

module.exports=router;