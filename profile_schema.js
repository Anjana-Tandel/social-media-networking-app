const mongoose=require("mongoose");
const bcrypt=require("bcrypt");
const { text } = require("body-parser");

const commentSchema=new mongoose.Schema({
    PostId:String,
    posted_user:String,
    user_FullName:String,
    text:String,
    postedUserpic:String,
    createdAt:{
        type:Date,
        default:Date.now
    },
    
})
const bookmarksSchema=new mongoose.Schema({
    PostId:String,
    posted_user:String
})
const userReference={
    userId:{
        type:mongoose.Schema.Types.ObjectID
    },
    user_name:String,

}
const postSchema=new mongoose.Schema({
    text:String,
    media:[String],
    createdAt:{
        type:Date,
        default:Date.now()
    },
    createdBy:{
        userId:String,
        username:String
    },
    likes:[String],
    comments:[{
        _id:mongoose.Schema.Types.ObjectId,
    PostId:String,
    posted_user:String,
    user_FullName:String,
    text:String,
    postedUserpic:String,
    createdAt:{
        type:Date,
        default:Date.now
    },
    
}]

})
const notifications=new mongoose.Schema({
    type:{
        type:String,
        enum:["follow","like","comment"]
    },
    From_User:{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
        },
        user_name:String,
        user_FullName:String,
        user_pic:String,
        PostId:String
    },
    toUserId:{
        userId:{
            type:mongoose.Schema.Types.ObjectId,
        },
        user_name:String
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    isread:{
        type:Boolean,
        default:false
    }

})
const user=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user_data",
        required:true
    },
    user_name:{
        type:String,
    },
    user_fullName:{
        type:String
    },
    user_profile_pic:{
        type:String,
        default:"uploads/profiles/default.jpg"
    },
    user_coverPic:{
        type:String,
        default:""
    },
    user_bio:{
        type:String,
        default:""
    },
    user_dob:{
        type:Date
    },
    user_gender:{
        type:String
    },
    background_theme:{
        type:String,
        default:"white"
    },
    followers:[userReference],
    following:[userReference],
    posts:[{
        _id:mongoose.Schema.Types.ObjectId,
        text:String,
        media:[String],
        createdAt:{
            type:Date,
            default:Date.now()
        },
        createdBy:{
            userId:String,
            username:String
        },
        likes:[String],
        comments:[{
        _id:mongoose.Schema.Types.ObjectId,
    PostId:String,
    posted_user:String,
    user_FullName:String,
    text:String,
    postedUserpic:String,
    createdAt:{
        type:Date,
        default:Date.now
    },
    
}]
    
    
    }],
    bookmarks:[{
        _id:mongoose.Schema.Types.ObjectId,
        PostId:String,
        posted_user:String

    }] 
})
const profile=mongoose.model("User_Profile",user);
const user_comments=mongoose.model("User_comments",commentSchema);
const user_posts=mongoose.model("User_post",postSchema);
const notification=mongoose.model("Notification",notifications);
const bookMarks=mongoose.model("Bookmarks",bookmarksSchema);
module.exports={profile,user_posts,user_comments,notification,bookMarks};