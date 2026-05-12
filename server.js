const express=require("express");
const user_router=require("./routes");
const app=express();
const path=require("path");
const db=require("./db")
const user=require("./Schema");
const {profile}=require("./profile_schema");
const session=require("express-session");
const multer=require("multer");
const {user_comments}=require("./profile_schema")
const {user_posts}=require("./profile_schema");
const {notification}=require("./profile_schema");
const {bookMarks}=require("./profile_schema");

app.use(session({
    secret:"Anju",
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
}));

require("dotenv").config();
const bcrypt=require("bcrypt");

app.use(express.static(__dirname));
app.use("/uploads",express.static("uploads"));

const bodyParser=require("body-parser");
app.use(bodyParser.json());

/*app.use(express.json());
app.use(express.urlencoded({extended:true}))*/

const passport=require("passport");
const { default: mongoose } = require("mongoose");
const LocalStrategy=require("passport-local").Strategy;

const port=process.env.PORT;

//middleware for authentication

passport.use(new LocalStrategy(async(username,password,done)=>{
try{
    const data=await user.findOne({user_name:username});
    if(!data){
        return done(null,false,{message:"Incorect data..."})
    }
    //const isPasswordMatch=await data.user_password===password?true:false;
    const isPasswordMatch=await bcrypt.compare(password,data.user_password)
    if(isPasswordMatch){
        return done(null,data);
    }
    else{
        return done(null,false,{message:"Incorect data..."})
    }
}
catch(err){
    console.log(err);
}
}))

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser(async(id,done)=>{
try{
const User=await user.findById(id);
done(null,user);
}
catch(err){
done(err,null);
}
})

/*local_midd=passport.authenticate("local");*/

const local_midd = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        req.login(user, (err) => {
            if (err) return next(err);
            next(); // Proceed to the next middleware
        });
    })(req, res, next); // Immediately invoke `passport.authenticate`
};


const profileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/profiles")
    },
    filename:(req,file,cb)=>{
        const ext=path.extname(file.originalname);
        const name=Date.now()+'-'+Math.round(Math.random()*1e9)+ext;
        cb(null,name);
    }
})
const profileUpload=multer({storage:profileStorage});

const postStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads/posts")
    },
    filename:(req,file,cb)=>{
        const ext=path.extname(file.originalname);
        const name=Date.now()+'-'+Math.round(Math.random()*1e9)+ext;
        cb(null,name);
    }
})
const postUpload=multer({storage:postStorage});


app.post("/login",local_midd,async(req,resp)=>{  
    try{
        const logged_username=req.body.username;
        const logged_user=await profile.findOne({user_name:logged_username});
        req.session.log_user={
            username:logged_user.user_name,
            user_FullName:logged_user.user_fullName,
            user_bio:logged_user.user_bio,
            user_profile_pic:logged_user.user_profile_pic,
            user_coverPic:logged_user.user_coverPic,
            background_theme:logged_user.background_theme,
            followers:logged_user.followers,
            following:logged_user.following,
            DOB:logged_user.user_dob,
            gender:logged_user.user_gender,
            posts:logged_user.posts,
            bookmarks:logged_user.bookmarks
    }
        /*resp.sendFile(__dirname+"/profile.html")*/
        return resp.redirect("/profile");    
    } 
    catch(err){
        return resp.json({
            msg:"error.."
        })
    }
})


//redirecting to profile page or home page after after sucessfull registration or login
app.get("/profile",profileUpload.none(),(req,resp)=>{
    if(!req.session.log_user){
        return resp.json("Please Login To Access The Profile")
    }
    return resp.sendFile(path.join(__dirname,"profile.html"));
})


//getting logged in user data from session
app.get("/getUser",(req,resp)=>{
    const req_user=req.session.log_user;
    if(!req_user){
        return resp.json("No Data...");
    }
    return resp.json({
        status:"success",
        data:req_user
    })
})


//getting profile clicked user
app.get("/get-user/:clicked_user",async(req,resp)=>{
    const req_user=req.params.clicked_user;
    const user=await profile.findOne({user_name:req_user});
    if(!user){
        return resp.json("No user founs");
    }
    return resp.json(user);
})

