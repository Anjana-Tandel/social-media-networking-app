const profilePic=document.querySelectorAll(".profilePic");
const coverPic=document.querySelector(".coverPic");
const search_users=document.querySelector("#search_users");
const mediaInput=document.querySelector("#mediaInput");
const show_images=document.querySelector("#show_images")
const send_post=document.querySelector(".send_post");
const video=document.querySelector("#videos");
const name_id=document.querySelector("#name_id");
const timeline_posts=document.querySelector("#timeline_posts");
const second_container=document.querySelector("#second_container");
const post_container=document.querySelector(".post_container");
const user_profile_page=document.querySelector("#user_posts");
const third_container=document.querySelector("#third_container");

let username="";
let profile_pic="";
let len=0;
let comments_on=0;

//creating empty box
const createEmptyBox=(text,hedding)=>{
    const empty_div=document.createElement("div");
        empty_div.innerText=text;
        empty_div.classList.add("empty_div")
        const h_div=document.createElement("div");
        h_div.classList.add("back_hedding")
        h_div.innerHTML=`<i class="fa fa-arrow-right" id="goBack"></i><h4>${hedding}</h4>`;
        second_container.innerHTML="";
        second_container.append(h_div);
        second_container.append(empty_div);
        go_backFunction();
}


//Adding Post To Bookmarks
const addToBookmarks=async(postId,posted_user,username,b_icon)=>{
    console.log(postId,posted_user,username)
    const resp=await fetch("/post/bookmark",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({postId,posted_user,username}),
        credentials:"include"
    });
    const res=await resp.json();
    if(res.is_bookmark){
        b_icon.classList.remove("far");
        b_icon.classList.add("fas") ; 
        b_icon.style.color="#2563eb";
    }
    else{
        b_icon.classList.remove("fas");
        b_icon.classList.add("far") ; 
        b_icon.style.color="#c7c0c0"; 
    }
}


//check for bookmarks function
const checkBookmark=async(posted_user,postId,username)=>{
    const resp=await fetch("/posts/check-bookmark",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({posted_user,postId,username}),
        credentials:"include"
    });
    const is_bookmark=await resp.json();
    return is_bookmark;
}



//getting singlepost
const get_SinglePost=async(PostId,user_name)=>{
    const resp=await fetch("/user/posts",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({PostId,user_name}),
        credentials:"include"
    });
    const posts=await resp.json();
    return posts;
}

//function for getting bookmarked posts
const getBookmarkedPosts=async()=>{
    const resp=await fetch("/bookmark/posts");
    const res=await resp.json();
    console.log(res)
    if(res.length===0){
        createEmptyBox("No Posts Found....","Bookmarks");

    }
    else{
        display_timeline(res,username);
        second_container.classList.add("bookmarks_class");
    }
    
    
}


//showing notification
const show_notifications=async(notifications_data)=>{
    let text="";
const Notifications=notifications_data.req_notification;
const notification_container=document.createElement("div");
notification_container.classList.add("notification_container");

const not_hedding=document.createElement("div");
not_hedding.classList.add("not_hedding")
not_hedding.innerHTML=`<h3>Notifications <span>(${Notifications.length})</span></h3>
`

const AllNotification=document.createElement("div");
AllNotification.classList.add("AllNotifications");
AllNotification.classList.add("Scroll_Property");
third_container.appendChild(notification_container);
notification_container.appendChild(not_hedding);
notification_container.appendChild(AllNotification);

if(Notifications.length===0){
    AllNotification.innerText="No Notifications";
    AllNotification.classList.add("empty_container");
}
else{
    Notifications.forEach(notification=>{
        const PostId=notification.From_User.PostId;        ;
        const user_name=notification.toUserId.user_name;

        if(notification.type==="follow"){
            text="is now following you."
        }
        else if(notification.type==="comment"){
            text="has replied to your post."
        }
        if(notification.type==="like"){
            text="Has liked your post."
        }
        const each_notification=document.createElement("div");
        each_notification.classList.add("inside_div");
        if(!notification.isread){
            each_notification.classList.add("unread");
        }
        each_notification.innerHTML=`
                          <div class="profile_pic_container">
                  <img src="${notification.From_User.user_pic}" class="profilePic"></img>
                  </div>
  
                  <div class="comment_username">
                  <h4>${notification.From_User.user_FullName}</h4>
                  <p>${text}</p>
                  </div>
  
                  <div class="time">
                  <h6>${getRelativeTime(notification.createdAt)}</h6>
                  </div>
        `
        each_notification.addEventListener("click",async(e)=>{
            const data_obj=await get_loggedUser();
            if(notification.type==="follow"){
                display_profile(notification.From_User.user_name,data_obj);
            }
            else if(notification.type==="comment"){
                const posts=await get_SinglePost(PostId,user_name);
                console.log(posts)
                if(posts==="No posts"){
                    createEmptyBox("No Posts/Comments Exists Now....","Notifications")
                }
                else{
                second_container.classList.add("show_singlePost");
                display_timeline(posts,user_name);
                }

            }
            if(notification.type==="like"){
                const posts=await get_SinglePost(PostId,user_name);
                console.log(posts);
                if(posts==="No posts"){
                    createEmptyBox("The Post Didnt Exists now","Notifications")
                }
                else{
                second_container.classList.add("show_singlePost");
                display_timeline(posts,user_name);
                }
                
            }
        })
        AllNotification.appendChild(each_notification);
})
}
}




