const API = "https://allergy-scanner.onrender.com";

async function login(){

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  const res = await fetch(
    API + "/login",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        email,
        password
      })
    }
  );

  const data = await res.json();

  if(data.userId){

    localStorage.setItem(
      "userId",
      data.userId
    );

    window.location =
      "dashboard.html";

  }else{

    alert("Login failed");
  }
}