//post method for registartion
app.post("/register",async(req,resp)=>{
    const {user_name,user_password,user_email,user_fullName,user_dob,user_gender,confirm_password}=req.body;
    try{
    const newUser=new user({user_name,user_password,user_email,user_fullName,user_dob,user_gender,confirm_password});
    await newUser.save();

    const newProfile=new profile({userId:newUser._id});
    await newProfile.save();

    return resp.json({
        status:"success",
        id:newProfile.userId,
        username:newUser.user_name,
        user_gender:newUser.user_gender,
        user_dob:newUser.user_dob,
        user_fullName:newUser.user_fullName
    });
}
catch(err){
    console.log(err)
    return resp.json({status:err})
}
})


//seting the profile details
app.post("/setProfile",profileUpload.fields([{name:"user_profile_pic"},{name:"user_coverPic"}]),async(req,resp)=>{
    const {userId,user_bio,user_name,user_gender,user_dob,user_fullName,user_coverPic}=req.body;
    try{
    const user_profile_pic=req.files["user_profile_pic"]?req.files["user_profile_pic"][0].path:null;
    const user_coverPic=req.files["user_coverPic"]?req.files["user_coverPic"][0].path:null;

    const req_profile= await profile.findOne({userId});

    if(!req_profile){
        return resp.status(404).json({
            message:"Data Not Found"
        })
    }

    if(user_bio){
        req_profile.user_bio=user_bio;
    }
    if(user_name){
        req_profile.user_name=user_name;
    }
    if(user_gender){
        req_profile.user_gender=user_gender;
    }
    if(user_name){
        req_profile.user_dob=user_dob;
    }
    if(user_profile_pic){
        req_profile.user_profile_pic=user_profile_pic;
    }
    if(user_coverPic){
        req_profile.user_coverPic=user_coverPic;
    }
    if(user_fullName){
        req_profile.user_fullName=user_fullName;
    }
    
    await req_profile.save();
    req.session.log_user={
        username:req_profile.user_name,
        user_FullName:req_profile.user_fullName,
        user_bio:req_profile.user_bio,
        user_profile_pic:req_profile.user_profile_pic,
        user_coverPic:req_profile.user_coverPic,
        background_theme:req_profile.background_theme,
        followers:req_profile.followers,
        following:req_profile.following,
        DOB:req_profile.user_dob,
        gender:req_profile.user_gender,
        posts:req_profile.posts,
        bookmarks:req_profile.bookmarks
    }
    return resp.redirect("/profile");    
}
    catch(err){
        console.log(err)
        return resp.json({status:"err",
            error:err
        })
    }
})

//implementing search function for the all the users
app.get("/search",async(req,resp)=>{
    const searchTerm=req.query.user_name;
    if(!searchTerm){
        return resp.json({msg:"Sorry! No Search Term Found..."})
    }
    try{
        const searched_user= await profile.find({
            user_name:{$regex:searchTerm,$options:"i"}
        }).select("user_name user_fullName user_profile_pic")
        return resp.json({
            users:searched_user
        })
    }
    catch(err){
        return resp.json({
            msg:"Some Error"
        })
    }
})


//routes for creating posts
app.post("/create-post",postUpload.array("media",4),async(req,resp)=>{
    try{
        const {username,text}=req.body;
        const mediaPaths=req.files.map(file=>'/uploads/posts/'+file.filename);
        const userProfile=await profile.findOne({user_name:username});
        if(!userProfile){
            return resp.status(404).json({
                error:"Profile not found....",
            })
        }
        const newPost={
            text,
            media:mediaPaths,
            createdAt:new Date(),
            createdBy:{
                userId:userProfile._id,
                username:userProfile.user_name
            }
        }
        
        const new_post=new user_posts(newPost);
        await new_post.save();

        const newPost2={
            _id:new_post._id,
            text,
            media:mediaPaths,
            createdAt:new Date(),
            createdBy:{
                userId:userProfile._id,
                username:userProfile.user_name
            }
        }

        userProfile.posts.push(newPost2);
        await userProfile.save();
       

        return resp.status(201).json({
            message:"Post Created Successfully.....",
            data:newPost,
            post_id:newPost._id
        })
    }
    catch(err){
        return resp.json({
            error:err
        })
    }
})