//for fetching notification
const fetchNotification=async()=>{
    const data_obj=await get_loggedUser();
    const resp=await fetch(`/get-notification/${data_obj.data.username}`);
    const notifications=await resp.json();
    show_notifications(notifications);
}



//editing the user information
const edit_Information=async(clicked_userDetails,data_obj)=>{
    user_profile_page.innerHTML=``;
    const edit_profilePage=document.createElement("div");
    const edit_form=document.createElement("form");
    const coverPic=clicked_userDetails.user_coverPic;
    const d=clicked_userDetails.user_dob;
    const user_name=clicked_userDetails.user_name;
    const date=new Date(d).toISOString().split("T")[0];

    edit_form.enctype="multipart/form-data";
    edit_form.classList.add("Edit_form");

    edit_form.innerHTML=`
    <div id="coverPic_profilePic">

    <label for="cover">
    <div style="height:200px; width:100%;" class="setCoverIcon">


    <img src="${coverPic}" class="set_coverPic"  style="opacity:0.5">
    <i class="fas fa-camera"></i>
    </div>
    </label>

    <input type="file" id="cover" name="user_coverPic" style="display:none">

    <label for="profilePhoto">
    <div  class="setProfileIcon">
    <img src="${clicked_userDetails.user_profile_pic}" class="set_profilePic" style="opacity:0.5">
    <i class="fas fa-camera"></i>
    </div>
    </label>

    <input type="file" id="profilePhoto" name="user_profile_pic" style="display:none">
    </div>

    <div class="changeInfo_container">

    <div id="name_div">
    <label>Name</label>
    <input type="text" id="fullName" value="${clicked_userDetails.user_fullName}">
    </div>

    <div id="bio_div">
    <label>Bio</label>
    <textarea id="bio_text" rows="3">${clicked_userDetails.user_bio}</textarea>
    </div>

    <div id="dob_div">
    <label>Date Of Birth </label>
    <input type="date" value="${date}" id="dob">
    </div>

    <div class="back_edit">
    <i class="fa fa-arrow-right" id="goBack"></i>
    <button type="submit">Edit</button>
    </div>

    </div>
    `
    
    edit_profilePage.appendChild(edit_form);
    user_profile_page.appendChild(edit_profilePage);


    //limiting scroll bar text
    const bio_text=document.querySelector("#bio_text")
    bio_text.addEventListener("input",()=>{
        const lines=bio_text.value.split('\n');
        if(lines.length>3){
            bio_text.value=lines.slice(0,3).join("\n");
        }
    })

    const profilePhoto=document.querySelector("#profilePhoto");
    const SetprofilePhoto=document.querySelector(".set_profilePic");

    const coverPicture=document.querySelector("#cover");
    const SetcoverPicture=document.querySelector(".set_coverPic");

    profilePhoto.addEventListener("change",function(){
        const file=this.files[0];
        if(file){
            SetprofilePhoto.src=URL.createObjectURL(file);
        }
    });

    coverPicture.addEventListener("change",function(){
        const file=this.files[0];
        if(file){
            SetcoverPicture.src=URL.createObjectURL(file);
        }
    });

    const back=document.querySelector("#goBack");
    back.addEventListener("click",async()=>{
        user_profile_page.innerHTML=``;
        const clicked_user=clicked_userDetails.user_name;
        display_profile(clicked_user,data_obj);
    })

    

    //sending new edited form data to backend....
    document.querySelector(".Edit_form").addEventListener("submit",async(e)=>{
        e.preventDefault();
        const formdata=new FormData(e.target);

        const user_fullName=document.querySelector("#fullName").value;
        const user_bio=document.querySelector("#bio_text").value;
        const user_dob=document.querySelector("#dob").value;
        const user_profile_pic=document.querySelector("#profilePhoto").files[0];
        const user_coverPic=document.querySelector("#cover").files[0];
        formdata.append("user_fullName",user_fullName);
        formdata.append("user_bio",user_bio);
        formdata.append("user_dob",user_dob);
        formdata.append("user_coverPic",user_coverPic);
        formdata.append("user_profile_pic",user_profile_pic);
        formdata.append("user_name",user_name)

        const resp=await fetch("/update-profile",{
            method:"POST",
            body:formdata
        });
        const result=await resp.json();
        alert(result.message);
        if(result.message=="success"){
            const data_obj=await get_loggedUser();
            const h4=document.querySelector("#h4_tag");
            name_id.children[0].innerText=user_fullName;        
            profilePic[0].src=data_obj.data.user_profile_pic;
            profilePic[1].src=data_obj.data.user_profile_pic;
            profilePic[2].src=data_obj.data.user_profile_pic;
        }


    })

}

