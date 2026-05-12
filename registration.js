// On clicking Next
const steps = document.querySelectorAll(".step");
const ProfileSteps = document.querySelectorAll(".ProfileStep");
const form=document.querySelector(".profile_setUp");

const formData = new FormData();
const data_array={
  user_name:"",
  user_fullName:"",
  user_dob:"",
  user_gender:"",
  user_password:"",
  confirm_password:""
}
let profile_steps=0;
let currentStep = 0;


//adding photo
const profilePhoto=document.querySelector("#profilePic");
    const SetprofilePhoto=document.querySelector("#profile_pic");

    const coverPicture=document.querySelector("#coverPic");
    const SetcoverPicture=document.querySelector("#cover_pic");

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


//setting profile

const set_upProfile=(userId,user_name,user_dob,user_gender,user_fullName)=>{
  get_started.addEventListener("click",async function(event){
      fileInput = document.getElementById("profilePic") ;
      fileInput2 = document.getElementById("coverPic") ;
      user_bio=document.getElementById("bio").value;
      event.preventDefault();
      formData.append("user_profile_pic", fileInput.files[0]);
      formData.append("user_coverPic",fileInput2.files[0]);
      formData.append("user_bio",user_bio);
      formData.append("userId",userId);
      formData.append("user_name",user_name);
      formData.append("user_dob",user_dob);
      formData.append("user_gender",user_gender);
      formData.append("user_fullName",user_fullName);

  
      const response = await fetch("/setProfile", {
          method: "POST",
          body:formData
  })
  console.log(response)
  if(response.redirected){
    alert("Profile SetUp is Successfull !")
      window.location.href=response.url;
  }
  })
}

//profile Steps setup
document.querySelectorAll(".next_btn").forEach(btn => {
  btn.addEventListener("click", () => {
    ProfileSteps[profile_steps].classList.remove("active");
    profile_steps++;
    console.log(profile_steps);
    console.log(ProfileSteps[profile_steps]);
    ProfileSteps[profile_steps].classList.add("active");
  });
});

document.querySelectorAll(".back_btn").forEach(btn => {
  btn.addEventListener("click", () => {
    ProfileSteps[profile_steps].classList.remove("active");
    profile_steps--;
    ProfileSteps[profile_steps].classList.add("active");
  });
});


const collectData=(formNumber)=>{
  if(formNumber===0){
    const fname=document.querySelector("#Fullname").value;
    const uname=document.querySelector("#Username").value;
    const u_email=document.querySelector("#mail").value;

    if(!fname||!uname||!u_email){
      alert("Fill Out The Fields To Continue....");
      form.reset();
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(u_email)) {
       alert("Invalid Email Format ..!");
       form.reset();
       return false;
      }

    data_array.user_fullName=document.querySelector("#Fullname").value;
    data_array.user_name=document.querySelector("#Username").value;
    data_array.user_email=document.querySelector("#mail").value;
    return true;
  }
  else if(formNumber===1){
    const pass=document.querySelector("#Password").value;
    const conf_pass=document.querySelector("#confirmPassword").value;

    if(!pass||!conf_pass){
      alert("Fill Out The Fields To Continue....");
      form.reset();
      return false;
    }
    if(pass!=conf_pass){
      alert("Password and Confirm Password Isn't Matching !");
      return false;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if(!passwordRegex.test(pass)){
      alert("Invalid Password Format ..!");
      return false;
    }

    data_array.user_password=document.querySelector("#Password").value;
    data_array.confirm_password=document.querySelector("#confirmPassword").value;
    return true;

  }
}



document.getElementById("signUp_container").addEventListener("submit", async function(e) {
  e.preventDefault();
  const dob=document.querySelector("#dob").value;
  data_array.user_dob=document.querySelector("#dob").value;
    const selected=document.querySelector("input[name='Gender']:checked");
    if(selected){
    data_array.user_gender=selected.value;
    }
    if(!selected || !selected.value || !dob){
  alert("Fill Out The fields !");
    }
    else{
    const response = await fetch("/register", {
      method: "POST",
      headers:{
          "Content-Type":"application/json"
      },
      body:JSON.stringify(data_array)
  });
  const result = await response.json();
  console.log(result);
  console.log(data_array)
  if(result.status=="success"){
    alert("Registration Is Successfull....!");
    alert("Set up your profile now... !")
      profile=document.querySelector(".profile_setUp");
      document.querySelector(".container").style.display="none";
      profile.style.display="flex";
      profile.classList.add("styling")
      set_upProfile(result.id,result.username,result.user_dob,result.user_gender,result.user_fullName);
  }
}
})

document.querySelectorAll(".next").forEach(btn => {
  btn.addEventListener("click", () => {
    const isContinue=collectData(currentStep);
    if(isContinue){
    steps[currentStep].classList.remove("active_class");
    currentStep++;
    steps[currentStep].classList.add("active_class");
    }
  });
});

document.querySelectorAll(".back").forEach(btn => {
  btn.addEventListener("click", () => {
    steps[currentStep].classList.remove("active_class");
    currentStep--;
    steps[currentStep].classList.add("active_class");
  });
});