app.get("/favicon.ico",(req,resp)=>{
    resp.status(204).end();
})

//to get all the posts from the user
app.get("/get-posts",async(req,resp)=>{
    try{
    const all_users=await profile.find({},"user_name user_fullName user_profile_pic posts");
    let allposts=[];
    all_users.forEach(profile=>{
        profile.posts.forEach(each_post=>{
            allposts.push({
                username:profile.user_name,
                userFullname:profile.user_fullName,
                user_profile_pic:profile.user_profile_pic,
                caption:each_post.text,
                media_url:each_post.media,
                createdAt:each_post.createdAt,
                likes:each_post.likes,
                post_id:each_post._id,
                comments:each_post.comments
            })
        })
    })
    allposts.sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt))
    return resp.json(allposts)
    }
    catch(e){
        return resp.json("some error")
    }
})
//getting the post of particular user
app.get("/get-posts/:clicked_user",async(req,resp)=>{
    const req_user=req.params.clicked_user;
    const user=await profile.findOne({user_name:req_user});
    if(!user){
        return resp.json("No User Found");
    }
    let allposts=[];
    user.posts.forEach(each_post=>{
        allposts.push({
            username:user.user_name,
            userFullname:user.user_fullName,
            user_profile_pic:user.user_profile_pic,
            caption:each_post.text,
            media_url:each_post.media,
            createdAt:each_post.createdAt,
            likes:each_post.likes,
            post_id:each_post._id,
            comments:each_post.comments
        })
    })
    return resp.json(allposts)
})

app.post("/post/like",async(req,resp)=>{
    let liked=1;
    try{
        const liked_user=req.body.liked_user;
        const posted_user=await profile.findOne({user_name:req.body.posted_user});
        const LikedUser=await profile.findOne({user_name:liked_user});
        const likedPost=posted_user.posts.find(post=>post._id.toString()===req.body.post_id);
        const likedPost2=await user_posts.findOne({_id:req.body.post_id});
        if(!likedPost.likes.includes(liked_user)){
            likedPost.likes.push(liked_user);
            likedPost2.likes.push(liked_user);
            liked=1
            const newNotification=new notification({
                type:"like",
                From_User:{
                        userId:LikedUser._id,
                        user_name:LikedUser.user_name,
                        user_FullName:LikedUser.user_fullName,
                        user_pic:LikedUser.user_profile_pic,
                        PostId:likedPost._id
                    },
                    toUserId:{
                        userId:posted_user._id,
                        user_name:posted_user.user_name
                    },
                    createdAt:new Date()
            })
            await newNotification.save();
        }
        else{
            likedPost.likes=likedPost.likes.filter(user=>user!==liked_user);
            likedPost2.likes=likedPost2.likes.filter(user=>user!==liked_user);
            liked=0;
        }
        await posted_user.save();
        await likedPost2.save();
        return resp.json({liked,likedPost})
}
    catch(e){
        return resp.json(e)

    }

})


//implementing bookmarks

app.post("/post/bookmark",async(req,resp)=>{
    let is_bookmark=1;
    try{
        const clicked_user=req.body.username;
        const posted_user=await profile.findOne({user_name:req.body.posted_user});
        const ClickedUser=await profile.findOne({user_name:clicked_user});
        const ClickedPost=posted_user.posts.find(post=>post._id.toString()===req.body.postId);
        const isBookmarked=ClickedUser.bookmarks.some(b=>b.PostId===req.body.postId)
        if(!isBookmarked){
            const clickedUserData={
                PostId:req.body.postId,
                posted_user:req.body.posted_user
            }
            const new_bookmark=new bookMarks(clickedUserData);
            await new_bookmark.save();
            const clickedUserData2={
                _id:new_bookmark._id,
                PostId:req.body.postId,
                posted_user:req.body.posted_user
            }
            ClickedUser.bookmarks.push(clickedUserData2);
            is_bookmark=1
        }
        else{
            ClickedUser.bookmarks=ClickedUser.bookmarks.filter(b=>b.posted_user!=req.body.posted_user);
            await bookMarks.deleteOne({PostId:req.body.postId});
            is_bookmark=0;
        }
        await posted_user.save();
        await ClickedUser.save();
        return resp.json({is_bookmark,ClickedPost});
}
    catch(e){
        return resp.json(e)

    }

})