//this is used for making image larger and smaller
function openPopup(imgUrl,a) {
    console.log(a)
  const popupOverlay = document.getElementById("popupOverlay");
  const popupImg = document.getElementById("popupImg");
  console.log(imgUrl)
console.log(popupImg)
  popupImg.src = imgUrl;
  popupOverlay.style.display = "flex";
}

function closePopup() {
  const popupOverlay = document.getElementById("popupOverlay");
  popupOverlay.style.display = "none";
}

//get the followers and following list
async function showFollowList(userArray, type) {
    const response = await fetch("/get-follow-names", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ users: userArray })
    });

    const data = await response.json();

    if (Array.isArray(data)) {
        const container = document.createElement("div");
        container.className = "follow_list";

        // Close Button
        const closeDiv = document.createElement("div");
        closeDiv.className = "follow_close";
        closeDiv.innerHTML = `<button onclick="document.querySelector('.follow_list').remove()">Close</button>`;
        container.appendChild(closeDiv);

        if(!Array.isArray(data)||data.length===0){
            let empty = document.createElement("p");
            empty.style.textAlign="center";
            empty.style.color="#aaa";
            empty.textContent=`No ${type} Found !`
            container.appendChild(empty);

        }
        else{
        // Add all users
        data.forEach(user => {
            const div = document.createElement("div");
            div.className = "follow_item";

            div.innerHTML = `
                <img src="${user.user_profile_pic}" class="follow_pic" />
                <p><strong>${user.user_fullName}</strong><br>@${user.user_name}</p>
            `;

            div.addEventListener("click", async() => {
                const data_obj=await get_loggedUser()
                display_profile(user.user_name,data_obj);
            });

            container.appendChild(div);
        });
    }

        // Remove existing list if open
        const oldList = document.querySelector(".follow_list");
        if (oldList) oldList.remove();

        document.body.appendChild(container);
    } else {
        alert("Could not load " + type + " list.");
    }
}



//this is used to display the profile of the clicked user
const display_profile=async(clicked_user,data_obj)=>{
    
    //goto notification slide
    remove_others(1);

    const response=await fetch(`/get-user/${clicked_user}`);
    second_container.innerHTML=``;
    const clicked_userDetails=await response.json();
    console.log(clicked_userDetails)
    user_profile_page.innerHTML=``;
    timeline_posts.classList.add("hidden");
    post_container.classList.add("hidden");
    user_profile_page.style.display="flex";
    user_profile_page.classList.add("user_profile_page");
    const coverPic=clicked_userDetails.user_coverPic.replace(/\\/g,'/');
    const profilePic=clicked_userDetails.user_profile_pic.replace(/\\/g,'/');
    const insideUser_profile=document.createElement("div");
    insideUser_profile.classList.add("insideUser_profile");

    insideUser_profile.innerHTML=`
    <div id="coverPic_profilePic">
    <img src="${coverPic}" class="set_coverPic" onclick="openPopup('${coverPic}')">
    <img src="${profilePic}" class="set_profilePic" onclick="openPopup('${profilePic}')">
  </div>

  <div id="popupOverlay">
    <span id="popupClose" onclick="closePopup()">&#10006;</span>
    <img src="" id="popupImg">
  </div>`
    second_container.appendChild(user_profile_page);
    
    const second_div=document.createElement("div");
    second_div.classList.add("second_divOfProfile")
    const profile_main=document.createElement("div");

    profile_main.className="profile_mainName";
    profile_main.innerHTML=`
    <h4>${clicked_userDetails.user_fullName}</h4>
    <h5>@${clicked_user}</h5>
    <p>${clicked_userDetails.user_bio}</p>
    <div class="followers_div">
    <p id="followingCount">${clicked_userDetails.following.length} <span>Following</span></p>
    <p id="followersCount">${clicked_userDetails.followers.length} <span>Followers</span></p>
    </div>
    `;

    second_div.appendChild(profile_main);

    insideUser_profile.appendChild(second_div);


    if(clicked_user===data_obj.data.username){
        const edit_profile=document.createElement("button");
        edit_profile.innerText="Edit Profile";
        edit_profile.addEventListener("click",()=>{
            edit_Information(clicked_userDetails,data_obj);
        });
        edit_profile.classList.add("edit_profile");
        second_div.appendChild(edit_profile);
    }
    else{
        const follow_btn=document.createElement("button");
        follow_btn.classList.add("follow_following");

        // now check whether both are already following or not...
        const logged_userName=data_obj.data.username;
        const resp=await fetch("/check-follow",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({clicked_user,logged_userName}),
            credentials:"include"
        });
        const result=await resp.json();
        if(result.following){
            follow_btn.innerText="Following";
            follow_btn.classList.add("Following");
        }
        else{
            follow_btn.innerText="Follow";
            follow_btn.classList.add("Follow");
        }
        second_div.appendChild(follow_btn);
    }
    user_profile_page.append(insideUser_profile);

