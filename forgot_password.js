const submit_btn=document.querySelector("#submit");
const form=document.querySelector("#form");

submit_btn.addEventListener("click",async(e)=>{
    e.preventDefault();
    const email=document.querySelector("#email").value;
    const password=document.querySelector("#password").value;
    const username=document.querySelector("#confirm_password").value;
        const resp=await fetch("/forgot-password",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({email,password,username}),
            credentials:"include"
        });
        const res=await resp.json();
        console.log(res);
        alert(res.message);
        form.reset();
})