//check for bookmarks
app.post("/posts/check-bookmark",async(req,resp)=>{
    const {posted_user,postId,username}=req.body;
    try{
        const postedUser=await profile.findOne({user_name:posted_user});
        const ClickedUser=await profile.findOne({user_name:username});
        const ClickedPost=postedUser.posts.find(post=>post._id.toString()===postId);
        const isBookmarked=ClickedUser.bookmarks.some(b=>b.PostId===postId)
        return resp.json({isBookmarked});
}
    catch(e){
        return resp.json(e)

    }

})

//get bookmarked post

app.get("/bookmark/posts",async(req,resp)=>{
    const username=req.session.log_user.username;
    console.log(username,"Found")
    const logged_user=await profile.findOne({user_name:username});
    if(!logged_user){
        return resp.json("No user found.")
    }
    const bookmarks=logged_user.bookmarks;
    const allposts=[];
    for(const bookmark of bookmarks){
        const {PostId,posted_user}=bookmark;
        const Posted_userProfile=await profile.findOne({user_name:posted_user});
        if(Posted_userProfile){
            const post=Posted_userProfile.posts.find(p=>p._id.toString()==PostId);
            if(post){
                allposts.push({
                    username:Posted_userProfile.user_name,
            userFullname:Posted_userProfile.user_fullName,
            user_profile_pic:Posted_userProfile.user_profile_pic,
            caption:post.text,
            media_url:post.media,
            createdAt:post.createdAt,
            likes:post.likes,
            post_id:post._id,
            comments:post.comments
                })   
            }
        }
    }
    return resp.json(allposts)


})

app.post("/delete-post",async(req,resp)=>{
    const {posted_user,postId,username}=req.body;
    const req_user=await profile.findOne({user_name:posted_user});
    const req_Post=req_user.posts.find(post=>post._id.toString()===postId); 
    await profile.updateOne(
        {user_name:posted_user},
        {$pull:{
            posts:{_id:postId
            }
        }})
    await user_posts.findByIdAndDelete(postId);

    const bookMark=req_user.bookmarks.find(bookmark=>bookmark.PostId.toString()===postId);
    if(bookMark){
        const BookmarkId=bookMark._id;
        await profile.updateMany(
            {"bookmarks.PostId":postId},
            {$pull:{
                bookmarks:{PostId:postId
                }
            }})
    }
    await bookMarks.deleteMany({PostId:postId});
    await user_comments.deleteMany({PostId:postId});

    return resp.json({message:"Post Deleted Successfully...."})
})



//adding the posts
app.post("/post/add-comment",async(req,resp)=>{
    const req_user=await profile.findOne({user_name:req.body.Post_user});
    const from_user=await profile.findOne({user_name:req.body.Username});
    const postId=req.body.PostId;
    const req_post=req_user.posts.find(post=>post._id.toString()===req.body.PostId);
    const req_post2=await user_posts.findOne({_id:postId})

    if(req_post){
        const newComment={
            PostId:req_post._id,
            posted_user:req.body.Username,
            text:req.body.User_comment,
            postedUserpic:req.body.PostedUser_pic,
            user_FullName:req.body.user_fullName,
            createdAt:new Date()
        }
        const new_cmnt=new user_comments(newComment);
        await new_cmnt.save();

        const newComment2={
            _id:new_cmnt._id,
            PostId:req_post._id,
            posted_user:req.body.Username,
            text:req.body.User_comment,
            postedUserpic:req.body.PostedUser_pic,
            user_FullName:req.body.user_fullName,
            createdAt:new Date()
        }

        req_post.comments.push(newComment2);
        req_post2.comments.push(newComment2);
        await req_user.save();
        await req_post2.save();

        //adding notification

        const newNotification=new notification({
            type:"comment",
            From_User:{
                    userId:from_user._id,
                    user_name:from_user.user_name,
                    user_FullName:from_user.user_fullName,
                    user_pic:from_user.user_profile_pic,
                    PostId:req_post._id,
                },
                toUserId:{
                    userId:req_user._id,
                    user_name:req_user.user_name
                },
                createdAt:new Date()
        })
        await newNotification.save();

        return resp.json({
            success:true,
            message:"Comment added to the post...",
            comment:newComment,
            userFullname:req_user.user_fullName,
            postedUserpic:req.body.PostedUser_pic,


        })
    }
    else{
        return resp.json({success:false,
            message:"Failed to add comment"
        })
    }

})