//getting followers anf following list
console.log(profile_main)
document.querySelector("#followersCount").addEventListener("click", () => {
    showFollowList(clicked_userDetails.followers, "Followers");
});

document.querySelector("#followingCount").addEventListener("click", () => {
    showFollowList(clicked_userDetails.following, "Following");
});


    const follow_following=document.querySelector(".follow_following");
    if(follow_following){

    follow_following.addEventListener("click",async(e)=>{
        const logged_username=data_obj.data.username;

        //implement Followers or Following System
    const resp=await fetch("/follow",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({logged_username,clicked_user}),
        credentials:"include"
    });
    const result=await resp.json();
    if(result.followed){
        follow_following.classList.remove("Following");
        follow_following.classList.add("Follow");
        follow_following.innerText="Follow";
        display_profile(clicked_user,data_obj);

    }
    else{
        follow_following.classList.remove("Follow");
        follow_following.classList.add("Following");
        follow_following.innerText="Following";
        display_profile(clicked_user,data_obj);
    }
    })
}
    const resp=await fetch(`/get-posts/${clicked_user}`);
    const get_userPosts=await resp.json();

    const viewUser_posts=document.createElement("button");
    viewUser_posts.classList.add("viewUser_posts");

    let len=get_userPosts.length;

    viewUser_posts.innerHTML=`Posts <span>( ${len} )</span>`;
    user_profile_page.appendChild(viewUser_posts);

    if(get_userPosts.length===0){
        const empty_div=document.createElement("div");
        empty_div.innerText="No Posts Created By The User....";
        empty_div.classList.remove("empty_div");
        empty_div.classList.add("empty_posts");
        user_profile_page.append(empty_div);
    }
    else{
    display_timeline(get_userPosts,username);
    }
}

const disp=async(username)=>{
    const data_obj=await get_loggedUser();
    display_profile(username,data_obj);
}


//get the details of logged in user.....
const get_userDetails=async()=>{
        const main_div=profilePic[1].nextElementSibling;
        const get_username=main_div.children[1];
        const data_obj=await get_loggedUser();
        const clicked_user=get_username.innerText.slice(1);
        display_profile(clicked_user,data_obj);
}


//getting the deails of logged in user after clicking on their profile pics...
profilePic.forEach(profile=>{
    profile.addEventListener("click",async()=>{
        //show_posts("a");
        get_userDetails();
    });

})

//fetching the logged user details
const get_loggedUser=async()=>{
    const resp=await fetch("/getUser");
    const data_obj=await resp.json(); 
    return data_obj;
}


//Loading the timeline whenever the user logs in 
document.addEventListener("DOMContentLoaded",async()=>{
    const data_obj=await get_loggedUser();
    username=data_obj.data.username;
    userFullname=data_obj.data.user_FullName;
    name_id.children[0].innerText=userFullname;
    name_id.children[1].innerText=`@${username}`;
    profile_pic=data_obj.data.user_profile_pic;
    if(!data_obj.data.user_profile_pic){
        console.log("no profile pic");
    }
    else{
        profilePic[0].src=data_obj.data.user_profile_pic;
        profilePic[1].src=data_obj.data.user_profile_pic;
        profilePic[2].src=data_obj.data.user_profile_pic;
        
    }
    if(!data_obj.data.user_coverPic){
        console.log("no cover pic");
    }
    else{
        coverPic.src=data_obj.data.user_coverPic;
    }
    fetchTimeline(username,data_obj);
    fetchNotification();
})

async function show_posts(req_user){

    const data_obj=await get_loggedUser();

    username=data_obj.data.username;
    profile_pic=data_obj.data.user_profile_pic
    userFullname=data_obj.data.user_FullName;
    fetchTimeline(username,profile_pic);
}

