const API = "https://allergy-scanner.onrender.com";

const userId =
  localStorage.getItem("userId");

if (!userId) {

  alert("Login first!");
  window.location = "login.html";
}

async function scanFood() {

  const food =
    document.getElementById("foodInput").value;

  const res = await fetch(
    API + "/analyze-food",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        food
      })
    }
  );

  const data = await res.json();

  const div =
    document.getElementById("result");

  if (data.result.safe) {

    div.innerHTML =
      "✅ SAFE TO EAT";
    div.style.color = "green";

  } else {

    div.innerHTML =
      "🚨 WARNING: " +
      data.result.matches.join(", ");
    div.style.color = "red";
  }
}

async function saveAllergies() {

  const allergies =
    document.getElementById("allergyInput")
      .value
      .split(",");

  await fetch(
    API + "/save-allergies",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        allergies
      })
    }
  );

  alert("Allergies saved ✅");
}



function showResultUI(data){

  const div =
    document.getElementById("result");

  div.innerHTML =
    `<p><b>Ingredients:</b>
      ${data.ingredients.join(", ")}</p>`;

  if(data.result.safe){

    div.innerHTML +=
      `<p class="safe">
        ✅ Safe to eat
      </p>`;

  }else{

    div.innerHTML +=
      `<p class="danger">
        🚨 Allergy detected:
        ${data.result.matches.join(", ")}
      </p>`;
  }
}