app.post("/post/get-comments",async(req,resp)=>{
    console.log("called")
    const req_user=await profile.findOne({user_name:req.body.Post_user});
    const req_post=req_user.posts.find(post=>post._id.toString()===req.body.PostId);

    if(req_post){
        return resp.json({
            success:true,
            comments:req_post.comments,
            userFullname:req_user.user_fullName,
            
        })
    }
    else{
        return resp.json({success:false,
            message:"Failed to get comments"
        })
    }

})

//getting one particular post based on the post id
app.post("/user/posts",async(req,resp)=>{
    let posts=[];
    const req_user=await profile.findOne({user_name:req.body.user_name});
    const req_post=req_user.posts.find(post=>post._id.toString()===req.body.PostId);
    if(req_post){
        posts.push({
            username:req_user.user_name,
                userFullname:req_user.user_fullName,
                user_profile_pic:req_user.user_profile_pic,
                caption:req_post.text,
                media_url:req_post.media,
                createdAt:req_post.createdAt,
                likes:req_post.likes,
                post_id:req_post._id,
                comments:req_post.comments
        })
        return resp.json(posts);
    }
    else{
        return resp.json("No posts");
    }
})



//updating profile

app.post("/update-profile",profileUpload.fields([{name:"user_profile_pic"},{name:"user_coverPic"}]),async(req,resp)=>{
const{user_name,user_fullName,user_bio,user_dob}=req.body;
const req_user=await user.findOne({user_name:user_name});
const req_profile=await profile.findOne({user_name:user_name});
console.log(req_user,req_profile);
try{
const updateData={
    user_fullName,
    user_bio,
    user_dob
}
const update_user=await user.findOneAndUpdate({user_name},updateData,{new:true});

if(req.files.user_coverPic){
    updateData.user_coverPic="uploads/profiles/"+req.files.user_coverPic[0].filename;
}
if(req.files.user_profile_pic){
    updateData.user_profile_pic="uploads/profiles/"+req.files.user_profile_pic[0].filename;
}
const update_userProfile=await profile.findOneAndUpdate({user_name},updateData,{new:true}); 
const req_sessionUser=req.session.log_user;
req.session["log_user"].user_FullName=updateData.user_fullName;

const profiles = await profile.find({ "posts.comments.posted_user": user_name });

    for (const profile1 of profiles) {
      let updated = false;

      for(const post of profile1.posts){
        for(const comment of post.comments){
          if (comment.posted_user === user_name) {
            comment.postedUserpic=updateData.user_profile_pic||req.session.log_user.user_profile_pic;
            comment.user_FullName=updateData.user_fullName
            updated = true;
          }
        }
      }

      if (updated) {await profile1.save();}
    }

//updating notification schema
 await notification.updateMany({'From_User.user_name':req.session["log_user"].username},
    {
        $set:{
            'From_User.user_FullName':updateData.user_fullName,
            'From_User.user_pic':updateData.user_profile_pic||req.session.log_user.user_profile_pic
        }
    }
 );


if(updateData.user_profile_pic){
    req.session["log_user"].user_profile_pic=updateData.user_profile_pic;
}
if(updateData.user_coverPic){
    req_sessionUser.user_coverPic=updateData.user_coverPic;

}

return resp.json({message:"success"})

}
catch(e){
    return resp.json({message:e})
}

})

//checking for the existing followers