//implementing like System
const implement_like=async(liked_user,posted_user,post_id,icon_element)=>{
    
    const resp=await fetch("/post/like",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({liked_user,posted_user,post_id
        }),
        credentials:"include"
    });
    const {liked,likedPost}=await resp.json();
    if(liked){
    icon_element.style.color="red";
    icon_element.style.webkitTextStroke="1px red";
    }
    else{
        icon_element.style.color="transparent";
        icon_element.style.webkitTextStroke="1px #c7c0c0";
    }
    const span_tag=icon_element.nextElementSibling;
    span_tag.innerText=`${likedPost.likes.length} Likes`
}

const autoResize=(textarea)=>{
    textarea.style.height="auto";
    textarea.style.height=textarea.scrollHeight+"px";
}


//checking times of posts
function getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const secondsAgo = Math.floor((now - then) / 1000);
  
    if (secondsAgo < 60) return 'just now';
    if (secondsAgo < 3600) return `${Math.floor(secondsAgo / 60)} minute(s) ago`;
    if (secondsAgo < 86400) return `${Math.floor(secondsAgo / 3600)} hour(s) ago`;
    return `${Math.floor(secondsAgo / 86400)} day(s) ago`;
  }

  //function for deleting posts
  const delete_post=async(posted_user,postId)=>{
    console.log(posted_user,postId);
    const resp=await fetch("/delete-post",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({posted_user,postId,username}),
        credentials:"include"
    });
    const res=await resp.json();
    alert(res.message);
    window.location.reload();
  }




  //functions for displaying the  posts in the timeline
  const display_timeline=async(all_posts,username)=>{
    const data_obj=await get_loggedUser();

    if(timeline_posts.classList.contains("hidden")){
        timeline_posts.classList.remove("hidden");
        user_profile_page.append(timeline_posts);
    }

    if(second_container.classList.contains("show_singlePost")){
        second_container.classList.remove("show_singlePost");
        remove_others(2);
        second_container.innerHTML=``;
        const h_div=document.createElement("div");
        h_div.classList.add("back_hedding")
        h_div.innerHTML=`<i class="fa fa-arrow-right" id="goBack"></i><h4>Posts</h4>`;
        second_container.append(h_div);
        second_container.append(timeline_posts);
    }

    if(second_container.classList.contains("bookmarks_class")){
        remove_others(4);
        second_container.classList.remove("bookmarks_class");
        second_container.innerHTML=``;
        const h_div=document.createElement("div");
        h_div.classList.add("back_hedding")
        h_div.innerHTML=`<i class="fa fa-arrow-right" id="goBack"></i><h4>Bookmarks</h4>`;
        second_container.append(h_div);
        second_container.append(timeline_posts);
    }

    //triggering goback actions..
    go_backFunction();

    timeline_posts.innerHTML="";

    all_posts.forEach(async(post) =>{
      let liked=post.likes.includes(username);

      //check for bookmarks
      const is_bookmark=await checkBookmark(post.username,post.post_id,username);

      const postDiv = document.createElement('div');
      const user_detail=document.createElement("div");
      user_detail.className="user_detail";
      user_detail.innerHTML=`
      <div class="profile_container">
      <img src=${post.user_profile_pic} class="profilePic" onclick="disp('${post.username}')"></img>
      <div class="flex_property" id="name_id">
      <h4>${post.userFullname}</h4>
      <h5>${getRelativeTime(post.createdAt)}</h5>
      </div>
      <i class="fas fa-trash trash-${post.post_id}" style="display:none"></i>
      </div>`;
  
      postDiv.append(user_detail);
      postDiv.className ='post';
      postDiv.classList.add(`each_post-${post.post_id}`)
  
      const caption = document.createElement('p');
      caption.textContent = post.caption;
      postDiv.appendChild(caption);
  
      if (post.media_url && post.media_url.length>0) {
        const mediaGrid = document.createElement('div');
        mediaGrid.className ="show_media";
  
        post.media_url.forEach(file => {
          const ext = file.split('.').pop().toLowerCase();
          let mediaEl;
  
          if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            mediaEl = document.createElement('img');
          } else if (['mp4', 'webm', 'ogg'].includes(ext)) {
            mediaEl = document.createElement('video');
            mediaEl.controls = true;
            mediaEl.autoplay=true;
            mediaEl.muted=true;
            mediaEl.loop=true;
            mediaEl.playsInline=true;
          }
  
          if (mediaEl) {
            mediaEl.src = `${file}`;
            mediaGrid.appendChild(mediaEl);
          }
        });
        postDiv.appendChild(mediaGrid);
      }
  
      //creating icon container...
      let main_iconContainer=document.createElement("div");
      main_iconContainer.className="main_iconContainer";
      main_iconContainer.innerHTML=`
      <div class="like_comment_bookmark">
      <div class="like_comment">
      <i class="fas fa-heart icon2"id="icon-${post.post_id}" onclick="implement_like('${username}','${post.username}','${post.post_id}',this)"  ></i><span>${post.likes.length} Likes</span>
      <i class="far fa-comment" id="comment_icon-${post.post_id}"></i><span id="comments_length-${post.post_id}">${post.comments.length} comments</span>
      </div>
      <div>
      <i class="far fa-bookmark" id="bookmarks-${post.post_id}" onclick="addToBookmarks('${post.post_id}','${post.username}','${username}',this)"></i>
      </div>
      </div>
      <div class="comment_section" id="comment-${post.post_id}" style="display:none;"></div>`;
  
      if(post.media_url.length<1){
          main_iconContainer.classList.add("add_padding");
      }
      postDiv.appendChild(main_iconContainer);
      timeline_posts.appendChild(postDiv);

      //keeping the liked post red in color
      const icon = document.getElementById(`icon-${post.post_id}`); 
      if(liked) {
          icon.style.color = "red";        
          icon.style.webkitTextStroke = "1px red";    
      } 
          else {
              icon.style.color = "transparent";
              icon.style.webkitTextStroke = "1px #c7c0c0";
          }




      //keeping the bookmarked posts as blue
      const b_icon=document.getElementById(`bookmarks-${post.post_id}`);
      if(is_bookmark.isBookmarked){
        b_icon.classList.remove("far");
        b_icon.classList.add("fas") ; 
        b_icon.style.color="#2563eb";
    }
    else{
        b_icon.classList.remove("fas");
        b_icon.classList.add("far") ; 
        b_icon.style.color="#c7c0c0"; 
    }    



          //creating comment section
  
          const comnt = document.getElementById(`comment_icon-${post.post_id}`);
          const comnt_container = document.getElementById(`comment-${post.post_id}`);
          comnt.addEventListener("click",async()=>{
              const post_user=post.username;
              if(!comments_on){
                comnt_container.innerHTML=``;

          comnt_container.style.display="flex";
          comnt_container.className="show_comment";
  
          const post_comment=document.createElement("div");
          post_comment.innerHTML=``;
          post_comment.className="post_comment";
          post_comment.innerHTML=`
          <img src=${profile_pic} class="profilePic"></img>
          <textarea id="user_comment-${post.post_id}" placeholder="Comment Here" required="true" oninput="autoResize(this)" rows="0"></textarea>
          <button class="send_comment" id="add_comment-${post.post_id}">post</button>
          `
          comnt_container.appendChild(post_comment);
          const all_comments_container=document.createElement("div");
          all_comments_container.className="all_comments_container";
          all_comments_container.innerHTML=``;
          const resp=await fetch("/post/get-comments",{
              method:"POST",
              headers:{
                  "Content-Type":"application/json"
              },
              body:JSON.stringify({
                  Post_user:post_user,
                  PostId:post.post_id,
              }),
              credentials:"include"
          })
          
          const req_post=await resp.json();
          if(req_post.comments.length>3){
            all_comments_container.style.maxHeight="160px";
            all_comments_container.style.overflowX="auto";
            all_comments_container.classList.add("Scroll_Property");
          }
  
  
          if(req_post.comments){
              req_post.comments.forEach(c=>{
                  console.log(c)
                  const inside_div=document.createElement("div");
                  inside_div.className="inside_div";
                  inside_div.innerHTML=`
  
                  <div class="profile_pic_container">
                  <img src="${c.postedUserpic}" class="profilePic"></img>
                  </div>
  
                  <div class="comment_username">
                  <h4>${c.user_FullName}</h4>
                  <p>${c.text}</p>
                  </div>
  
                  <div class="time">
                  <h6>${getRelativeTime(c.createdAt)}</h6>
                  </div>`
                  all_comments_container.append(inside_div);
                  comnt_container.append(all_comments_container);
              })
  
          }
          
  
          const add_comment=document.querySelector(`#add_comment-${post.post_id}`);

          //adding the comments to backend......
          add_comment.addEventListener("click",async()=>{
              const user_comment_div=document.querySelector(`#user_comment-${post.post_id}`);
              const user_comment=user_comment_div.value;
              const data_obj=await get_loggedUser();
              const user_FullName=data_obj.data.user_FullName;
              const postId=post.post_id;
              const resp=await fetch("/post/add-comment",{
                  method:"POST",
                  headers:{
                      "Content-Type":"application/json"
                  },
                  body:JSON.stringify({
                      Username:username,
                      user_fullName:user_FullName,
                      User_comment:user_comment,
                      PostId:postId,
                      Post_user:post_user,
                      PostedUser_pic:profile_pic
                  }),
                  credentials:"include"
              })
              const resp_obj=await resp.json();
              alert(resp_obj.message);
              if(resp_obj.success){
                  const cmnt_length=document.querySelector(`#comments_length-${post.post_id}`);
                  len=len+1;
                  cmnt_length.innerText=`${req_post.comments.length+len} Comments`;
                  user_comment_div.value="";
                  const new_cmnt=document.createElement("div");
                  new_cmnt.className="inside_div";


                  //showing the newly added comment
                  new_cmnt.innerHTML=`
                  <div class="profile_pic_container">
                  <img src="${resp_obj.comment.postedUserpic}" class="profilePic"></img>
                  </div>
  
                  <div class="comment_username">
                  <h4>${data_obj.data.user_FullName}</h4>
                  <p>${resp_obj.comment.text}</p>
                  </div>
                  <div class="time">
                  <h6>${getRelativeTime(resp_obj.comment.createdAt)}</h6>
                  </div>
                 `
                 all_comments_container.prepend(new_cmnt);
                 comnt_container.append(all_comments_container);
              }
  
          })
          comments_on=1;
      }
      else{
          comnt_container.innerHTML=``;
          comments_on=0;
          
      }
          })


  const each_post=document.querySelector(`.each_post-${post.post_id}`);
  const t_icon=document.querySelector(`.trash-${post.post_id}`);

  t_icon.addEventListener("click",()=>{
    delete_post(post.username,post.post_id)
  })

  each_post.addEventListener("mouseenter",()=>{
    if(post.username===username){
    t_icon.style.display="block";
    }
  })

  each_post.addEventListener("mouseleave",()=>{
    if(post.username===username){
        t_icon.style.display="none";
        }
  })
    })
  }


