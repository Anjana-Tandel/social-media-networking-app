login_btn=document.querySelector("#Login");
const PasswordField=document.querySelector("#Password");
const ShowPassword=document.querySelector("#showPassword");

ShowPassword.addEventListener("change",()=>{
    PasswordField.type=ShowPassword.checked?"text":"password";
    const lock_icon=document.querySelector("#lock_icon");
    if(ShowPassword.checked){
        lock_icon.style.color="#2563eb";
    }
    else{
        lock_icon.style.color="white";
    }

})

login_btn.addEventListener("click",async function(event){
    event.preventDefault();
    username=document.querySelector("#Username").value;
    password=document.querySelector("#Password").value;

    const resp=await fetch("/login",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify({
            username,
            password
        }),
        credentials:"include"
    });
    if(resp.redirected){
        alert("Login Is Successfull !")
        window.location.href=resp.url;
    }
    else{
        alert("Invalid Username/Password")
    }
})