app.post("/check-follow",async(req,resp)=>{
    try{
        const{clicked_user,logged_userName}=req.body;
        const req_profile=await profile.findOne({user_name:logged_userName});
        if(!req_profile){
            return resp.json("No users Found...")
        }
        const match=req_profile.following.filter(user=>user.user_name===clicked_user)
        const isFollowing=match.length>0;
        return resp.json({following:isFollowing});

    }
    catch(e){
        return resp.json(e)
    }
})
app.post("/forgot-password",async(req,resp)=>{
    const{email,password}=req.body;
    console.log(email,password);
    const req_user=await user.findOne({user_email:email});
    if(!req_user){
        return resp.json({message:"Invalid Email Address..."})
    }
    if(req_user.user_name !=req.body.username){
        return resp.json({message:"Invalid Username..."})
    }
    req_user.user_password=password;
    console.log(req_user)
    await req_user.save();
    return resp.json({message:"New Password Created Successfully...."})
})
app.post("/logout",async(req,resp)=>{
    console.log(req.body);
    const email=req.body.email;
    const user_password=req.body.password;
    const req_user=await user.findOne({user_email:email});
    console.log(req_user)
    if(!req_user){
        return resp.json({message:"Invalid username/password...."})
    }
    
    const ismatch=await bcrypt.compare(user_password,req_user.user_password);
    if(ismatch){
    req.session.destroy(err=>{
        if(err){
            return resp.status(500).json({
                message:"error while logging out"
            })
        }
        return resp.redirect("/");
    })
}
else{
    return resp.json({message:"Invalid Email Or Password...."})
}

})

//adding or removing followers from the db
app.post("/follow",async(req,resp)=>{
    const{logged_username,clicked_user}=req.body;
    try{
    const loggedUser=await profile.findOne({user_name:logged_username});
    const clickedUser=await profile.findOne({user_name:clicked_user});
        if(!loggedUser || !clickedUser){
            return resp.json("No User Found...")
        }


        const isAlreadyFollowing = loggedUser.following.some(f => f.user_name ===clicked_user);
        if(isAlreadyFollowing){
             // Unfollow
      loggedUser.following = loggedUser.following.filter(f => f.user_name!== clicked_user);
      clickedUser.followers=clickedUser.followers.filter(f =>f.user_name!==logged_username);
    } else {
      // Follow
      loggedUser.following.push({
        userId:clickedUser.userId,
        user_name:clickedUser.user_name
      });
      clickedUser.followers.push({
        userId:loggedUser.userId,
        user_name:loggedUser.user_name
      });
const newNotification=new notification({
    type:"follow",
    From_User:{
            userId:loggedUser._id,
            user_name:loggedUser.user_name,
            user_FullName:loggedUser.user_fullName,
            user_pic:loggedUser.user_profile_pic
        },
        toUserId:{
            userId:clickedUser._id,
            user_name:clickedUser.user_name
        },
        createdAt:new Date()
})
await newNotification.save();

        }
        await loggedUser.save();
        await clickedUser.save();

        //updating sessions
        req.session.log_user.following=loggedUser.following;
        return resp.json({followed:isAlreadyFollowing})

    }
    catch(e){

    }

})


//getting followed and followers full names
app.post("/get-follow-names", async (req, res) => {
    const { users } = req.body;

    if (!Array.isArray(users)) {
        return res.status(400).json({ error: "Invalid input" });
    }

    try {
        const enrichedUsers = await Promise.all(
            users.map(async (u) => {
                const found = await profile.findOne({ user_name: u.user_name });
                return {
                    user_name: u.user_name,
                    user_fullName: found?.user_fullName || "Unknown",
                    user_profile_pic: found?.user_profile_pic || "uploads/profiles/default.jpg"
                };
            })
        );
        res.json(enrichedUsers);
    } catch (err) {
        console.error("Follow list error:", err);
        res.status(500).json({ error: "Server error" });
    }
});





app.get("/get-notification/:username",async(req,resp)=>{
    const username=req.params.username;
    const req_notification=await notification.find({'toUserId.user_name':username}).sort({createdAt:-1});
    console.log(req_notification)
    return resp.json({
        req_notification
    })
})

//app.use("/user",user_router);

module.exports=local_midd;
app.listen(port,()=>{
    console.log("Server Started At the port",port);
});