//function for fetching the timeline posts
const fetchTimeline=async(username,data_obj)=>{
    const timeline_posts=document.querySelector("#timeline_posts");
     let resp=await fetch("/get-posts");
     let all_posts=await resp.json();
    
  timeline_posts.innerHTML = '';
display_timeline(all_posts,username);
}


//function for the working of the slider
const goTo_page=async(name)=>{
    const data_obj=await get_loggedUser();    
    const user_name=data_obj.data.username;
    if(name=="Home"){
    window.location.reload();
    }
    if(name=="Profile"){
        display_profile(user_name,data_obj)
    }
    if(name=="Notifications"){
        const not_hedding=document.querySelector(".not_hedding");
        not_hedding.classList.remove("add_glow");
        void not_hedding.offsetWidth;
        not_hedding.classList.add("add_glow");
        const AllNotifications=document.querySelector(".AllNotifications");
        AllNotifications.classList.remove("add_glow");
        void AllNotifications.offsetWidth;
        AllNotifications.classList.add("add_glow");

    }
    if(name=="BookMarks"){
        getBookmarkedPosts();
    }
    if(name=="Search"){
        const search=document.querySelector("#search_users");
        console.log(search)
        const s_icon=document.querySelector("#search_icon");

        search.classList.remove("add_glow");
        void search.offsetWidth;
        search.classList.add("add_glow");

        s_icon.classList.remove("add_glow");
        void s_icon.offsetWidth;
        s_icon.classList.add("add_glow");



    }
}

//remove other actives
const remove_others=(num)=>{
    menuItems.forEach(i=>{
        i.classList.remove("active");
    })
    menuItems[num].classList.add("active");

}


//this is for list items selection

const menuItems=document.querySelectorAll(".menu-item");
menuItems.forEach(item=>{
    item.addEventListener('click',()=>{
        const name=item.innerText;
        goTo_page(name);
        menuItems.forEach(i=>{
            
            i.classList.remove("active");
            item.classList.add("active");
        })
    })
})

//for setting textarea automatic height

let caption=document.querySelector("#caption");
caption.addEventListener("input",()=>{
    caption.style.height='auto';
    const minheight=20;
    caption.style.height=Math.max(caption.scrollHeight,minheight)+'px';
})

//for creating post
const profile_btn=document.querySelector("#create_post");
profile_btn.addEventListener("click",async()=>{
    const data_obj=await get_loggedUser();
    const clicked_user=username;
    display_profile(clicked_user,data_obj)
})

create_post.addEventListener("click",()=>{
    if(post_container.classList.contains("hidden")){
        post_container.classList.remove("hidden");
    }
})


//to search for users in the site
search_users.addEventListener("input",async()=>{
    remove_others(3)
    let query=search_users.value.trim();
    //hiding the timeline and create post

    timeline_posts.classList.add("hidden");
    post_container.classList.add("hidden");

    const search_hedding=document.createElement("div");
    search_hedding.classList.add("search_hedding")
    second_container.innerHTML=``;

    const search_container=document.createElement("div");
    search_container.classList.add("search_container");

    second_container.appendChild(search_hedding);
    second_container.appendChild(search_container);

    query=query.startsWith('@')?query.slice(1):query;
    const resp=await fetch(`/search?user_name=${query}`);
    const res=await resp.json();
    console.log(res)
    if(res.msg=="Sorry! No Search Term Found..."){
        search_hedding.innerHTML=`
        <i class="fa fa-arrow-right" id="goBack"></i>
        <h4>Search Results(0)</h4>`;
        search_container.innerText="No Search User Found.....!";
        search_container.classList.add("align_text");

    }
    else{
        search_hedding.innerHTML=`<i class="fa fa-arrow-right" id="goBack"></i><h4>Search Results(${res.users.length})</h4>`;
        if(res.users.length==0){
            console.log("entered...")
            search_container.innerText="No Search User Found.....!";
            search_container.classList.add("align_text");
        }
        else{
            res.users.forEach(async(user)=>{
                console.log(user);
                const each_user=document.createElement("div");
                const data_obj=await get_loggedUser();
                each_user.classList.add("each_user");

                each_user.addEventListener("click",()=>{
                    display_profile(user.user_name,data_obj);
                })
                each_user.innerHTML=`<div id="profile_div">
                <img src="${user.user_profile_pic}">
                </div>
                <div id="user_fullname">
                <h4>${user.user_fullName}</h4>
                <h5>@${user.user_name}</h5>
                </div>`
                search_container.appendChild(each_user);
            })
        }
    }
    const back_icon=document.querySelector("#goBack");
    back_icon.addEventListener("click",()=>{
        window.location.reload();
    })
})


//arranging the images/videos in the div
mediaInput.addEventListener("change",(e)=>{
    show_images.innerHTML="";
    timeline_posts.style.display="none";
    const files=Array.from(mediaInput.files);
    if(files.length>0){
        files.forEach(file=>{
            const fileUrl=URL.createObjectURL(file);
            if(file.type.startsWith('image/')){
                const img=document.createElement('img');
                img.src=fileUrl;
                show_images.append(img);
            }
            else if(file.type.startsWith("video/")){
                const video=document.createElement('video');
                video.src=fileUrl; 
                video.muted=true;
                video.autoplay=true;
                video.loop=true;
                video.playsInline=true;  
                show_images.append(video);
            }
        })
    }
})

//creating the post and sending it to the backend
document.getElementById("createPostForm").addEventListener("submit",async(e)=>{
    e.preventDefault();
    const caption=document.querySelector("#caption").value;
    const mediaInput=document.querySelector("#mediaInput");
    const selected_files=mediaInput.files;
    const formdata=new FormData();
    formdata.append("text",caption);
    formdata.append("username",username);
    for(let i=0;i<selected_files.length;i++){
        formdata.append("media",selected_files[i])
    }
    try{
        const resp=await fetch("/create-post",{
            method:"POST",
            body:formdata
        })
        const data_obj=await resp.json();
        if(resp.ok){
            alert("Post created Successfully....");
            timeline_posts.style.display="flex";
            document.getElementById("createPostForm").reset();
            window.location.reload();


        }
        else{
            alert("Failed to create Post....")
        }
    }
    catch(err){
        alert("some err...")
    }
})
//logout function
const logout_fromProfile=async()=>{
    const email=document.getElementById("email").value;
    const password=document.getElementById("password").value;
    if(!email || !password){
        alert("Please Fill Out The given Fields");
    }
    else{
        const resp=await fetch("/logout",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email,password}),
            credentials:"include"
        });
        
        if(resp.redirected){
            window.location.href=resp.url;
        alert("You Will Be Logged Out....");
        }
        else{
            const result=await resp.json();
            alert(result.message);
        }
    }
}



//implementing go back function
const go_backFunction=()=>{
const go_back= document.querySelector("#goBack");
if(go_back){
    go_back.addEventListener("click",()=>{
        window.location.reload();
    })
}
}


//for logout implementation
const logout=document.querySelectorAll(".logout");
logout.forEach(btn=>{
    btn.addEventListener("click",async(event)=>{
        remove_others(5);
        const logout_div=document.createElement("div");
        logout_div.classList.add("LogoutDiv")
        second_container.innerHTML=``;
        logout_div.innerHTML=`<div id="log">
        <h3>Please Enter Your Registered Email Address and Password To Get Logged Out.....</h3>
        <label>Email Address:</label>
        <input type="text" placeholder="Enter Email Address..." id="email">
        <label>Password:</label>
        <input type="password" placeholder="Your Password:" id="password">
        <button id="log_btn">Logout</button>
        </div>`;
        second_container.appendChild(logout_div);
        const log_btn=document.getElementById("log_btn");
        log_btn.addEventListener("click",()=>{
            logout_fromProfile();
        })


})
        
})
